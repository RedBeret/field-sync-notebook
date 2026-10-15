import type { NetworkMode, QueueItem, SyncResult, WorkspaceState } from "../types";

const delay = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

function applySuccessfulQueueItem(state: WorkspaceState, item: QueueItem) {
  const updates = state.updates.map((update) =>
    update.id === item.updateId && update.status !== "conflict" ? { ...update, status: "synced" as const } : update,
  );
  return updates;
}

export async function simulateSync(state: WorkspaceState, onlyQueueId?: string): Promise<SyncResult> {
  await delay(650);

  if (state.networkMode === "offline") {
    throw new Error("No connection. Changes remain safely on this device.");
  }

  const targets = onlyQueueId ? state.queue.filter((item) => item.id === onlyQueueId) : state.queue;
  let updates = state.updates;
  const completedIds = new Set<string>();

  for (const item of targets) {
    if (item.status === "conflict") continue;
    if (state.networkMode === "degraded" && item.id === "queue-road-condition") continue;
    updates = applySuccessfulQueueItem({ ...state, updates }, item);
    completedIds.add(item.id);
  }

  const queue = state.queue.map((item) => {
    if (state.networkMode === "degraded" && targets.some((target) => target.id === item.id) && item.id === "queue-road-condition") {
      return { ...item, status: "error" as const };
    }
    return item;
  }).filter((item) => !completedIds.has(item.id));

  const syncedCount = completedIds.size;
  const message = state.networkMode === "degraded"
    ? `${syncedCount} change${syncedCount === 1 ? "" : "s"} synced. Remaining work stays queued.`
    : `${syncedCount} change${syncedCount === 1 ? "" : "s"} synced successfully.`;

  return { updates, queue, message };
}

interface ApiSyncResponse {
  results: Array<{ id: string; status: QueueItem["status"] | "synced"; reason?: string }>;
}

function applyApiResults(state: WorkspaceState, response: ApiSyncResponse, targets: QueueItem[]): SyncResult {
  const results = new Map(response.results.map((result) => [result.id, result]));
  const targetIds = new Set(targets.map((item) => item.id));
  const queue = state.queue.flatMap((item) => {
    if (!targetIds.has(item.id)) return [item];
    const result = results.get(item.id);
    if (!result || result.status === "synced") return [];
    return [{ ...item, status: result.status }];
  });
  const updates = state.updates.map((update) => {
    const item = targets.find((target) => target.updateId === update.id);
    if (!item) return update;
    const status = results.get(item.id)?.status;
    return status ? { ...update, status } : update;
  });
  const syncedCount = response.results.filter((result) => result.status === "synced").length;
  const message = `${syncedCount} change${syncedCount === 1 ? "" : "s"} synced through the field service.`;
  return { updates, queue, message };
}

export async function syncWorkspace(state: WorkspaceState, onlyQueueId?: string): Promise<SyncResult> {
  const targets = onlyQueueId ? state.queue.filter((item) => item.id === onlyQueueId) : state.queue;
  if (typeof fetch !== "function") return simulateSync(state, onlyQueueId);

  try {
    const response = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspace_id: "harbor-relay",
        mode: state.networkMode,
        changes: targets.map((item) => ({
          id: item.id,
          title: item.title,
          status: item.status === "syncing" ? "queued" : item.status,
          details: state.updates.find((update) => update.id === item.updateId)?.details ?? "",
        })),
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({})) as { detail?: string };
      throw new Error(payload.detail ?? "The field service could not complete this sync.");
    }

    return applyApiResults(state, await response.json() as ApiSyncResponse, targets);
  } catch (error) {
    if (error instanceof TypeError) return simulateSync(state, onlyQueueId);
    throw error;
  }
}

export function networkLabel(mode: NetworkMode): string {
  if (mode === "online") return "Connection online";
  if (mode === "offline") return "Working offline";
  return "Connection degraded";
}
