import { freshSeedState } from "../data/seed";
import type { WorkspaceState } from "../types";

export const STORAGE_KEY = "field-sync.workspace.v1";

function isWorkspaceState(value: unknown): value is WorkspaceState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<WorkspaceState>;
  return candidate.version === 1 && Array.isArray(candidate.updates) && Array.isArray(candidate.queue);
}

export function loadWorkspace(): WorkspaceState {
  if (typeof window === "undefined") return freshSeedState();

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return freshSeedState();
    const parsed: unknown = JSON.parse(stored);
    return isWorkspaceState(parsed) ? parsed : freshSeedState();
  } catch {
    return freshSeedState();
  }
}

export function saveWorkspace(state: WorkspaceState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearWorkspace(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
