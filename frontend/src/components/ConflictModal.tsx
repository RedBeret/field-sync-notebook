import { GitMerge, Laptop, Server } from "lucide-react";
import type { FieldUpdate } from "../types";
import { Modal } from "./Modal";

export type ConflictChoice = "local" | "remote" | "merge";

interface ConflictModalProps {
  update: FieldUpdate;
  onChoose: (choice: ConflictChoice) => void;
  onClose: () => void;
}

export function ConflictModal({ update, onChoose, onClose }: ConflictModalProps) {
  return (
    <Modal label="Resolve conflict" onClose={onClose} size="large">
      <div className="modal-heading modal-heading--conflict"><h2>Resolve conflict</h2><h3>{update.title}</h3><p>Local and remote versions were changed.</p></div>
      <div className="version-compare">
        <section>
          <h4><Laptop aria-hidden="true" size={18} />Local version</h4>
          <small>{update.createdAt} · {update.author}</small>
          <p>{update.details}</p>
        </section>
        <section>
          <h4><Server aria-hidden="true" size={18} />Remote version</h4>
          <small>{update.remoteCreatedAt} · {update.remoteAuthor}</small>
          <p>{update.remoteDetails}</p>
        </section>
      </div>
      <h4 className="choice-heading">What would you like to do?</h4>
      <div className="conflict-actions">
        <button onClick={() => onChoose("local")} type="button"><Laptop aria-hidden="true" size={18} /><strong>Keep local</strong><small>Use your version</small></button>
        <button onClick={() => onChoose("remote")} type="button"><Server aria-hidden="true" size={18} /><strong>Use remote</strong><small>Use the remote version</small></button>
        <button className="merge-choice" onClick={() => onChoose("merge")} type="button"><GitMerge aria-hidden="true" size={18} /><strong>Merge changes</strong><small>Combine both versions</small></button>
      </div>
      <div className="modal-actions modal-actions--end"><button className="button button--outline" onClick={onClose} type="button">Cancel</button></div>
    </Modal>
  );
}
