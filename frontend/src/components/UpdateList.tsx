import { ChevronRight, ClipboardCheck, FileText, MapPin, Plus } from "lucide-react";
import type { FieldUpdate, ViewFilter } from "../types";
import { StatusBadge } from "./StatusBadge";

interface UpdateListProps {
  filter: ViewFilter;
  selectedId: string;
  updates: FieldUpdate[];
  onAdd: () => void;
  onFilter: (filter: ViewFilter) => void;
  onSelect: (id: string) => void;
}

const filters: Array<{ id: ViewFilter; label: string }> = [
  { id: "all", label: "All updates" },
  { id: "note", label: "Notes" },
  { id: "task", label: "Tasks" },
];

export function UpdateList({ filter, selectedId, updates, onAdd, onFilter, onSelect }: UpdateListProps) {
  const visibleUpdates = filter === "all" ? updates : updates.filter((update) => update.kind === filter);

  return (
    <section aria-labelledby="updates-heading">
      <div className="updates-toolbar">
        <div aria-label="Filter updates" className="filter-group" role="group">
          {filters.map((item) => (
            <button
              aria-pressed={filter === item.id}
              className={`filter-button ${filter === item.id ? "filter-button--active" : ""}`}
              key={item.id}
              onClick={() => onFilter(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
        <button className="button button--outline" onClick={onAdd} type="button">
          <Plus aria-hidden="true" size={19} />Add update
        </button>
      </div>
      <div className="update-list" id="updates-heading">
        {visibleUpdates.map((update) => {
          const Icon = update.kind === "task" ? ClipboardCheck : update.id === "north-road" ? MapPin : FileText;
          const isSelected = selectedId === update.id;
          return (
            <button
              aria-pressed={isSelected}
              className={`update-row ${isSelected ? "update-row--selected" : ""}`}
              key={update.id}
              onClick={() => onSelect(update.id)}
              type="button"
            >
              <Icon aria-hidden="true" className="update-row__icon" size={26} />
              <span className="update-row__copy">
                <strong>{update.title}</strong>
                <small>{update.createdAt}<span aria-hidden="true">•</span>{update.author}</small>
              </span>
              <StatusBadge status={update.status} />
              <ChevronRight aria-hidden="true" className="update-row__chevron" size={21} />
            </button>
          );
        })}
        {visibleUpdates.length === 0 ? <p className="empty-state">No updates match this view.</p> : null}
      </div>
    </section>
  );
}
