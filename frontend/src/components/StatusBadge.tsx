import { AlertCircle, CheckCircle2, Clock3, LoaderCircle } from "lucide-react";
import type { SyncState } from "../types";

const labels: Record<SyncState, string> = {
  queued: "Queued",
  syncing: "Syncing",
  synced: "Synced",
  conflict: "Conflict",
  error: "Retry needed",
};

export function StatusBadge({ status }: { status: SyncState }) {
  const Icon = status === "synced" ? CheckCircle2 : status === "conflict" || status === "error" ? AlertCircle : status === "syncing" ? LoaderCircle : Clock3;
  return (
    <span className={`status-badge status-badge--${status}`}>
      <Icon aria-hidden="true" className={status === "syncing" ? "spin" : undefined} size={16} />
      {labels[status]}
    </span>
  );
}
