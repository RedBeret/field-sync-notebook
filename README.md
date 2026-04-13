# Field Sync Notebook

Field Sync Notebook is an offline-first handoff and field-notes workspace for teams operating with degraded connectivity, shifting ownership, and time-sensitive tasks.

![Field Sync Notebook preview](docs/preview.svg)

This project is designed to show the workflow and resilience side of the portfolio:

- offline-aware product thinking
- sync queues and conflict handling
- operator notes, tasks, and attachments in one place
- pragmatic full-stack design for disconnected environments

## Current MVP

- Workspace catalog with sync-state overview
- Offline queue for pending notes and tasks
- Manual sync action with connection-mode awareness
- Field notes, task cards, attachments, and conflict visibility
- Exportable handoff summary after sync

## What This Demonstrates

- Designing around degraded connectivity instead of assuming perfect network conditions
- Modeling local queue, sync, and conflict states in a way users can actually understand
- Building workflow software for teams that need clean handoffs across shifts and locations
- Treating resilience and clarity as product features, not afterthoughts

## Stack

- Frontend: React, TypeScript, Vite
- Backend: FastAPI
- Data: seeded workspace and sync-state payloads

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8030
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies API traffic to `http://127.0.0.1:8030`.

## Verification

- `python -m unittest discover -s backend\tests -v`
- `python -m compileall backend\app`
- `npm run build`
