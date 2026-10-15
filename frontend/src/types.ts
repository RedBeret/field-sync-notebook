export type UpdateKind = "note" | "task";
export type SyncState = "queued" | "syncing" | "synced" | "conflict" | "error";
export type NetworkMode = "offline" | "degraded" | "online";
export type ViewFilter = "all" | "note" | "task";

export interface FieldUpdate {
  id: string;
  kind: UpdateKind;
  title: string;
  details: string;
  owner: string;
  author: string;
  createdAt: string;
  status: SyncState;
  remoteDetails?: string;
  remoteAuthor?: string;
  remoteCreatedAt?: string;
}

export interface QueueItem {
  id: string;
  updateId?: string;
  kind: UpdateKind;
  title: string;
  createdAt: string;
  status: Exclude<SyncState, "synced">;
}

export interface WorkspaceState {
  version: 1;
  networkMode: NetworkMode;
  lastSyncedAt: string;
  updates: FieldUpdate[];
  queue: QueueItem[];
}

export interface SyncResult {
  updates: FieldUpdate[];
  queue: QueueItem[];
  message: string;
}
