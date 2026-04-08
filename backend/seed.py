import sys
import os

# Add the current directory to sys.path to allow importing from 'app'
sys.path.append(os.getcwd())

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.models import Base, User, UserRole, TrainingSession, Booking, Pricing, Payment, PaymentStatus
from app.core.security import get_password_hash
from datetime import date, time, datetime, timedelta

def seed():
    # Create tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Create Coach
    coach_pwd = get_password_hash("coach123")
    coach = User(
        email="coach@example.com",
        hashed_password=coach_pwd,
        full_name="Coach Mike",
        role=UserRole.COACH,
        contact_info="555-0101"
    )
    db.add(coach)
    db.flush()
    
    # Global Pricing
    global_pricing = Pricing(price_per_session=50.0)
    db.add(global_pricing)
    
    # Create Clients
    client_pwd = get_password_hash("client123")
    clients = []
    for i in range(1, 6):
        client = User(
            email=f"client{i}@example.com",
            hashed_password=client_pwd,
            full_name=f"Client {i}",
            role=UserRole.CLIENT,
            contact_info=f"555-010{i}"
        )
        db.add(client)
        clients.append(client)
    db.flush()
    
    # Create Sessions
    sessions = []
    today = date.today()
    for i in range(5):
        session_date = today + timedelta(days=i)
        session = TrainingSession(
            coach_id=coach.id,
            title=f"Strength Workout {i+1}",
            date=session_date,
            start_time=time(hour=9+i, minute=0),
            end_time=time(hour=10+i, minute=0),
            capacity=3
        )
        db.add(session)
        sessions.append(session)
    db.flush()
    
    # Create Bookings and Payments
    for i, client in enumerate(clients):
        # Book first session for everyone
        booking = Booking(
            training_id=sessions[0].id,
            client_id=client.id,
            status="confirmed"
        )
        db.add(booking)
        db.flush()
        
        # Payment for booking
        payment = Payment(
            booking_id=booking.id,
            client_id=client.id,
            amount=50.0,
            status=PaymentStatus.PAID if i % 2 == 0 else PaymentStatus.UNPAID,
            payment_date=datetime.now() if i % 2 == 0 else None
        )
        db.add(payment)
        
    db.commit()
    print("Database seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed()
