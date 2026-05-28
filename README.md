## Task Manager App

If the frontend shows `net::ERR_CONNECTION_REFUSED` for `http://localhost:8000/tasks`, the backend API is not running.

## Work Log (May 25, 2026)

This section documents the UI/navigation + Pomodoro refactor done today, what changed, and why.

### 1) Persistent left sidebar navigation (Claude-style)

**Goal**
- Move the main module navigation (Tasks / Planned / Journal) into a persistent left sidebar, always visible on desktop, with an active-tab highlight.

**What changed**
- Added a new sidebar component:
  - `Frontend/task-ai-app/src/components/Sidebar/Sidebar.jsx`
  - `Frontend/task-ai-app/src/components/Sidebar/Sidebar.css`
- Sidebar behavior:
  - Narrow rail by default (56px) with 3 icon+label buttons:
    - Tasks (checkmark)
    - Planned (calendar)
    - Journal (notebook)
  - Active tab uses a highlighted “pill” behind the icon.
  - Bottom of the sidebar renders the Pomodoro widget.
- Updated app layout to put sidebar + content in a flex row:
  - `Frontend/task-ai-app/src/App.jsx`
  - `Frontend/task-ai-app/src/App.css`
- Kept the existing “lifted state” module switching (no `react-router`), because the codebase already used `activeModule` state instead of routes.

**Why**
- A left rail keeps navigation visible and reduces the vertical space previously used by top tabs.
- The sidebar matches the requested Claude-like pattern and sets us up for more global tools (Pomodoro, future settings, etc.) living outside individual modules.

### 2) Pomodoro moved into sidebar + task label preserved

**Goal**
- Pomodoro should live globally (sidebar) instead of being inside `TasksModule`, while still showing the current task label.

**What changed**
- Removed the Pomodoro render from Tasks:
  - `Frontend/task-ai-app/src/modules/TasksModule.jsx` (removed `PomodoroWidget` import and JSX usage)
- Preserved “current task” label by lifting it up:
  - `TasksModule` computes the current task label and calls `onPomodoroTaskChange(currentTaskName)`.
  - `App` stores `pomodoroTaskLabel` and passes it into Pomodoro in the sidebar and mobile timer.

**Why**
- Pomodoro is a global tool; placing it in the sidebar makes it accessible from all modules.
- Lifting the label avoids duplicating Pomodoro logic across screens and keeps the “current task” UI coherent.

### 3) Pomodoro pill: icon when idle, countdown when running

**Goal**
- When the timer is not running: show a clock icon.
- When it is running: show the time remaining (e.g., `12:34`).

**What changed**
- Implemented a clock SVG and conditionally rendered it vs. time text:
  - `Frontend/task-ai-app/src/components/PomodoroWidget/PomodoroWidget.jsx`
- Adjusted styling so the floating/mobile pill stays compact but readable:
  - `Frontend/task-ai-app/src/components/PomodoroWidget/PomodoroWidget.css`

**Why**
- On a tight UI (sidebar rail / phone), showing full timer text all the time is visually noisy.
- The icon communicates “timer exists here” without taking space until it’s actually counting down.

### 4) iPhone 12 / mobile UX improvements (overlay sidebar + floating Pomodoro)

**Problem observed**
- On iPhone widths, a persistent 56px sidebar makes the main content feel cramped.
- The Pomodoro in the bottom sidebar isn’t reachable when the sidebar is collapsed/hidden on mobile.

**What changed**
- Mobile sidebar becomes an overlay drawer:
  - When collapsed on small screens, it slides off-canvas (does not reserve layout width).
  - When expanded, it slides in as a drawer with a backdrop overlay you can tap to close.
  - Implemented in:
    - `Frontend/task-ai-app/src/components/Sidebar/Sidebar.css`
    - `Frontend/task-ai-app/src/App.css`
- Added a mobile “hamburger” button to open/close the drawer (positioned between the top nav and hero so it doesn’t block the LEX logo):
  - `Frontend/task-ai-app/src/App.jsx`
  - `Frontend/task-ai-app/src/App.css`
- Added a top-middle floating Pomodoro “chip” on mobile so you can always reach the timer:
  - Rendered by `App` as a second `PomodoroWidget` instance with `variant="floating"`.
  - Styled via `.tm-mobilePomo` in `Frontend/task-ai-app/src/App.css` and variant rules in `Frontend/task-ai-app/src/components/PomodoroWidget/PomodoroWidget.css`.
- Safe-area support for iPhone notch:
  - Sidebar padding uses `env(safe-area-inset-*)` in `Frontend/task-ai-app/src/components/Sidebar/Sidebar.css`.

**Why**
- Off-canvas drawer gives the content the full phone width while still keeping navigation accessible.
- A floating timer chip ensures Pomodoro is usable even when the sidebar is hidden on mobile.
- Safe-area padding prevents notch/home-indicator overlap on iPhones.

### 5) Pomodoro task dropdown (Active tasks + None)

**Goal**
- Pomodoro should allow choosing which task it is associated with (or None), rather than always showing the “first active task”.

**What changed**
- `TasksModule` now emits the list of active tasks to `App`:
  - Added optional `onTasksChange(activeTasks)` and calls it when task list changes.
  - File: `Frontend/task-ai-app/src/modules/TasksModule.jsx`
- `App` stores `pomodoroTasks` and passes them down into both Pomodoro instances (sidebar + mobile):
  - File: `Frontend/task-ai-app/src/App.jsx`
- `Sidebar` passes tasks into its Pomodoro:
  - File: `Frontend/task-ai-app/src/components/Sidebar/Sidebar.jsx`
- `PomodoroWidget` now renders a `<select>` in the footer with:
  - `None`
  - Active task titles
  - Persisted selection in `localStorage` under `tm-pomodoro-task-id`
  - Files:
    - `Frontend/task-ai-app/src/components/PomodoroWidget/PomodoroWidget.jsx`
    - `Frontend/task-ai-app/src/components/PomodoroWidget/PomodoroWidget.css` (select styling)

**Why**
- Users often want to time a specific task, not necessarily the first active one.
- `None` supports “general focus sessions” not tied to a task.
- Persisting selection avoids having to re-select after reload.

### 6) Backend fix: `/tasks/reorder` was being parsed as `/tasks/{task_id}`

**Issue**
- Drag-reorder in Tasks caused:
  - `422 Unprocessable Content` with a FastAPI validation error trying to parse `"reorder"` as an integer `task_id`.

**Root cause**
- In FastAPI, route matching is order-sensitive when a dynamic path like `/tasks/{task_id}` appears before a static route like `/tasks/reorder`.
- `/tasks/reorder` was being captured by `/tasks/{task_id}`.

**Fix**
- Moved static routes above the dynamic route:
  - `/tasks/reorder`
  - `/tasks/completed`
  - File: `Backend/app/main.py`

**Why**
- Ensures `/tasks/reorder` matches the correct handler and drag-reorder works reliably.

### Run Backend (FastAPI)

From `Backend/`:

- PowerShell: `.\.venv\Scripts\Activate.ps1; python -m app`
- Or: `.\.venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`

### Run Frontend (Vite)

From `Frontend/task-ai-app/`:

- `npm install`
- `npm run dev`

### Configure API Base URL

Set `VITE_API_BASE_URL` (e.g. in `Frontend/task-ai-app/.env`) to point the frontend at a different host/port:

- `VITE_API_BASE_URL=http://127.0.0.1:8000`
