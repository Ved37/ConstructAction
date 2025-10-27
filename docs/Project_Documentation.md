# ConstrucAction – Project Documentation

Date: 2025-10-23

## Executive summary

ConstrucAction is a React + Vite application with protected authentication, a project dashboard, a per-project details page (documents and uploads), and a Q&A chat experience backed by a retrieval API. The frontend is styled with Tailwind classes (via the Vite Tailwind plugin) plus a few small CSS helpers. The app supports a development proxy to the backend for clean local development without CORS headaches.

Key features:

- Auth (login/register) with persistent JWT token and user profile.
- Dashboard that lists projects (supports visibility=all) and creating new projects.
- Project page with details, documents list, and PDF uploads.
- Q&A chat powered by POST /qa/ask (no sessions required).
- Mobile-friendly collapsible sidebar with quick prompts and recent questions.

## Architecture overview

- Frontend: React 19 + Vite 7, React Router v6, Tailwind (via @tailwindcss/vite), ESLint.
- State & context: React Context for authentication in `src/context/AuthContext.jsx`.
- Routing: `createBrowserRouter` with protected routes wrapped by `ProtectedRoute` and a global `Layout` that renders the `Header` on all pages except auth screens.
- API access: a minimal `apiFetch` wrapper in `src/lib/api.js` that adds JSON headers and Authorization.
- Project APIs: `src/lib/projects.js` encapsulates `/projects` endpoints.
- QA API: `src/lib/qa.js` encapsulates `/qa/ask` endpoint and source URL builder.

## Environments & configuration

- Vite proxy (development):
  - `vite.config.js` sets a dev server proxy when `VITE_API_PROXY` is defined.
  - Any request to `/api/*` is proxied to the backend (and `/api` is stripped).
- Environment variables (place in `.env.local` or shell):
  - `VITE_API_PROXY=http://localhost:8000` (recommended in dev)
  - `VITE_API_URL=http://localhost:8000` (alternative when not using proxy)
  - `VITE_QA_BASE=http://localhost:8000` (base for QA when not using proxy)
- Storage keys in localStorage:
  - `ca_token` – JWT access token
  - `ca_current_user` – serialized user profile
  - `qa_recent_questions` – recent chat prompts

## How to run (dev)

1. Install dependencies
   - `npm install`
2. Start backend (outside this repo): ensure it is reachable at `http://localhost:8000`.
3. Set env for proxy (recommended):
   - Windows (PowerShell): `$env:VITE_API_PROXY="http://localhost:8000"`
   - Bash: `export VITE_API_PROXY=http://localhost:8000`
4. Start the dev server
   - `npm run dev`
5. Open the URL Vite prints (e.g., `http://localhost:5173`).

## Routing & pages

- `Layout` (`src/components/Layout.jsx`)
  - Always renders `Header` except on `/login` and `/register`.
- `ProtectedRoute` (`src/routes/ProtectedRoute.jsx`)
  - Redirects to `/login` if no authenticated user; otherwise renders child routes.
- Routes (`src/main.jsx`):
  - `/` – Project dashboard (protected)
  - `/projects/:projectId` – Project details (protected)
  - `/chat` – Q&A chat (protected)
  - `/login` and `/register` – Public auth pages (no header)

## Authentication

- Context: `src/context/AuthContext.jsx`
  - Loads saved user on mount.
  - `login({email,password})` – calls POST `/api/auth/login-json`; saves token and user.
  - `register(...)` – calls POST `/api/auth/register`; saves token and user.
  - `logout()` – clears token and user from localStorage.
- Guard: `src/routes/ProtectedRoute.jsx`
  - Shows a loading screen while auth state hydrates.
  - Redirects to `/login` when unauthenticated.

## Header & layout

- `src/components/Header.jsx` shows brand, Dashboard/Chat toggle, and login/user controls.
- Header is hidden on `/login` and `/register` via the `Layout` component.

## Dashboard – projects

- Files:
  - `src/components/ProjectDashboard.jsx` – page content.
  - `src/components/ProjectCard.jsx` – individual project tiles.
  - `src/lib/projects.js` – API helpers.
- Behavior:
  - Loads projects using `listProjects()` – defaults to `visibility=all`, `limit=20`, `offset=0`.
  - Create project via modal (POST `/api/projects`); refresh list and navigate to the new project.
  - Responsive grid, skeletons during load, tidy empty state.
- Card content maps new backend fields:
  - Status badge (active/completed/on_hold/cancelled), description, client, location, dates, last updated.

## Project page – details, documents, upload

- File: `src/pages/ProjectPage.jsx`
- Behavior:
  - Loads project details: GET `/api/projects/{id}?allow_all=true&visibility=all`.
  - Loads documents: GET `/api/projects/{id}/documents?visibility=all`.
  - Uploads PDFs (multi-file): POST `/api/projects/{id}/upload?visibility=all` (multipart/form-data, field name `files`).
  - Shows document cards; links to returned static URLs.

## Chat – QA (no sessions)

