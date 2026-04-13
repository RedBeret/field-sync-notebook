from __future__ import annotations

import sys
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app


class FieldSyncNotebookApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.client = TestClient(app)

    def test_healthcheck(self) -> None:
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_workspace_catalog(self) -> None:
        response = self.client.get("/api/workspaces")
        payload = response.json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload["defaultWorkspaceId"], "FSN-201")
        self.assertGreaterEqual(len(payload["workspaces"]), 3)

    def test_workspace_detail(self) -> None:
        response = self.client.get("/api/workspaces/FSN-201")
        payload = response.json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload["id"], "FSN-201")
        self.assertGreaterEqual(len(payload["notes"]), 1)
        self.assertGreaterEqual(len(payload["tasks"]), 1)

    def test_sync_workspace(self) -> None:
        response = self.client.post(
            "/api/workspaces/FSN-201/sync",
            json={
                "connectionMode": "degraded",
                "pendingNotes": [{"text": "Queued note"}],
                "pendingTasks": [{"title": "Queued task"}],
            },
        )
        payload = response.json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload["workspaceId"], "FSN-201")
        self.assertIn("result", payload)

    def test_missing_workspace_returns_404(self) -> None:
        response = self.client.get("/api/workspaces/FSN-999")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "Workspace not found")


if __name__ == "__main__":
    unittest.main()
