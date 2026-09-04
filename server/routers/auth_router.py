"""
server/routers/auth_router.py

Authentication & Profile Router for Smith AI using MongoDB Atlas
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

from database_mongo_auth import (
    create_user_mongo,
    authenticate_user_mongo,
    get_user_by_id_mongo,
    update_user_profile_mongo,
    decode_jwt_token,
    check_mongo_auth_health
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    role: Optional[str] = "Full Stack Developer"
    level: Optional[str] = "Mid Level"
    difficulty: Optional[str] = "Intermediate"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    level: Optional[str] = None
    difficulty: Optional[str] = None
    resumeContext: Optional[dict] = None

def get_current_user_payload(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required. Missing Bearer token.")
    token = authorization.split(" ")[1]
    payload = decode_jwt_token(token)
    if not payload or not payload.get("userId"):
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token.")
    return payload

@router.post("/signup")
async def signup(body: SignupRequest):
    try:
        result = create_user_mongo(
            name=body.name,
            email=body.email,
            password=body.password,
            role=body.role or "Full Stack Developer",
            level=body.level or "Mid Level",
            difficulty=body.difficulty or "Intermediate"
        )
        return {
            "ok": True,
            "message": "User registered successfully in MongoDB Atlas.",
            **result
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login")
async def login(body: LoginRequest):
    try:
        result = authenticate_user_mongo(
            email=body.email,
            password=body.password
        )
        return {
            "ok": True,
            "message": "Login successful.",
            **result
        }
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")

@router.get("/me")
async def get_me(payload: dict = Depends(get_current_user_payload)):
    user = get_user_by_id_mongo(payload["userId"])
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
    return {
        "ok": True,
        "user": user
    }

@router.post("/profile")
async def update_profile(body: ProfileUpdateRequest, payload: dict = Depends(get_current_user_payload)):
    try:
        updates = body.dict(exclude_unset=True)
        updated_user = update_user_profile_mongo(payload["userId"], updates)
        return {
            "ok": True,
            "message": "Profile updated successfully in MongoDB.",
            "user": updated_user
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@router.get("/health")
async def auth_health():
    health_data = check_mongo_auth_health()
    return {
        "status": "ok" if health_data.get("connected") else "degraded",
        "authEngine": "MongoDB Atlas + JWT (bcrypt)",
        "diagnostics": health_data
    }