- Files:
  - `src/components/ChatInterface.jsx`
  - `src/components/QASidebar.jsx`
  - `src/lib/qa.js`
- Backend contract:
  - `POST /qa/ask` { question: string, top_k?: number }
  - Response: `{ answer, score, source, page_number, retrieved: [{ source, page_number, snippet }] }`
- Frontend mapping:
  - Uses `ask({ question, top_k: 5 })`.
  - Renders answer, and maps `retrieved` to citation cards with badges, page numbers, and copy-to-clipboard for snippets.
  - `buildSourceUrl(path)` prefixes relative paths with `VITE_QA_BASE`/`VITE_API_URL` or `http://localhost:8000` by default.
- Sidebar:
  - Quick prompts (insert into input via `qa-insert-text` event).
  - Recent prompts auto-saved in `qa_recent_questions`; can be cleared.
  - Mobile: collapsible overlay; desktop: always visible.

## API clients (frontend)

- `src/lib/api.js` – `apiFetch(path, { method, body, auth=true })`
  - Adds `Content-Type: application/json`, Authorization header with `ca_token`, and handles JSON response/errors.
  - Uses `VITE_API_PROXY` if set; otherwise `VITE_API_URL`.
- `src/lib/projects.js`
  - `listProjects({ visibility = "all", status, q, limit=20, offset=0 })` → GET `/api/projects?...`
  - `getProject(id, { allow_all = true })` → GET `/api/projects/{id}?allow_all=true&visibility=all`
  - `createProject(body)` → POST `/api/projects`
  - `listProjectDocuments(id)` → GET `/api/projects/{id}/documents?visibility=all`
  - `uploadProjectFiles(id, formData)` → POST `/api/projects/{id}/upload?visibility=all`
- `src/lib/qa.js`
  - `ask({ question, top_k })` → POST `{QA_BASE}/qa/ask`
  - `buildSourceUrl(path)` → absolute URL for `retrieved[].source`

## Backend endpoints (as used)

- Auth
  - POST `/auth/login-json`
  - GET `/auth/me`
- Projects
  - GET `/projects?visibility=all&limit&offset&status&q`
  - GET `/projects/{id}?allow_all=true&visibility=all`
  - POST `/projects`
  - GET `/projects/{id}/documents?visibility=all`
  - POST `/projects/{id}/upload?visibility=all` (multipart `files`)
- QA Chat
  - POST `/qa/ask`

## Error handling & UX

- All API helpers throw on non-2xx; UI shows concise error banners.
- Auth errors (401) trigger a logout and redirect to `/login` on protected pages.
- Chat shows a loading skeleton while waiting for answers.
- Upload shows a busy state on the button label ("Uploading…").

## Security & privacy notes

- JWT stored in localStorage (simple and convenient in this context). Consider `httpOnly` cookies for higher security.
- CORS handled via Vite proxy in dev; set proper `CORS_ORIGINS` on the backend for production.

## Theming & styling

- Tailwind utility classes for layout and spacing.
- Plain CSS helpers in `src/index.css` for `.btn-brand`, `.card`, `.badge`, `.badge-pdf`, `.skeleton` to keep build portability.
- Gradient hero on the dashboard; consistent button/link colors.

## Known limitations

- Chat is stateless (no sessions/history persisted across reloads).
- Dashboard currently displays all projects (visibility=all). Filters/search UI can be added easily.
- Native `<dialog>` is used for create-project modal; consider a portal/modal lib for broader browser support.

## Next steps (recommended)

- Add filters (status dropdown) and search (q) to the dashboard.
- Sort projects by `updated_at` desc; show count/pagination (limit/offset controls).
- Persist chat history locally (or via backend) for continuity.
- Add toasts/notifications (e.g., copy success, create success).
- Replace naive JWT storage with cookie-based auth if needed.

## Quick reference (file map)

- Components
  - `src/components/Header.jsx` – global header
  - `src/components/Layout.jsx` – wraps pages, hides header on auth routes
  - `src/components/ProjectDashboard.jsx` – project list page
  - `src/components/ProjectCard.jsx` – project tiles
  - `src/components/QASidebar.jsx` – prompts & recents
  - `src/components/ChatInterface.jsx` – QA chat UI
- Pages
  - `src/pages/Login.jsx`, `src/pages/Register.jsx`, `src/pages/ProjectPage.jsx`
- Lib
  - `src/lib/api.js`, `src/lib/projects.js`, `src/lib/qa.js`, `src/lib/chat.js` (legacy session APIs)
- Routing
  - `src/main.jsx`, `src/routes/ProtectedRoute.jsx`
- Context
  - `src/context/AuthContext.jsx`

## Runbook – minimal smoke test

- Dashboard loads projects (200 from GET `/projects`).
- Create project works (201 from POST `/projects`).
- Project page loads details (200 from GET `/projects/{id}?allow_all=true&visibility=all`).
- Upload PDF returns uploaded summary and document list updates.
- Chat: send "Where is the footing detail?" → returns answer + retrieved sources.
