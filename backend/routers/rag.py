import os
import pickle
from dataclasses import dataclass
from typing import List, Optional, Any, Dict

from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter()


class AskRequest(BaseModel):
    question: str
    top_k: int | None = 5
    mode: str | None = None  # "generative" | "extractive"
    max_tokens: int | None = None
    polish: bool | None = None
    return_raw: bool | None = None


class Source(BaseModel):
    path: str
    page: int | None = None
    snippet: str | None = None


class AskResponse(BaseModel):
    answer: str
    sources: List[Source] = []
    raw: Optional[Dict[str, Any]] = None


@router.get("/ready")
async def ready():
    path = os.getenv("CHUNKS_PKL_PATH", "./data/chunks.pkl")
    exists = os.path.exists(path)
    return {"chunks_path": path, "exists": exists}


def _dummy_answer(q: str) -> AskResponse:
    return AskResponse(
        answer=(
            "This is a demo RAG response. The backend can be configured to "
            "use FAISS + embeddings. For now, I'm returning a placeholder answer "
            f"to: '{q}'."
        ),
        sources=[
            Source(path="/files/specs.pdf", page=1, snippet="Example source snippet...")
        ],
    )


@router.post("/ask", response_model=AskResponse)
async def ask(req: AskRequest) -> AskResponse:
    # Minimal mock that can be extended to load FAISS index and models
    # if CHUNKS_PKL_PATH exists. Keep it robust when dependencies aren't present.
    chunks_path = os.getenv("CHUNKS_PKL_PATH", "./data/chunks.pkl")
    if os.path.exists(chunks_path):
        try:
            with open(chunks_path, "rb") as f:
                _ = pickle.load(f)
            # In real implementation: run similarity search and generate answer
            return _dummy_answer(req.question)
        except Exception:
            return _dummy_answer(req.question)
    else:
        return _dummy_answer(req.question)
