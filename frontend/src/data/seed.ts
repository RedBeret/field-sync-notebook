import type { WorkspaceState } from "../types";

export const seedState: WorkspaceState = {
  version: 1,
  networkMode: "degraded",
  lastSyncedAt: "14:32",
  updates: [
    {
      id: "pump-station",
      kind: "note",
      title: "Pump station inspection",
      details: "Inspected pump station 3A. Vibration levels nominal. Minor leak at valve seal—tagged for repair. Photo attached.",
      owner: "Alex D.",
      author: "Alex D.",
      createdAt: "Today, 13:45",
      status: "queued",
    },
    {
      id: "generator-delivery",
      kind: "task",
      title: "Confirm generator fuel delivery",
      details: "Generator arrived on site. Fuel delivered and tank topped off to 80%. Delivery ticket attached.",
      owner: "Sam R.",
      author: "Sam R.",
      createdAt: "Today, 11:02",
      status: "conflict",
      remoteDetails: "Generator arrived on site. Fuel delivered and tank topped off to 75%. No delivery ticket yet.",
      remoteAuthor: "Jamie L.",
      remoteCreatedAt: "Today, 11:15",
    },
    {
      id: "north-road",
      kind: "note",
      title: "North access road reopened",
      details: "Standing water cleared at marker 12. North access is open to service vehicles; continue at reduced speed through the shoulder repair.",
      owner: "Jamie L.",
      author: "Jamie L.",
      createdAt: "Today, 09:18",
      status: "synced",
    },
  ],
  queue: [
    {
      id: "queue-pump",
      updateId: "pump-station",
      kind: "note",
      title: "Pump station inspection",
      createdAt: "Today, 13:45",
      status: "queued",
    },
    {
      id: "queue-generator",
      updateId: "generator-delivery",
      kind: "task",
      title: "Confirm generator fuel delivery",
      createdAt: "Today, 11:02",
      status: "conflict",
    },
    {
      id: "queue-road-condition",
      kind: "note",
      title: "Road condition update",
      createdAt: "Today, 10:15",
      status: "queued",
    },
  ],
};

export function freshSeedState(): WorkspaceState {
  return structuredClone(seedState);
}
