# ConstrucAction

ConstrucAction is a React + Vite app with authentication, a project dashboard, project details (documents and uploads), and a Q&A chat experience backed by a retrieval API.

- Frontend: React 19 + Vite 7, React Router v6, Tailwind plugin
- Auth: JWT via context; protected routes
- Dev proxy: Vite proxies `/api/*` to your backend to avoid CORS in development

For a complete guide (architecture, endpoints, environment, and runbook), see:

- docs/Project_Documentation.md

## Quick start

1. Install dependencies

- npm install

2. Configure backend URL (development)

- Export `VITE_API_PROXY` to your backend base (recommended for dev proxy)
  - Example: `export VITE_API_PROXY=http://localhost:8000`

3. Start the frontend

- npm run dev

Open the URL Vite prints (e.g., http://localhost:5173).

## Environment variables

- VITE_API_PROXY: Backend base for dev proxy (when set, `/api/*` requests are proxied)
- VITE_API_URL: Direct API base (used when proxy is not set)
- VITE_QA_BASE: Base URL for QA chat endpoint (defaults to API base)

## Key routes

- / – Project dashboard (protected)
- /projects/:projectId – Project details, documents, uploads (protected)
- /chat – Q&A chat with citations (protected)
- /login, /register – Public auth pages

## Notes

- In development, always call project endpoints with a `/api` prefix (e.g., `/api/projects`) so Vite can proxy to the backend.
- JWT and user profile are stored in localStorage for convenience.
