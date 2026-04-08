from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Booking, TrainingSession, User, Pricing, Payment, PaymentStatus
from app.schemas.schemas import BookingCreate, BookingOut
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=BookingOut)
def create_booking(
    booking_in: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if session exists
    session = db.query(TrainingSession).filter(TrainingSession.id == booking_in.training_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Training session not found")
        
    # Check capacity
    current_bookings = db.query(Booking).filter(Booking.training_id == booking_in.training_id).count()
    if current_bookings >= session.capacity:
        raise HTTPException(status_code=400, detail="Training session is full")
        
    # Prevent duplicate booking
    existing = db.query(Booking).filter(
        Booking.training_id == booking_in.training_id,
        Booking.client_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already booked this session")

    db_booking = Booking(
        training_id=booking_in.training_id,
        client_id=current_user.id,
        status="confirmed"
    )
    db.add(db_booking)
    db.flush() # Get booking ID for payment
    
    # Calculate price
    price_obj = db.query(Pricing).filter(Pricing.user_id == current_user.id).first()
    if not price_obj:
        price_obj = db.query(Pricing).filter(Pricing.user_id == None).first()
    
    price = price_obj.price_per_session if price_obj else 0.0
    
    # Create payment record
    db_payment = Payment(
        booking_id=db_booking.id,
        client_id=current_user.id,
        amount=price,
        status=PaymentStatus.UNPAID
    )
    db.add(db_payment)
    
    db.commit()
    db.refresh(db_booking)
    return db_booking

@router.get("/my-bookings", response_model=List[BookingOut])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Booking).filter(Booking.client_id == current_user.id).all()

@router.get("/all", response_model=List[BookingOut])
def get_all_bookings(
    db: Session = Depends(get_db),
    coach: User = Depends(get_current_user)
):
    return db.query(Booking).all()

@router.put("/{booking_id}/pay")
def mark_payment_paid(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import datetime
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    payment = booking.payment
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    payment.status = PaymentStatus.PAID
    payment.payment_date = datetime.utcnow()
    db.commit()
    return {"message": "Payment marked as paid"}
