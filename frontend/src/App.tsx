import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { AddUpdateModal } from "./components/AddUpdateModal";
import { ConflictModal, type ConflictChoice } from "./components/ConflictModal";
import { HandoffModal } from "./components/HandoffModal";
import { NetworkSettings } from "./components/NetworkSettings";
import { Sidebar, type NavView } from "./components/Sidebar";
import { SyncRail } from "./components/SyncRail";
import { TopBar } from "./components/TopBar";
import { UpdateDetails } from "./components/UpdateDetails";
import { UpdateList } from "./components/UpdateList";
import { freshSeedState } from "./data/seed";
import { clearWorkspace, loadWorkspace, saveWorkspace } from "./lib/storage";
import { syncWorkspace } from "./lib/sync";
import type { FieldUpdate, NetworkMode, QueueItem, ViewFilter, WorkspaceState } from "./types";

type ModalState = "add" | "handoff" | "settings" | { type: "conflict"; updateId: string } | null;

const nowLabel = () => new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());

function App() {
  const [workspace, setWorkspace] = useState<WorkspaceState>(() => loadWorkspace());
  const [activeView, setActiveView] = useState<NavView>("notebook");
  const [filter, setFilter] = useState<ViewFilter>("all");
  const [selectedId, setSelectedId] = useState(() => workspace.updates[0]?.id ?? "");
  const [modal, setModal] = useState<ModalState>(null);
  const [syncingId, setSyncingId] = useState<string>();
  const [toast, setToast] = useState<string>();

  useEffect(() => saveWorkspace(workspace), [workspace]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(undefined), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const selectedUpdate = useMemo(
    () => workspace.updates.find((update) => update.id === selectedId),
    [selectedId, workspace.updates],
  );

  const navigate = (view: NavView) => {
    setActiveView(view);
    if (view === "tasks") setFilter("task");
    if (view === "notebook") setFilter("all");
    if (view === "handoff") setModal("handoff");
  };

  const runSync = async (queueId?: string) => {
    if (syncingId) return;
    setSyncingId(queueId ?? "all");
    setWorkspace((current) => ({
      ...current,
      queue: current.queue.map((item) => !queueId || item.id === queueId ? { ...item, status: item.status === "conflict" ? "conflict" : "syncing" } : item),
      updates: current.updates.map((update) => {
        const queued = current.queue.find((item) => item.updateId === update.id && (!queueId || item.id === queueId));
        return queued && update.status !== "conflict" ? { ...update, status: "syncing" } : update;
      }),
    }));

    try {
      const snapshot = loadWorkspace();
      const result = await syncWorkspace(snapshot, queueId);
      setWorkspace((current) => ({ ...current, updates: result.updates, queue: result.queue, lastSyncedAt: nowLabel() }));
      setToast(result.message);
    } catch (error) {
      setWorkspace((current) => ({
        ...current,
        queue: current.queue.map((item) => item.status === "syncing" ? { ...item, status: "queued" } : item),
        updates: current.updates.map((update) => update.status === "syncing" ? { ...update, status: "queued" } : update),
      }));
      setToast(error instanceof Error ? error.message : "Sync could not complete.");
    } finally {
      setSyncingId(undefined);
    }
  };

  const removeQueueItem = (queueId: string) => {
    setWorkspace((current) => {
      const item = current.queue.find((candidate) => candidate.id === queueId);
      return {
        ...current,
        queue: current.queue.filter((candidate) => candidate.id !== queueId),
        updates: current.updates.map((update) => update.id === item?.updateId && update.status !== "conflict" ? { ...update, status: "error" } : update),
      };
    });
    setToast("Removed from the sync queue. The local update is still on this device.");
  };

  const addUpdate = (input: { kind: "note" | "task"; title: string; details: string; owner: string }) => {
    const id = `local-${Date.now()}`;
    const createdAt = `Today, ${nowLabel()}`;
    const update: FieldUpdate = { id, ...input, author: "Alex D.", createdAt, status: "queued" };
    const queueItem: QueueItem = { id: `queue-${id}`, updateId: id, kind: input.kind, title: input.title, createdAt, status: "queued" };
    setWorkspace((current) => ({ ...current, updates: [update, ...current.updates], queue: [queueItem, ...current.queue] }));
    setSelectedId(id);
    setFilter("all");
    setModal(null);
    setToast("Update saved locally and added to the sync queue.");
  };

  const resolveConflict = (choice: ConflictChoice) => {
    if (!modal || typeof modal === "string" || modal.type !== "conflict") return;
    const updateId = modal.updateId;
    setWorkspace((current) => ({
      ...current,
      updates: current.updates.map((update) => {
        if (update.id !== updateId) return update;
        const details = choice === "remote" ? update.remoteDetails ?? update.details : choice === "merge" ? `${update.details}\n\nRemote note: ${update.remoteDetails ?? ""}` : update.details;
        return { ...update, details, status: "queued", remoteDetails: undefined, remoteAuthor: undefined, remoteCreatedAt: undefined };
      }),
      queue: current.queue.map((item) => item.updateId === updateId ? { ...item, status: "queued" } : item),
    }));
    setModal(null);
    setToast("Conflict resolved. The chosen version is queued to sync.");
  };

  const exportHandoff = (ids: string[], note: string) => {
    const selected = workspace.updates.filter((update) => ids.includes(update.id));
    const lines = [
      "# Harbor Relay — Shift Handoff",
      "",
      `Prepared by Alex D. at ${new Date().toLocaleString()}`,
      "",
      "## Handoff note",
      note || "No additional note.",
      "",
      "## Updates",
      ...selected.flatMap((update) => [
        `### ${update.title}`,
        `- Type: ${update.kind}`,
        `- Owner: ${update.owner}`,
        `- Sync state: ${update.status}`,
        `- Recorded: ${update.createdAt}`,
        "",
        update.details,
        "",
      ]),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "harbor-relay-handoff.md";
    anchor.click();
    URL.revokeObjectURL(url);
    setModal(null);
    setToast("Handoff summary exported.");
  };

  const setNetworkMode = (networkMode: NetworkMode) => {
    setWorkspace((current) => ({ ...current, networkMode }));
    setToast(`Connection mode set to ${networkMode}.`);
    setModal(null);
  };

  const resetDemo = () => {
    clearWorkspace();
    const fresh = freshSeedState();
    setWorkspace(fresh);
    setSelectedId(fresh.updates[0].id);
    setFilter("all");
    setActiveView("notebook");
    setModal(null);
    setToast("Demo data reset.");
  };

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} networkMode={workspace.networkMode} onNavigate={navigate} onOpenNetwork={() => setModal("settings")} />
      <div className="app-frame">
        <TopBar lastSyncedAt={workspace.lastSyncedAt} networkMode={workspace.networkMode} onOpenSettings={() => setModal("settings")} onSync={() => runSync()} syncing={syncingId === "all"} />
        <div className="workspace-layout">
          <main className="notebook-pane">
            <div className="page-heading">
              <h1>{activeView === "tasks" ? "Shift tasks" : "Shift notebook"}</h1>
              <p>Local changes stay on this device until sync.</p>
            </div>
            <UpdateList filter={filter} onAdd={() => setModal("add")} onFilter={setFilter} onSelect={setSelectedId} selectedId={selectedId} updates={workspace.updates} />
            <UpdateDetails onResolve={(updateId) => setModal({ type: "conflict", updateId })} update={selectedUpdate} />
            <p className="update-count">{workspace.updates.length} updates</p>
          </main>
          <SyncRail onHandoff={() => setModal("handoff")} onRemove={removeQueueItem} onRetry={(id) => runSync(id)} onRetryAll={() => runSync()} queue={workspace.queue} syncingId={syncingId} />
        </div>
      </div>

      {modal === "add" ? <AddUpdateModal onClose={() => setModal(null)} onSave={addUpdate} /> : null}
      {modal === "handoff" ? <HandoffModal onClose={() => setModal(null)} onExport={exportHandoff} updates={workspace.updates} /> : null}
      {modal === "settings" ? <NetworkSettings current={workspace.networkMode} onChange={setNetworkMode} onClose={() => setModal(null)} onReset={resetDemo} /> : null}
      {modal && typeof modal === "object" && modal.type === "conflict" ? (
        <ConflictModal onChoose={resolveConflict} onClose={() => setModal(null)} update={workspace.updates.find((update) => update.id === modal.updateId)!} />
      ) : null}
      {toast ? <div aria-live="polite" className="toast"><CheckCircle2 aria-hidden="true" size={18} /><span>{toast}</span><button aria-label="Dismiss notification" onClick={() => setToast(undefined)} type="button"><X aria-hidden="true" size={16} /></button></div> : null}
    </div>
  );
}

export default App;
