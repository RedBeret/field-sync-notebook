from __future__ import annotations

from copy import deepcopy
from typing import Any


WORKSPACES: list[dict[str, Any]] = [
    {
        "id": "FSN-201",
        "name": "Pier Integration Team",
        "region": "San Diego waterfront",
        "syncState": "degraded",
        "pending": 5,
        "summary": "Shift notes and hardware follow-ups are still being queued while the uplink is inconsistent.",
    },
    {
        "id": "FSN-202",
        "name": "Relay Support Cell",
        "region": "Field-east",
        "syncState": "online",
        "pending": 1,
        "summary": "Healthy sync posture with one draft note waiting for review.",
    },
    {
        "id": "FSN-203",
        "name": "Bench Recovery Team",
        "region": "Lab-west",
        "syncState": "offline",
        "pending": 7,
        "summary": "Offline queue is growing during bench recovery work. Handoff needs to stay local until the line returns.",
    },
]


WORKSPACE_DETAILS: dict[str, dict[str, Any]] = {
    "FSN-201": {
        "id": "FSN-201",
        "name": "Pier Integration Team",
        "region": "San Diego waterfront",
        "syncState": "degraded",
        "lastSync": "Apr 12, 2:18 PM",
        "summary": "The team is logging integration notes and follow-ups locally while the uplink comes and goes.",
        "notes": [
            {"author": "Steven", "time": "Apr 12, 1:52 PM", "text": "Power-cycle test passed after reseating the module cage."},
            {"author": "Shift lead", "time": "Apr 12, 2:09 PM", "text": "Keep the replacement harness nearby in case vibration returns during the next run."},
        ],
        "tasks": [
            {"title": "Verify harness routing after next run", "owner": "Integration", "status": "open"},
            {"title": "Capture post-run photos for the handoff", "owner": "Ops", "status": "open"},
            {"title": "Update installation checklist", "owner": "Steven", "status": "review"},
        ],
        "attachments": [
            {"name": "pier-run-photos.zip", "type": "images"},
            {"name": "handoff-notes.txt", "type": "notes"},
            {"name": "power-readings.csv", "type": "telemetry"},
        ],
        "conflicts": [
            {"title": "Task owner mismatch", "detail": "Two queued updates changed the owner for the same harness check task."},
        ],
    },
    "FSN-202": {
        "id": "FSN-202",
        "name": "Relay Support Cell",
        "region": "Field-east",
        "syncState": "online",
        "lastSync": "Apr 12, 3:04 PM",
        "summary": "This workspace is syncing normally and mainly being used for task handoff and status notes.",
        "notes": [
            {"author": "Ops", "time": "Apr 12, 2:58 PM", "text": "Relay path held steady during the final uplink check."},
        ],
        "tasks": [
            {"title": "Close uplink validation after sign-off", "owner": "QA", "status": "review"},
        ],
        "attachments": [
            {"name": "relay-status.json", "type": "summary"},
        ],
        "conflicts": [],
    },
    "FSN-203": {
        "id": "FSN-203",
        "name": "Bench Recovery Team",
        "region": "Lab-west",
        "syncState": "offline",
        "lastSync": "Apr 12, 11:46 AM",
        "summary": "Recovery work is continuing offline. The queue is growing, but the shift can still leave a clear local trail.",
        "notes": [
            {"author": "Recovery", "time": "Apr 12, 1:07 PM", "text": "Bench controller restart cleared the stuck sensor state."},
            {"author": "Steven", "time": "Apr 12, 1:42 PM", "text": "Need a clean hardware inventory before tomorrow morning’s handoff."},
        ],
        "tasks": [
            {"title": "Inventory spare boards", "owner": "Recovery", "status": "open"},
            {"title": "Re-run smoke test after restart", "owner": "Validation", "status": "open"},
            {"title": "Document sensor-state workaround", "owner": "Steven", "status": "review"},
        ],
        "attachments": [
            {"name": "bench-recovery-checklist.pdf", "type": "document"},
            {"name": "controller-restart-log.txt", "type": "log"},
        ],
        "conflicts": [
            {"title": "Duplicate inventory task", "detail": "Two queued updates created nearly identical spare-board tasks."},
            {"title": "Status overwrite pending", "detail": "An older offline note and a newer queued update touch the same smoke-test item."},
        ],
    },
}


def get_catalog() -> dict[str, Any]:
    return {
        "overview": {
            "workspaces": len(WORKSPACES),
            "pending": sum(workspace["pending"] for workspace in WORKSPACES),
            "offline": sum(1 for workspace in WORKSPACES if workspace["syncState"] == "offline"),
            "degraded": sum(1 for workspace in WORKSPACES if workspace["syncState"] == "degraded"),
        },
        "workspaces": deepcopy(WORKSPACES),
        "defaultWorkspaceId": "FSN-201",
    }


def get_workspace(workspace_id: str) -> dict[str, Any]:
    if workspace_id not in WORKSPACE_DETAILS:
        raise KeyError(workspace_id)

    return deepcopy(WORKSPACE_DETAILS[workspace_id])


def sync_workspace(workspace_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    detail = get_workspace(workspace_id)
    pending_notes = payload.get("pendingNotes", [])
    pending_tasks = payload.get("pendingTasks", [])
    connection_mode = payload.get("connectionMode", "online")

    merged_notes = len(detail["notes"]) + len(pending_notes)
    merged_tasks = len(detail["tasks"]) + len(pending_tasks)

    if connection_mode == "offline":
        result = "Queue kept local"
        synced = 0
    elif connection_mode == "degraded":
        result = "Partial sync completed"
        synced = max(1, len(pending_notes) // 2 + len(pending_tasks) // 2)
    else:
        result = "Sync completed"
        synced = len(pending_notes) + len(pending_tasks)

    return {
        "workspaceId": detail["id"],
        "connectionMode": connection_mode,
        "result": result,
        "syncedItems": synced,
        "remainingQueue": max(len(pending_notes) + len(pending_tasks) - synced, 0),
        "mergedNotes": merged_notes,
        "mergedTasks": merged_tasks,
        "conflicts": detail["conflicts"],
    }
