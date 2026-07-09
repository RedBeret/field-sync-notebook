from fastapi.testclient import TestClient

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app


client = TestClient(app)


def test_health() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "field-sync"}


def test_offline_sync_keeps_changes_local() -> None:
    response = client.post(
        "/api/sync",
        json={
            "mode": "offline",
            "changes": [{"id": "a", "title": "Pump note", "status": "queued"}],
        },
    )
    assert response.status_code == 503
    assert "remain on the device" in response.json()["detail"]


def test_degraded_sync_preserves_conflict_and_failed_route_change() -> None:
    response = client.post(
        "/api/sync",
        json={
            "mode": "degraded",
            "changes": [
                {"id": "a", "title": "Pump note", "status": "queued"},
                {"id": "b", "title": "Generator task", "status": "conflict"},
                {"id": "c", "title": "Road condition update", "status": "queued"},
            ],
        },
    )
    assert response.status_code == 200
    assert [item["status"] for item in response.json()["results"]] == ["synced", "conflict", "error"]


def test_handoff_is_rendered_as_markdown() -> None:
    response = client.post(
        "/api/handoffs",
        json={
            "workspace": "Harbor Relay",
            "prepared_by": "Alex D.",
            "note": "Review the generator conflict.",
            "changes": [{"id": "a", "title": "Pump note", "status": "queued", "details": "Valve tagged."}],
        },
    )
    assert response.status_code == 200
    assert response.json()["filename"] == "harbor-relay-handoff.md"
    assert "# Harbor Relay — Shift Handoff" in response.json()["markdown"]
    assert "Valve tagged." in response.json()["markdown"]
