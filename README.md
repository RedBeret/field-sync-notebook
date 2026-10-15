# Field Sync Notebook

[![CI](https://github.com/RedBeret/field-sync-notebook/actions/workflows/ci.yml/badge.svg)](https://github.com/RedBeret/field-sync-notebook/actions/workflows/ci.yml)

An offline-first notes, tasks, sync-queue, and shift-handoff workspace for teams operating with degraded connectivity and changing ownership.

The app makes resilience visible: every local change has a clear state, queue actions are explicit, conflicts can be resolved without guesswork, and the next shift receives an exportable handoff instead of scattered context.

## What works

- Create notes or tasks and persist them locally between reloads.
- Switch among online, degraded, and offline demo modes.
- Manually sync all changes or retry/remove one queued change.
- See deterministic degraded-mode results and a safe offline error path.
- Compare local and remote versions, then keep, replace, or merge a conflict.
- Export a selected shift handoff as Markdown.
- Install the production build as a small offline-capable web app.
- Exercise equivalent sync and handoff behavior through the FastAPI service.

## Quick start

```bash
# Windows
run.bat

# Linux / macOS
bash start.sh
```

- Backend: `http://127.0.0.1:8000`
- Frontend: `http://127.0.0.1:4173`

## Run the client

```bash
cd frontend
npm install
npm run dev
```

Open `http://127.0.0.1:4173`.

## Run the API

```bash
cd backend
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt
.venv/Scripts/uvicorn app.main:app --reload --port 8000
```

The API docs are available at `http://127.0.0.1:8000/docs`.

## Verify

```bash
cd frontend
npm run check

cd ../backend
python -m pytest tests
```

## Design references

- `docs/design/field-sync-primary.png` — complete primary desktop surface.
- `docs/design/field-sync-states.png` — add, conflict, and handoff state details.

The production UI is code-native; the reference images are specifications, not screenshots embedded in the app.
