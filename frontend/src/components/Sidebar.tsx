import { ClipboardCheck, CloudSun, Handshake, Menu, NotebookTabs } from "lucide-react";
import { networkLabel } from "../lib/sync";
import type { NetworkMode } from "../types";

export type NavView = "notebook" | "tasks" | "handoff";

interface SidebarProps {
  activeView: NavView;
  networkMode: NetworkMode;
  onNavigate: (view: NavView) => void;
  onOpenNetwork: () => void;
}

const navItems = [
  { id: "notebook" as const, label: "Notebook", icon: NotebookTabs },
  { id: "tasks" as const, label: "Tasks", icon: ClipboardCheck },
  { id: "handoff" as const, label: "Handoff", icon: Handshake },
];

export function Sidebar({ activeView, networkMode, onNavigate, onOpenNetwork }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <Menu aria-hidden="true" size={27} />
        <span>Field Sync</span>
      </div>
      <nav aria-label="Primary navigation" className="primary-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isSelected = activeView === item.id;
          return (
            <button
              aria-current={isSelected ? "page" : undefined}
              className={`nav-item ${isSelected ? "nav-item--active" : ""}`}
              key={item.id}
              onClick={() => onNavigate(item.id)}
              type="button"
            >
              <Icon aria-hidden="true" size={23} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button className={`connection-card connection-card--${networkMode}`} onClick={onOpenNetwork} type="button">
          <CloudSun aria-hidden="true" size={20} />
          <span>
            <strong>{networkLabel(networkMode)}</strong>
            <small>{networkMode === "online" ? "Ready to sync" : networkMode === "offline" ? "Saved on this device" : "Working offline"}</small>
          </span>
        </button>
        <div className="profile">
          <span className="avatar" aria-hidden="true">AD</span>
          <span><strong>Alex D.</strong><small>Operator</small></span>
        </div>
      </div>
    </aside>
  );
}
