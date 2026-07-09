from fastapi.testclient import TestClient

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app


class FieldSyncApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.client = TestClient(app)

    def test_health(self) -> None:
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok", "service": "field-sync"})

    def test_offline_sync_keeps_changes_local(self) -> None:
        response = self.client.post(
            "/api/sync",
            json={
                "mode": "offline",
                "changes": [{"id": "a", "title": "Pump note", "status": "queued"}],
            },
        )
        self.assertEqual(response.status_code, 503)
        self.assertIn("remain on the device", response.json()["detail"])

    def test_degraded_sync_preserves_conflict_and_failed_route_change(self) -> None:
        response = self.client.post(
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
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [item["status"] for item in response.json()["results"]],
            ["synced", "conflict", "error"],
        )

    def test_handoff_is_rendered_as_markdown(self) -> None:
        response = self.client.post(
            "/api/handoffs",
            json={
                "workspace": "Harbor Relay",
                "prepared_by": "Alex D.",
                "note": "Review the generator conflict.",
                "changes": [{"id": "a", "title": "Pump note", "status": "queued", "details": "Valve tagged."}],
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["filename"], "harbor-relay-handoff.md")
        self.assertIn("# Harbor Relay — Shift Handoff", response.json()["markdown"])
        self.assertIn("Valve tagged.", response.json()["markdown"])


if __name__ == "__main__":
    unittest.main()
