# Chat implementation handoff guide (ConstrucAction)

This document explains the current chat implementation in this branch and how to port or extend it. It focuses on what exists here today and highlights optional wiring for session lists and history.

## Overview

There is one primary chat flow present in this branch, already session-based:

- UI: `src/components/ChatInterface.jsx` + `src/components/Sidebar.jsx`
- Backend endpoints (via `src/lib/api.js`):
  - POST `/api/chat/sessions` (create session)
  - POST `/api/chat/sessions/:id/ask` (send a question within a session)
- A session is created on the first user message (if none exists yet). The UI does not yet list prior sessions or load history; the sidebar shows a local, static list.

What is NOT present in this branch:

- A separate stateless Q&A client (`qa.js`) and `QASidebar.jsx` do not exist here.
- Session listing and history UI are not wired (but can be added—see Optional section).

## Files and responsibilities

- `src/components/ChatInterface.jsx`

  - Chat UI: input, send button, message list, simple voice input using Web Speech API.
  - On first send, creates a server chat session via `createChatSession(projectId)`.
  - Sends questions via `askChat(sessionId, question)` and displays answer, references, model, confidence, chunks used.
  - Maintains local message list for the current session only (no cross-session history).

- `src/components/Sidebar.jsx`

  - Displays a static list of example chats and a "New Chat" button.
  - Calls `onNewChat()` to reset the current conversation in `ChatInterface`.
  - Does not call server APIs yet.

- `src/lib/api.js`

  - Auth and token helpers used by the rest of the app.
  - Chat endpoints in this branch:
    - `createChatSession(projectId?)` → POST `/api/chat/sessions` → `{ id | session_id }`
    - `askChat(sessionId, question)` → POST `/api/chat/sessions/:id/ask` → `{ answer | response, references[], confidence, ai_model, chunks_used }`

- `src/context/AuthContext.jsx`, `src/routes/ProtectedRoute.jsx`

  - Login/guard logic for protected routes (like the chat page).

- `vite.config.js`
  - Dev proxy support for `/api/*` when `VITE_API_PROXY` is defined.

## API endpoints and contracts (server expectations)

- Create chat session

  - POST `/api/chat/sessions`
  - Request: optional `{ project_id?: number }`
  - Response: `{ id: number }` or `{ session_id: number }`

- Ask a question in a session
  - POST `/api/chat/sessions/:sessionId/ask`
  - Request: `{ question: string }`
  - Response: `{ answer?: string, response?: string, references?: Array<{ source?: string } | string>, confidence?: number, ai_model?: string, chunks_used?: number }`
  - The UI prefers `answer` but falls back to `response`.

Optional (not yet used in the UI here, but commonly supported by backends):

- List sessions: GET `/api/chat/sessions` → `{ sessions: [{ session_id, title?, session_type?, message_count?, last_message_at? }] }`
- Get history: GET `/api/chat/sessions/:id/history` → `{ history: [{ chat_id, query, response, sources_cited: [...], created_at }] }`

## Environment and config

- `VITE_API_PROXY` — If set (e.g., `http://localhost:8000`), the dev server proxies `/api/*` to this target and strips the `/api` prefix (see `vite.config.js`).
- `VITE_API_URL` — Absolute base URL for API calls when not using the proxy. Used by `apiFetch()` via `getBaseUrl()`.

During development, the simplest is to set `VITE_API_PROXY=http://localhost:8000` and keep `getBaseUrl()` returning an empty string, so `fetch('/api/...')` is proxied correctly.

## How to bring this chat to another branch

Copy the following files (and adjust imports to your folder layout):

- Core UI and logic:

  - `src/components/ChatInterface.jsx`
  - `src/components/Sidebar.jsx` (optional placeholder until server sessions are listed)
  - `src/lib/api.js` (or extract only the chat helpers if you already have an API layer)

- Auth/guard and layout (if not present in target branch):
  - `src/context/AuthContext.jsx`
  - `src/routes/ProtectedRoute.jsx`
  - `src/components/Header.jsx` (if you want a nav entry to the chat page)

Wire the route:

- In your router, add a protected route to the chat page, for example:
  - `{ path: "/chat", element: <ChatInterface /> }` wrapped inside `ProtectedRoute`.

Configure environment:

- For local dev with backend on `http://localhost:8000`, set `VITE_API_PROXY=http://localhost:8000`.
- Otherwise set `VITE_API_URL` to your API base.

Install dependencies:

- This UI uses Tailwind classes already set up in this repo.
- No special markdown libs are used in this branch’s chat; if you need markdown rendering, add `react-markdown`, `remark-gfm`, `rehype-sanitize`.

## Optional: session list and history in the UI

If your backend supports listing sessions and fetching history, you can extend the current UI as follows.

1. Add API helpers in `src/lib/api.js` (names are suggestions):

- `listChatSessions()` → GET `/api/chat/sessions` → returns array of sessions.
- `getChatHistory(sessionId)` → GET `/api/chat/sessions/:id/history` → returns array of `{ query, response, sources_cited, created_at }`.

2. Update `Sidebar.jsx` to load sessions on mount and on refresh:

- Replace the static `chatItems` with server data from `listChatSessions()`.
- On click of a session, notify parent with `onSelectSession(sessionId)`.

3. Update `ChatInterface.jsx` to:

- Accept `sessionId` from the sidebar selection (or from route state/params).
- On mount or when `sessionId` changes, call `getChatHistory(sessionId)` and map to the local message shape:
  - user message: `{ role: 'user', content: item.query, timestamp: item.created_at }`
  - assistant message: `{ role: 'ai', content: item.response, references: item.sources_cited }`
- On send, keep using `askChat(sessionId, question)`.

4. Optional routing enhancement:

- Pass `{ state: { sessionId } }` when navigating to `/chat` from other pages, and read it in the chat page to load that session.

## Error handling and edge cases

- Auth: `apiFetch()` automatically adds `Authorization: Bearer <token>` for `/api/**` when a token is present. Handle 401 by logging out and redirecting to `/login` in UI flows where appropriate.
- Voice input: Depends on Web Speech API; not all browsers support it. The UI shows a gentle message and disables when unsupported.
- References: `askChat` currently surfaces `references` as provided by the backend; the UI renders them as a simple list.
- Local storage: This branch’s chat UI doesn’t store recents; if you adopt recents, guard localStorage calls.

## Quick “Try it” instructions

1. Ensure environment is set (one of):
   - `VITE_API_PROXY=http://localhost:8000` (dev proxy), or
   - `VITE_API_URL=https://api.example.com` (direct API)
2. Start dev server:
   - `npm install`
   - `npm run dev`
3. Login or register, navigate to Chat, ask a question, and confirm answers/sources populate.

## Notes on current state

- `ChatInterface.jsx` creates the session lazily (on first send) and uses it for subsequent messages.
- `Sidebar.jsx` is visual-only. It does not reflect server sessions yet.
- If your project page needs to open chat with a new or existing session, pass a `sessionId` via route state and teach `ChatInterface` to read and use it.

## Quality gates

- Dev server: PASS (task shows the Vite dev server is running in this workspace).
- Build: Not executed in this session.
- Lint/Typecheck: Not executed.
- Tests: None present for chat; consider adding a smoke test that mocks `apiFetch()` and asserts message rendering.

## Completion summary

- Documented the current session-based chat flow in this branch.
- Provided endpoint contracts, env configuration, copy list, and optional steps to add session list and history.
- If you want, I can add `listChatSessions()` and `getChatHistory()` helpers to `api.js` and prepare a minimal `Sidebar`+`ChatInterface` wiring to load and switch sessions without disrupting the existing UX.
