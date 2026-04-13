from __future__ import annotations

from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .data import get_catalog
from .data import get_workspace
from .data import sync_workspace

app = FastAPI(title="Field Sync Notebook API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/workspaces")
def workspace_catalog() -> dict:
    return get_catalog()


@app.get("/api/workspaces/{workspace_id}")
def workspace_detail(workspace_id: str) -> dict:
    try:
        return get_workspace(workspace_id)
    except KeyError as error:
        raise HTTPException(status_code=404, detail="Workspace not found") from error


@app.post("/api/workspaces/{workspace_id}/sync")
def workspace_sync(workspace_id: str, payload: dict) -> dict:
    try:
        return sync_workspace(workspace_id, payload)
    except KeyError as error:
        raise HTTPException(status_code=404, detail="Workspace not found") from error
