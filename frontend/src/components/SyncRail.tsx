import { AlertCircle, ChevronUp, ClipboardCheck, FileText, Handshake, MapPin, RefreshCw, Share2, Trash2 } from "lucide-react";
import type { QueueItem } from "../types";

interface SyncRailProps {
  queue: QueueItem[];
  syncingId?: string;
  onHandoff: () => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onRetryAll: () => void;
}

export function SyncRail({ queue, syncingId, onHandoff, onRemove, onRetry, onRetryAll }: SyncRailProps) {
  return (
    <aside className="sync-rail">
      <section className="queue-section">
        <div className="rail-heading">
          <h2>Sync queue</h2><ChevronUp aria-hidden="true" size={21} />
          <p>{queue.length} {queue.length === 1 ? "change" : "changes"} waiting</p>
        </div>
        <div className="queue-list">
          {queue.map((item) => {
            const Icon = item.kind === "task" ? ClipboardCheck : item.id === "queue-road-condition" ? MapPin : FileText;
            return (
              <div className="queue-row" key={item.id}>
                <Icon aria-hidden="true" size={21} />
                <div className="queue-row__copy">
                  <strong>{item.title}</strong>
                  <small>{item.createdAt}</small>
                </div>
                {item.status === "conflict" || item.status === "error" ? <AlertCircle aria-label={item.status} className="queue-alert" size={17} /> : null}
                <div className="queue-row__actions">
                  <button disabled={syncingId === item.id} onClick={() => onRetry(item.id)} type="button">
                    <RefreshCw aria-hidden="true" className={syncingId === item.id ? "spin" : undefined} size={15} />Retry
                  </button>
                  <button onClick={() => onRemove(item.id)} type="button"><Trash2 aria-hidden="true" size={15} />Remove</button>
                </div>
              </div>
            );
          })}
          {queue.length === 0 ? <p className="queue-empty">Everything is synced.</p> : null}
        </div>
        <button className="retry-all" disabled={queue.length === 0 || Boolean(syncingId)} onClick={onRetryAll} type="button">
          <RefreshCw aria-hidden="true" size={18} />Retry all
        </button>
      </section>
      <section className="handoff-section">
        <Handshake aria-hidden="true" size={25} />
        <h2>Handoff</h2>
        <p>Package your updates and notes for the next shift.</p>
        <button className="button button--handoff" onClick={onHandoff} type="button"><Share2 aria-hidden="true" size={19} />Prepare handoff</button>
      </section>
    </aside>
  );
}
