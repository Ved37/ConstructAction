import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict

import jwt
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext


router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_ALG = os.getenv("JWT_ALG", "HS256")
JWT_EXP_MIN = int(os.getenv("JWT_EXP_MIN", "60"))


# Very small in-memory user store for demo; replace with DB in production
USERS: Dict[str, Dict] = {}
USER_SEQ = 1


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class LoginJSONRequest(BaseModel):
    email: EmailStr
    password: str


def create_token(user: Dict) -> Dict:
    exp = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXP_MIN)
    payload = {
        "sub": str(user["user_id"]),
        "email": user["email"],
        "full_name": user.get("full_name"),
        "exp": exp,
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user["user_id"],
        "email": user["email"],
        "full_name": user.get("full_name"),
        "last_login": user.get("last_login"),
    }


@router.post("/register")
async def register(req: RegisterRequest):
    global USER_SEQ
    if req.email in USERS:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = pwd_context.hash(req.password)
    user = {
        "user_id": USER_SEQ,
        "email": req.email,
        "full_name": req.full_name or req.email.split("@")[0],
        "password_hash": hashed,
        "last_login": None,
    }
    USERS[req.email] = user
    USER_SEQ += 1
    return create_token(user)


def verify_user(email: str, password: str) -> Dict:
    user = USERS.get(email)
    if not user or not pwd_context.verify(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user["last_login"] = datetime.now(timezone.utc).isoformat()
    return user


@router.post("/login")
async def login(form: OAuth2PasswordRequestForm = Depends()):
    user = verify_user(form.username, form.password)
    return create_token(user)


@router.post("/login-json")
async def login_json(req: LoginJSONRequest):
    user = verify_user(req.email, req.password)
    return create_token(user)


@router.get("/me")
async def me(token: Optional[str] = None):
    # Simple decode for demo; in production use OAuth2/JWT dependency
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        return {"user_id": payload["sub"], "email": payload["email"], "full_name": payload.get("full_name")}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
