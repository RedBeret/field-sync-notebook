import { useState } from "react";
import { AlertCircle, ClipboardCheck, Download, FileText } from "lucide-react";
import type { FieldUpdate } from "../types";
import { Modal } from "./Modal";

interface HandoffModalProps {
  updates: FieldUpdate[];
  onClose: () => void;
  onExport: (ids: string[], note: string) => void;
}

export function HandoffModal({ updates, onClose, onExport }: HandoffModalProps) {
  const [selectedIds, setSelectedIds] = useState(() => updates.map((update) => update.id));
  const noteCount = updates.filter((update) => update.kind === "note").length;
  const taskCount = updates.filter((update) => update.kind === "task").length;
  const conflictCount = updates.filter((update) => update.status === "conflict").length;
  const [note, setNote] = useState(() => conflictCount
    ? "Please review generator fuel delivery conflict. Otherwise, all items are up to date."
    : "All included items are ready for the next shift.");

  const toggle = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);

  return (
    <Modal label="Prepare handoff" onClose={onClose}>
      <div className="modal-heading"><h2>Prepare handoff</h2><p>Harbor Relay</p></div>
      <div className="outgoing-shift"><strong>Outgoing shift</strong><span>Alex D. · Operator</span></div>
      <div className="handoff-counts">
        <span><FileText aria-hidden="true" size={20} /><strong>{noteCount}</strong><small>Notes</small></span>
        <span><ClipboardCheck aria-hidden="true" size={20} /><strong>{taskCount}</strong><small>Tasks</small></span>
        <span className={conflictCount ? "count-alert" : undefined}><AlertCircle aria-hidden="true" size={20} /><strong>{conflictCount}</strong><small>Conflicts</small></span>
      </div>
      <fieldset className="handoff-list"><legend>Updates to include</legend>{updates.map((update) => (
        <label key={update.id}><span><strong>{update.title}</strong><small>{update.createdAt} · {update.author}</small></span><em className={`queue-label queue-label--${update.status}`}>{update.status}</em><input checked={selectedIds.includes(update.id)} onChange={() => toggle(update.id)} type="checkbox" /></label>
      ))}</fieldset>
      <label className="handoff-note">Handoff note (optional)<textarea onChange={(event) => setNote(event.target.value)} rows={4} value={note} /></label>
      <div className="modal-actions"><button className="button button--primary" disabled={selectedIds.length === 0} onClick={() => onExport(selectedIds, note)} type="button"><Download aria-hidden="true" size={17} />Export summary</button><button className="button button--outline" onClick={onClose} type="button">Cancel</button></div>
    </Modal>
  );
}
