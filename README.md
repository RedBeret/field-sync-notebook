# Field Sync Notebook

An offline-first field notes and handoff tool for operators working with spotty connectivity and shifting teams.

The problem is straightforward: you're on shift, you're three bars of signal from nowhere, and the next operator needs to know what you actually found -- not what you think you told them, not what the whiteboard said two hours ago, but what's actually going on right now. Field Sync Notebook keeps notes, tasks, and attachments in sync across reconnects, and surfaces conflicts when the same record gets edited on both ends.

## How it works

### Opening a shift

You open the notebook. The workspace catalog shows you what's active. Your previous shift's handoff summary is right there -- what was flagged, what's in progress, what the outstanding issues are. You don't have to find someone to ask.

### Making notes in the field

You create field notes, add tasks, attach photos. Everything writes locally first. You see a sync status badge on each item: synced, pending, or conflict. Pending means it's queued, waiting for connectivity.

Signal drops. You keep working. Notes stay local, queued up. Nothing is lost.

### Syncing

You get signal back. You hit Sync. The app pushes your local queue to the server and pulls any changes from teammates. Most of the time it just works -- your notes land, their notes land, everyone is current.

### The conflict

Sometimes both ends edit the same note. Maybe you updated the tank pressure reading at 14:00, and your teammate on the other shift did too -- from a different location, with different info. When you sync, Field Sync Notebook shows you the conflict: both versions, side by side, with timestamps.

You read both. You pick the right one, or you merge the details. You resolve it and move on. No lost data, no guessing.

### Handing off

At shift end, you generate a handoff summary -- a clean export of your notes, tasks, and open conflicts. The next person opens their shift with a full picture.

## Features

- Workspace catalog with per-item sync state (synced / pending / conflict)
- Offline-first notes and tasks with local queue
- Conflict detection and resolution UI -- both versions shown, pick or merge
- Manual sync with connection-mode awareness
- Exportable handoff summary

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
