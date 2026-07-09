import { freshSeedState } from "../data/seed";
import { loadWorkspace, saveWorkspace, STORAGE_KEY } from "./storage";

describe("workspace storage", () => {
  beforeEach(() => window.localStorage.clear());

  it("returns fresh seed data when storage is empty", () => {
    expect(loadWorkspace().updates).toHaveLength(3);
  });

  it("round-trips a valid workspace", () => {
    const state = freshSeedState();
    state.networkMode = "offline";
    saveWorkspace(state);
    expect(loadWorkspace().networkMode).toBe("offline");
  });

  it("recovers from corrupt persisted data", () => {
    window.localStorage.setItem(STORAGE_KEY, "not-json");
    expect(loadWorkspace().updates[0].title).toBe("Pump station inspection");
  });
});
