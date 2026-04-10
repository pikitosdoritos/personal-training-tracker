from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import TrainingType, User
from app.schemas.schemas import TrainingTypeCreate, TrainingTypeOut
from app.api.deps import get_current_coach

router = APIRouter()

@router.get("/", response_model=List[TrainingTypeOut])
def list_training_types(db: Session = Depends(get_db)):
    return db.query(TrainingType).all()

@router.post("/", response_model=TrainingTypeOut)
def create_training_type(
    type_in: TrainingTypeCreate, 
    db: Session = Depends(get_db),
    coach: User = Depends(get_current_coach)
):
    db_type = TrainingType(
        **type_in.dict(),
        coach_id=coach.id
    )
    db.add(db_type)
    db.commit()
    db.refresh(db_type)
    return db_type

@router.delete("/{type_id}")
def delete_type(
    type_id: int, 
    db: Session = Depends(get_db),
    coach: User = Depends(get_current_coach)
):
    t = db.query(TrainingType).filter(TrainingType.id == type_id, TrainingType.coach_id == coach.id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(t)
    db.commit()
    return {"ok": True}
