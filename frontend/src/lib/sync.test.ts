import { freshSeedState } from "../data/seed";
import { syncWorkspace } from "./sync";

describe("sync integration", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("applies successful results returned by the FastAPI service", async () => {
    const state = freshSeedState();
    state.networkMode = "online";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      results: [
        { id: "queue-pump", status: "synced" },
        { id: "queue-generator", status: "conflict" },
        { id: "queue-road-condition", status: "synced" },
      ],
    }), { status: 200, headers: { "Content-Type": "application/json" } })));

    const result = await syncWorkspace(state);

    expect(result.queue.map((item) => item.id)).toEqual(["queue-generator"]);
    expect(result.updates.find((update) => update.id === "pump-station")?.status).toBe("synced");
    expect(result.message).toContain("2 changes synced");
  });

  it("surfaces a service-provided offline error", async () => {
    const state = freshSeedState();
    state.networkMode = "offline";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      detail: "No connection. Changes remain on the device.",
    }), { status: 503, headers: { "Content-Type": "application/json" } })));

    await expect(syncWorkspace(state)).rejects.toThrow("Changes remain on the device");
  });

  it("falls back to the deterministic local simulator when the API is unavailable", async () => {
    const state = freshSeedState();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const result = await syncWorkspace(state);

    expect(result.queue.find((item) => item.id === "queue-road-condition")?.status).toBe("error");
    expect(result.queue.some((item) => item.id === "queue-pump")).toBe(false);
  });
});
