import { useState, type FormEvent } from "react";
import { ClipboardCheck, FileText } from "lucide-react";
import type { UpdateKind } from "../types";
import { Modal } from "./Modal";

interface NewUpdateInput {
  kind: UpdateKind;
  title: string;
  details: string;
  owner: string;
}

interface AddUpdateModalProps {
  onClose: () => void;
  onSave: (input: NewUpdateInput) => void;
}

export function AddUpdateModal({ onClose, onSave }: AddUpdateModalProps) {
  const [kind, setKind] = useState<UpdateKind>("note");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [owner, setOwner] = useState("Alex D.");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !details.trim()) return;
    onSave({ kind, title: title.trim(), details: details.trim(), owner: owner.trim() || "Unassigned" });
  };

  return (
    <Modal label="Add update" onClose={onClose} size="small">
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-heading"><h2>Add update</h2><p>Save it locally now. Sync when the connection allows.</p></div>
        <div aria-label="Update type" className="type-toggle" role="group">
          <button aria-pressed={kind === "note"} onClick={() => setKind("note")} type="button"><FileText aria-hidden="true" size={17} />Note</button>
          <button aria-pressed={kind === "task"} onClick={() => setKind("task")} type="button"><ClipboardCheck aria-hidden="true" size={17} />Task</button>
        </div>
        <label>Title<input autoFocus onChange={(event) => setTitle(event.target.value)} placeholder="Update title" required value={title} /></label>
        <label>Details<textarea onChange={(event) => setDetails(event.target.value)} placeholder="Add details, observations, or next steps…" required rows={5} value={details} /></label>
        <label>Owner<input onChange={(event) => setOwner(event.target.value)} value={owner} /></label>
        <div className="modal-actions"><button className="button button--primary" type="submit">Save locally</button><button className="button button--outline" onClick={onClose} type="button">Cancel</button></div>
      </form>
    </Modal>
  );
}
