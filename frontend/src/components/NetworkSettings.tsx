import type { NetworkMode } from "../types";

interface NetworkSettingsProps {
  current: NetworkMode;
  onChange: (mode: NetworkMode) => void;
  onClose: () => void;
  onReset: () => void;
}

const modes: Array<{ id: NetworkMode; label: string; detail: string }> = [
  { id: "online", label: "Online", detail: "All available changes can sync" },
  { id: "degraded", label: "Degraded", detail: "Some changes may remain queued" },
  { id: "offline", label: "Offline", detail: "Everything stays on this device" },
];

export function NetworkSettings({ current, onChange, onClose, onReset }: NetworkSettingsProps) {
  return (
    <div className="settings-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section aria-label="Connection settings" className="settings-popover" role="dialog">
        <h2>Connection mode</h2>
        <p>Use demo modes to test resilient sync behavior.</p>
        <div className="mode-options">{modes.map((mode) => <button aria-pressed={current === mode.id} key={mode.id} onClick={() => onChange(mode.id)} type="button"><span className={`mode-dot mode-dot--${mode.id}`} /><span><strong>{mode.label}</strong><small>{mode.detail}</small></span></button>)}</div>
        <button className="reset-button" onClick={onReset} type="button">Reset demo data</button>
      </section>
    </div>
  );
}
