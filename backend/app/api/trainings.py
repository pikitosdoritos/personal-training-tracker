from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import TrainingSession, User
from app.schemas.schemas import TrainingSessionCreate, TrainingSessionOut
from app.api.deps import get_current_coach, get_current_user

router = APIRouter()

@router.post("/", response_model=TrainingSessionOut)
def create_training(
    training_in: TrainingSessionCreate, 
    db: Session = Depends(get_db),
    coach: User = Depends(get_current_coach)
):
    # Double booking prevention check (simplified: check if coach has session at same time/date)
    existing = db.query(TrainingSession).filter(
        TrainingSession.coach_id == coach.id,
        TrainingSession.date == training_in.date,
        TrainingSession.start_time < training_in.end_time,
        TrainingSession.end_time > training_in.start_time
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Coach already has a session at this time")
        
    db_training = TrainingSession(
        **training_in.dict(),
        coach_id=coach.id
    )
    db.add(db_training)
    db.commit()
    db.refresh(db_training)
    return db_training

@router.get("/", response_model=List[TrainingSessionOut])
def list_trainings(db: Session = Depends(get_db)):
    return db.query(TrainingSession).all()

@router.get("/{training_id}", response_model=TrainingSessionOut)
def get_training(training_id: int, db: Session = Depends(get_db)):
    training = db.query(TrainingSession).filter(TrainingSession.id == training_id).first()
    if not training:
        raise HTTPException(status_code=404, detail="Training not found")
    return training
