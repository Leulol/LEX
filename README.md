## Task Manager App

If the frontend shows `net::ERR_CONNECTION_REFUSED` for `http://localhost:8000/tasks`, the backend API is not running.

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
