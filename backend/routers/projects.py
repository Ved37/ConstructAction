from typing import List, Optional

from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter()


class Project(BaseModel):
    id: str
    name: str
    description: Optional[str] = None


@router.get("/", response_model=List[Project])
async def list_projects():
    return [
        Project(id="p1", name="Tower A", description="High-rise residential"),
        Project(id="p2", name="Bridge X", description="River crossing"),
    ]


@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: str):
    return Project(id=project_id, name=f"Project {project_id}")
