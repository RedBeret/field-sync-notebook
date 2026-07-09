from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


NetworkMode = Literal["offline", "degraded", "online"]
SyncStatus = Literal["queued", "syncing", "synced", "conflict", "error"]


class Change(BaseModel):
    id: str = Field(min_length=1)
    title: str = Field(min_length=1)
    status: SyncStatus
    details: str = ""


class SyncRequest(BaseModel):
    workspace_id: str = "harbor-relay"
    mode: NetworkMode
    changes: list[Change]


class ChangeResult(BaseModel):
    id: str
    status: SyncStatus
    reason: str | None = None


class SyncResponse(BaseModel):
    workspace_id: str
    synced_at: datetime
    results: list[ChangeResult]


class HandoffRequest(BaseModel):
    workspace: str = "Harbor Relay"
    prepared_by: str = "Alex D."
    note: str = ""
    changes: list[Change]


class HandoffResponse(BaseModel):
    filename: str
    markdown: str


app = FastAPI(
    title="Field Sync API",
    version="1.0.0",
    description="Deterministic sync and handoff endpoints for the Field Sync Notebook demo.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:4173", "http://localhost:4173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "field-sync"}


@app.post("/api/sync", response_model=SyncResponse)
def sync_changes(payload: SyncRequest) -> SyncResponse:
    if payload.mode == "offline":
        raise HTTPException(status_code=503, detail="No connection. Changes remain on the device.")

    results: list[ChangeResult] = []
    for change in payload.changes:
        if change.status == "conflict":
            results.append(ChangeResult(id=change.id, status="conflict", reason="Resolve the competing versions first."))
        elif payload.mode == "degraded" and "road" in change.title.lower():
            results.append(ChangeResult(id=change.id, status="error", reason="Remote route service is unavailable."))
        else:
            results.append(ChangeResult(id=change.id, status="synced"))

    return SyncResponse(
        workspace_id=payload.workspace_id,
        synced_at=datetime.now(timezone.utc),
        results=results,
    )


@app.post("/api/handoffs", response_model=HandoffResponse)
def create_handoff(payload: HandoffRequest) -> HandoffResponse:
    lines = [
        f"# {payload.workspace} — Shift Handoff",
        "",
        f"Prepared by {payload.prepared_by}",
        "",
        "## Handoff note",
        payload.note or "No additional note.",
        "",
        "## Updates",
    ]
    for change in payload.changes:
        lines.extend(
            [
                f"### {change.title}",
                f"- Sync state: {change.status}",
                "",
                change.details,
                "",
            ]
        )

    return HandoffResponse(
        filename="harbor-relay-handoff.md",
        markdown="\n".join(lines),
    )
