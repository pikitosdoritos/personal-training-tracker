from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import User, UserRole, Booking
from app.schemas.schemas import UserOut, UserUpdate
from app.api.deps import get_current_coach, get_current_user
from sqlalchemy import func

router = APIRouter()

@router.get("/", response_model=List[UserOut])
def list_clients(
    db: Session = Depends(get_db),
    coach: User = Depends(get_current_coach)
):
    clients = db.query(User).filter(User.role == UserRole.CLIENT).all()
    return clients

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_me(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_update.email and user_update.email != current_user.email:
        existing = db.query(User).filter(User.email == user_update.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = user_update.email
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.contact_info is not None:
        current_user.contact_info = user_update.contact_info
    db.commit()
    db.refresh(current_user)
    return current_user
