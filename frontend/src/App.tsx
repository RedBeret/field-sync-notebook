import { startTransition, useDeferredValue, useEffect, useState } from "react";

type WorkspaceSummary = {
    id: string;
    name: string;
    region: string;
    syncState: string;
    pending: number;
    summary: string;
};

type Catalog = {
    overview: {
        workspaces: number;
        pending: number;
        offline: number;
        degraded: number;
    };
    workspaces: WorkspaceSummary[];
    defaultWorkspaceId: string;
};

type WorkspaceDetail = {
    id: string;
    name: string;
    region: string;
    syncState: string;
    lastSync: string;
    summary: string;
    notes: { author: string; time: string; text: string }[];
    tasks: { title: string; owner: string; status: string }[];
    attachments: { name: string; type: string }[];
    conflicts: { title: string; detail: string }[];
};

type SyncResult = {
    workspaceId: string;
    connectionMode: string;
    result: string;
    syncedItems: number;
    remainingQueue: number;
    mergedNotes: number;
    mergedTasks: number;
    conflicts: { title: string; detail: string }[];
};

type PendingNote = {
    id: string;
    text: string;
};

type PendingTask = {
    id: string;
    title: string;
};

const syncModes = ["online", "degraded", "offline"];

const App = () => {
    const [catalog, setCatalog] = useState<Catalog | null>(null);
    const [detail, setDetail] = useState<WorkspaceDetail | null>(null);
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
    const [search, setSearch] = useState("");
    const [syncMode, setSyncMode] = useState("degraded");
    const [pendingNotes, setPendingNotes] = useState<PendingNote[]>([]);
    const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
    const [noteDraft, setNoteDraft] = useState("");
    const [taskDraft, setTaskDraft] = useState("");
    const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
    const [error, setError] = useState("");
    const deferredSearch = useDeferredValue(search);

    useEffect(() => {
        fetch("/api/workspaces")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to load workspaces");
                }

                return response.json();
            })
            .then((payload: Catalog) => {
                setCatalog(payload);
                setSelectedWorkspaceId(payload.defaultWorkspaceId);
            })
            .catch(() =>
                setError("Field Sync Notebook could not be loaded. Start the backend and try again.")
            );
    }, []);

    useEffect(() => {
        if (!selectedWorkspaceId) {
            return;
        }

        fetch(`/api/workspaces/${selectedWorkspaceId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to load workspace");
                }

                return response.json();
            })
            .then((payload: WorkspaceDetail) => {
                startTransition(() => {
                    setDetail(payload);
                    setSyncMode(payload.syncState);
                    setPendingNotes([]);
                    setPendingTasks([]);
                    setSyncResult(null);
                    setNoteDraft("");
                    setTaskDraft("");
                });
            })
            .catch(() =>
                setError("Workspace detail could not be loaded. Refresh and try again.")
            );
    }, [selectedWorkspaceId]);

    if (error) {
        return <main className="app-shell status-screen">{error}</main>;
    }

    if (!catalog || !detail) {
        return <main className="app-shell status-screen">Loading field notebook...</main>;
    }

    const filteredWorkspaces = catalog.workspaces.filter((workspace) => {
        const haystack = `${workspace.name} ${workspace.region} ${workspace.summary}`.toLowerCase();
        return haystack.includes(deferredSearch.trim().toLowerCase());
    });

    const queueCount = pendingNotes.length + pendingTasks.length;
    const emptyWorkspaces = filteredWorkspaces.length === 0;

    const removeQueuedNote = (noteId: string) => {
        setPendingNotes((current) => current.filter((note) => note.id !== noteId));
    };

    const removeQueuedTask = (taskId: string) => {
        setPendingTasks((current) => current.filter((task) => task.id !== taskId));
    };

    const addNote = () => {
        if (!noteDraft.trim()) {
            return;
        }

        setPendingNotes((current) => [
            ...current,
            {
                id: `note-${Date.now()}`,
                text: noteDraft.trim(),
            },
        ]);
        setNoteDraft("");
    };

    const addTask = () => {
        if (!taskDraft.trim()) {
            return;
        }

        setPendingTasks((current) => [
            ...current,
            {
                id: `task-${Date.now()}`,
                title: taskDraft.trim(),
            },
        ]);
        setTaskDraft("");
    };

    const runSync = () => {
        fetch(`/api/workspaces/${detail.id}/sync`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                connectionMode: syncMode,
                pendingNotes,
                pendingTasks,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to sync workspace");
                }

                return response.json();
            })
            .then((payload: SyncResult) => {
                setSyncResult(payload);

                if (payload.remainingQueue === 0) {
                    setPendingNotes([]);
                    setPendingTasks([]);
                } else {
                    setPendingNotes((current) => current.slice(Math.floor(current.length / 2)));
                    setPendingTasks((current) => current.slice(Math.floor(current.length / 2)));
                }
            })
            .catch(() =>
                setError("Sync request failed. Check the backend and try again.")
            );
    };

    const downloadSummary = () => {
        const packet = {
            workspace: detail.name,
            syncMode,
            pendingNotes,
            pendingTasks,
            syncResult,
        };
        const blob = new Blob([JSON.stringify(packet, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${detail.id.toLowerCase()}-handoff.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <main className="app-shell">
            <section className="hero">
                <div>
                    <p className="eyebrow">Field Sync Notebook</p>
                    <h1>Keep field notes, tasks, and handoffs moving when the network doesn’t.</h1>
                    <p className="hero-copy">
                        An offline-first notes and task workspace built for degraded comms,
                        shifting ownership, and fast handoffs.
                    </p>
                    <div className="hero-tags">
                        <span>Offline queue</span>
                        <span>Sync recovery</span>
                        <span>Shift handoff</span>
                    </div>
                </div>
                <div className="hero-panel">
                    <span>Current workspace</span>
                    <strong>{detail.name}</strong>
                    <p>{detail.summary}</p>
                    <div className="hero-panel__meta">
                        <span>{detail.region}</span>
                        <span>Last sync: {detail.lastSync}</span>
                        <span>{detail.syncState}</span>
                    </div>
                </div>
            </section>

            <section className="metric-grid">
                <article className="metric-card">
                    <span>Workspaces</span>
                    <strong>{catalog.overview.workspaces}</strong>
                </article>
                <article className="metric-card">
                    <span>Pending items</span>
                    <strong>{catalog.overview.pending + queueCount}</strong>
                </article>
                <article className="metric-card">
                    <span>Offline</span>
                    <strong>{catalog.overview.offline}</strong>
                </article>
                <article className="metric-card">
                    <span>Degraded</span>
                    <strong>{catalog.overview.degraded}</strong>
                </article>
            </section>

            <section className="content-grid">
                <article className="panel">
                    <div className="panel-heading">
                        <p className="eyebrow">Workspace catalog</p>
                        <h2>Team notebooks</h2>
                    </div>
                    <label className="control">
                        <span>Search</span>
                        <input
                            type="search"
                            placeholder="San Diego, recovery, relay..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </label>
                    {emptyWorkspaces ? (
                        <div className="empty-state">
                            No workspaces match the current search.
                        </div>
                    ) : (
                        <div className="workspace-list">
                            {filteredWorkspaces.map((workspace) => (
                                <button
                                    key={workspace.id}
                                    className={`workspace-card${
                                        workspace.id === detail.id ? " is-active" : ""
                                    }`}
                                    onClick={() => setSelectedWorkspaceId(workspace.id)}
                                    type="button"
                                >
                                    <div className="workspace-card__top">
                                        <div>
                                            <strong>{workspace.name}</strong>
                                            <span>{workspace.region}</span>
                                        </div>
                                        <span className={`badge badge--${workspace.syncState}`}>
                                            {workspace.syncState}
                                        </span>
                                    </div>
                                    <p>{workspace.summary}</p>
                                    <div className="workspace-card__meta">
                                        <span>{workspace.pending} pending</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </article>

                <article className="panel">
                    <div className="panel-heading panel-heading--split">
                        <div>
                            <p className="eyebrow">Queue and sync</p>
                            <h2>Keep work moving</h2>
                        </div>
                        <button className="export-button" onClick={downloadSummary} type="button">
                            Export handoff
                        </button>
                    </div>
                    <div className="catalog-controls">
                        <label className="control">
                            <span>Connection mode</span>
                            <select
                                value={syncMode}
                                onChange={(event) => setSyncMode(event.target.value)}
                            >
                                {syncModes.map((mode) => (
                                    <option key={mode} value={mode}>
                                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <div className="signal-card">
                            <span>Queued right now</span>
                            <strong>{queueCount}</strong>
                            <em className={`trend trend--${syncMode}`}>
                                {syncMode}
                            </em>
                        </div>
                    </div>
                    <div className="queue-summary">
                        <div className="signal-card">
                            <span>Queued notes</span>
                            <strong>{pendingNotes.length}</strong>
                            <em>Local only</em>
                        </div>
                        <div className="signal-card">
                            <span>Queued tasks</span>
                            <strong>{pendingTasks.length}</strong>
                            <em>Awaiting sync</em>
                        </div>
                        <div className="signal-card">
                            <span>Last result</span>
                            <strong>{syncResult ? syncResult.result : "Not run"}</strong>
                            <em>{syncResult ? `${syncResult.syncedItems} synced` : "Ready to sync"}</em>
                        </div>
                    </div>
                    <div className="composer-grid">
                        <div className="composer-card">
                            <span>Add note</span>
                            <textarea
                                value={noteDraft}
                                onChange={(event) => setNoteDraft(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                                        event.preventDefault();
                                        addNote();
                                    }
                                }}
                                placeholder="Log what happened while it is still fresh."
                            />
                            <div className="composer-footer">
                                <button className="action-button" onClick={addNote} type="button">
                                    Queue note
                                </button>
                                <span className="composer-hint">Ctrl+Enter</span>
                            </div>
                        </div>
                        <div className="composer-card">
                            <span>Add task</span>
                            <textarea
                                value={taskDraft}
                                onChange={(event) => setTaskDraft(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                                        event.preventDefault();
                                        addTask();
                                    }
                                }}
                                placeholder="Capture the follow-up before the next shift arrives."
                            />
                            <div className="composer-footer">
                                <button className="action-button" onClick={addTask} type="button">
                                    Queue task
                                </button>
                                <span className="composer-hint">Ctrl+Enter</span>
                            </div>
                        </div>
                    </div>
                    <button className="primary-button" onClick={runSync} type="button">
                        Run sync
                    </button>
                    {syncResult ? (
                        <div className="sync-result">
                            <strong>{syncResult.result}</strong>
                            <p>
                                Synced {syncResult.syncedItems} items, with {syncResult.remainingQueue} left in the local queue.
                            </p>
                            <div className="sync-result__meta">
                                <span>{syncResult.mergedNotes} notes merged</span>
                                <span>{syncResult.mergedTasks} tasks merged</span>
                                <span>{syncResult.conflicts.length} conflicts</span>
                            </div>
                        </div>
                    ) : null}
                </article>
            </section>

            <section className="content-grid content-grid--bottom">
                <article className="panel">
                    <div className="panel-heading">
                        <p className="eyebrow">Field notes</p>
                        <h2>What happened</h2>
                    </div>
                    <div className="stack-list">
                        {detail.notes.map((note) => (
                            <div className="stack-card" key={`${note.author}-${note.time}`}>
                                <strong>{note.author}</strong>
                                <span>{note.time}</span>
                                <p>{note.text}</p>
                            </div>
                        ))}
                        {pendingNotes.map((note) => (
                            <div className="stack-card stack-card--queued" key={note.id}>
                                <div className="stack-card__actions">
                                    <div>
                                        <strong>Queued note</strong>
                                        <span>local only</span>
                                    </div>
                                    <button
                                        className="inline-action"
                                        onClick={() => removeQueuedNote(note.id)}
                                        type="button"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <p>{note.text}</p>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="panel">
                    <div className="panel-heading">
                        <p className="eyebrow">Tasks and attachments</p>
                        <h2>Carry it forward</h2>
                    </div>
                    <div className="stack-list">
                        {detail.tasks.map((task) => (
                            <div className="stack-card" key={task.title}>
                                <div className="workspace-card__top">
                                    <strong>{task.title}</strong>
                                    <span className={`badge badge--${task.status}`}>
                                        {task.status}
                                    </span>
                                </div>
                                <p>{task.owner}</p>
                            </div>
                        ))}
                        {pendingTasks.map((task) => (
                            <div className="stack-card stack-card--queued" key={task.id}>
                                <div className="stack-card__actions">
                                    <div>
                                        <strong>{task.title}</strong>
                                        <span>queued</span>
                                    </div>
                                    <button
                                        className="inline-action"
                                        onClick={() => removeQueuedTask(task.id)}
                                        type="button"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                        <ul className="simple-list">
                            {detail.attachments.map((attachment) => (
                                <li key={attachment.name}>
                                    <strong>{attachment.name}</strong>
                                    <span>{attachment.type}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </article>

                <article className="panel">
                    <div className="panel-heading">
                        <p className="eyebrow">Conflicts</p>
                        <h2>Resolve after reconnect</h2>
                    </div>
                    <div className="stack-list">
                        {detail.conflicts.length ? (
                            detail.conflicts.map((conflict) => (
                                <div className="stack-card stack-card--alert" key={conflict.title}>
                                    <strong>{conflict.title}</strong>
                                    <p>{conflict.detail}</p>
                                </div>
                            ))
                        ) : (
                            <div className="stack-card">
                                <strong>No conflicts</strong>
                                <p>This workspace is currently clean.</p>
                            </div>
                        )}
                        {syncResult?.conflicts.map((conflict) => (
                            <div className="stack-card stack-card--alert" key={`sync-${conflict.title}`}>
                                <strong>{conflict.title}</strong>
                                <p>{conflict.detail}</p>
                            </div>
                        ))}
                    </div>
                </article>
            </section>
        </main>
    );
};

export default App;
