import os
import pickle
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter()


class IngestChunksRequest(BaseModel):
    pickle_path: Optional[str] = None
    document_id: Optional[str] = None
    truncate_existing: Optional[bool] = False
    batch_size: Optional[int] = 100


@router.post("/chunks")
async def ingest_chunks(req: IngestChunksRequest):
    path = req.pickle_path or os.getenv("CHUNKS_PKL_PATH", "./data/chunks.pkl")
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    data = {
        "document_id": req.document_id or "demo-doc",
        "chunks": [
            {"id": 1, "text": "Foundation details..."},
            {"id": 2, "text": "Rebar schedule..."},
        ],
    }
    if req.truncate_existing and os.path.exists(path):
        os.remove(path)
    with open(path, "wb") as f:
        pickle.dump(data, f)
    return {"status": "ok", "path": path, "chunks": len(data["chunks"])}
