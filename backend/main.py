import os
import asyncio
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    import asyncpg  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    asyncpg = None  # type: ignore

from .routers import auth, rag, ingest, projects


def create_app() -> FastAPI:
    app = FastAPI(title="ConstrucAction API", version="0.1.0")

    # CORS
    cors_origins = os.getenv("CORS_ORIGINS", "*")
    origins = [o.strip() for o in cors_origins.split(",") if o.strip()] or ["*"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Optional DB pool
    app.state.db_pool = None

    @app.on_event("startup")
    async def startup():  # noqa: D401
        """Attempt to connect to the database if DATABASE_URL is provided."""
        db_url = os.getenv("DATABASE_URL")
        if db_url and asyncpg:
            try:
                app.state.db_pool = await asyncpg.create_pool(db_url)
            except Exception:
                # Don't crash the app; health will report the error
                app.state.db_pool = None

    @app.on_event("shutdown")
    async def shutdown():
        pool = getattr(app.state, "db_pool", None)
        if pool:
            await pool.close()

    @app.get("/")
    async def root():
        return {"message": "ConstrucAction API is running"}

    @app.get("/health")
    async def health():
        # API status
        api_status = "ok"
        # DB status
        db_status: str
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            db_status = "not_configured"
        elif not asyncpg:
            db_status = "not_available: asyncpg not installed"
        else:
            try:
                pool = getattr(app.state, "db_pool", None)
                if not pool:
                    # try a quick one-shot connect
                    conn = await asyncpg.connect(db_url)
                    await conn.close()
                else:
                    async with pool.acquire() as conn:  # noqa: F841
                        pass
                db_status = "ok"
            except Exception as e:
                db_status = f"error: {e}"  # keep message concise
        return {"api": api_status, "db": db_status}

    # Routers
    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(rag.router, prefix="/qa", tags=["qa"])
    app.include_router(ingest.router, prefix="/ingest", tags=["ingest"])
    app.include_router(projects.router, prefix="/projects", tags=["projects"])

    return app


app = create_app()
