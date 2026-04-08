from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.models import User, UserRole
from app.core import security
from datetime import timedelta
import uuid

router = APIRouter()

# Only initialise SSO clients if credentials are provided
_google_sso = None
_github_sso = None

def get_google_sso():
    global _google_sso
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=503, detail="Google OAuth not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env")
    if _google_sso is None:
        try:
            from fastapi_sso.sso.google import GoogleSSO as GSSO
        except ImportError:
            from fastapi_sso.sso.google import Googlesso as GSSO # Fallback if needed
            
        _google_sso = GSSO(
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            scope=["openid", "email", "profile"],
            redirect_uri="http://localhost:8000/api/auth/google/callback"
        )
    return _google_sso

def get_github_sso():
    global _github_sso
    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        raise HTTPException(status_code=503, detail="GitHub OAuth not configured. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to backend/.env")
    if _github_sso is None:
        try:
            from fastapi_sso.sso.github import GithubSSO as GSSO
        except ImportError:
            from fastapi_sso.sso.github import GitHubSSO as GSSO
            
        _github_sso = GSSO(
            client_id=settings.GITHUB_CLIENT_ID,
            client_secret=settings.GITHUB_CLIENT_SECRET,
            redirect_uri="http://localhost:8000/api/auth/github/callback"
        )
    return _github_sso

@router.get("/google/login")
async def google_login():
    try:
        sso = get_google_sso()
        return await sso.get_login_redirect()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google login init error: {str(e)}")

@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    try:
        sso = get_google_sso()
        user = await sso.verify_and_process(request)
        if not user or not user.email:
            raise HTTPException(status_code=400, detail="Could not retrieve email from Google")
        return await handle_social_login(user.email, user.display_name or user.email, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google auth callback error: {str(e)}")

@router.get("/github/login")
async def github_login():
    try:
        sso = get_github_sso()
        return await sso.get_login_redirect()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GitHub login init error: {str(e)}")

@router.get("/github/callback")
async def github_callback(request: Request, db: Session = Depends(get_db)):
    try:
        sso = get_github_sso()
        user = await sso.verify_and_process(request)
        if not user:
            raise HTTPException(status_code=400, detail="GitHub authentication failed")
        # GitHub may not return a public email; fall back to a placeholder
        email = user.email or f"github_{user.id}@noemail.local"
        return await handle_social_login(email, user.display_name or email, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GitHub auth callback error: {str(e)}")

async def handle_social_login(email: str, name: str, db: Session):
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        db_user = User(
            email=email,
            full_name=name,
            hashed_password=security.get_password_hash(str(uuid.uuid4())),
            role=UserRole.CLIENT
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = security.create_access_token(db_user.email, expires_delta=access_token_expires)
    return RedirectResponse(url=f"http://localhost:3000/login?token={token}")
