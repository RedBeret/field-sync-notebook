import { ChevronDown, Clock3, RefreshCw, Settings } from "lucide-react";
import { networkLabel } from "../lib/sync";
import type { NetworkMode } from "../types";

interface TopBarProps {
  lastSyncedAt: string;
  networkMode: NetworkMode;
  syncing: boolean;
  onSync: () => void;
  onOpenSettings: () => void;
}

export function TopBar({ lastSyncedAt, networkMode, syncing, onSync, onOpenSettings }: TopBarProps) {
  return (
    <header className="topbar">
      <button className="workspace-switcher" type="button">
        Harbor Relay <ChevronDown aria-hidden="true" size={17} />
      </button>
      <div className="topbar-actions">
        <span className={`network-status network-status--${networkMode}`}>
          <span aria-hidden="true" className="network-dot" />
          {networkLabel(networkMode)}
        </span>
        <span className="last-sync"><Clock3 aria-hidden="true" size={17} />Last sync {lastSyncedAt}</span>
        <button className="button button--primary sync-button" disabled={syncing} onClick={onSync} type="button">
          <RefreshCw aria-hidden="true" className={syncing ? "spin" : undefined} size={18} />
          {syncing ? "Syncing" : "Sync now"}
        </button>
        <button aria-label="Open connection settings" className="icon-button" onClick={onOpenSettings} type="button">
          <Settings aria-hidden="true" size={21} />
        </button>
      </div>
    </header>
  );
}
