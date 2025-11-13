# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## ConstrucAction chat (RAG) – how to run

This branch adds a minimal FastAPI backend and chat UI. You can run the backend via Docker and the frontend via Vite.

### Backend

Env (optional but supported):

- DATABASE_URL: Postgres URL (optional). If missing, the API still starts and `/health` returns `db: not_configured`.
- CHUNKS_PKL_PATH: Path to a pickle file for chunks/index (default `./data/chunks.pkl`).
- CORS_ORIGINS: Comma-separated origins (default `*`).
- JWT_SECRET, JWT_ALG, JWT_EXP_MIN: Auth config.

Run with Docker:

```
docker compose up --build
```

Smoke test (examples):

- GET http://localhost:8000/ -> `{ "message": "ConstrucAction API is running" }`
- GET http://localhost:8000/health -> `{ "api": "ok", "db": "not_configured" }`
- GET http://localhost:8000/qa/ready -> status object

### Frontend

Create a `.env` file for local dev:

```
VITE_API_PROXY=http://localhost:8000
VITE_QA_BASE=http://localhost:8000
```

Then start Vite:

```
npm ci
npm run dev
```

Open http://localhost:5173

Routes:

- `/` -> Dashboard (protected)
- `/chat` -> Chat
- `/projects/:projectId` -> Project page

Auth endpoints are proxied to the backend under `/api/*` (dev only). The proxy rewrites `/api` -> ``.
