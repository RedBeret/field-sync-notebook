import { CalendarClock, ChevronDown, Edit3, Paperclip, UserRound } from "lucide-react";
import type { FieldUpdate } from "../types";
import { StatusBadge } from "./StatusBadge";

interface UpdateDetailsProps {
  update?: FieldUpdate;
  onResolve: (id: string) => void;
}

export function UpdateDetails({ update, onResolve }: UpdateDetailsProps) {
  if (!update) return null;

  return (
    <article className="update-details">
      <div className="update-details__heading">
        <h2>{update.title}</h2>
        <div className="update-details__actions">
          {update.status === "conflict" ? (
            <button className="button button--danger-outline" onClick={() => onResolve(update.id)} type="button">Resolve conflict</button>
          ) : (
            <span className="edit-control"><button className="button button--outline button--compact" type="button"><Edit3 aria-hidden="true" size={16} />Edit</button><button aria-label="More update actions" className="button button--outline button--compact button--square" type="button"><ChevronDown aria-hidden="true" size={16} /></button></span>
          )}
          <StatusBadge status={update.status} />
        </div>
      </div>
      <div className="update-details__meta">
        <span><CalendarClock aria-hidden="true" size={16} />{update.createdAt}</span>
        <span><UserRound aria-hidden="true" size={16} />{update.author}</span>
      </div>
      <p>{update.details}</p>
      {update.id === "pump-station" ? (
        <span className="attachment"><Paperclip aria-hidden="true" size={16} />IMG_4587.jpg <small>1.2 MB</small></span>
      ) : null}
    </article>
  );
}
