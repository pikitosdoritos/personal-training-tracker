from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Float, Boolean, Time, Date
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import enum
from datetime import datetime

Base = declarative_base()

class UserRole(str, enum.Enum):
    COACH = "coach"
    CLIENT = "client"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)  # Keeping for backwards compatibility
    first_name = Column(String)
    last_name = Column(String)
    age = Column(Integer)
    phone_number = Column(String)
    telegram_username = Column(String)
    role = Column(String, default=UserRole.CLIENT)
    contact_info = Column(String)
    
    sessions = relationship("TrainingSession", back_populates="coach")
    bookings = relationship("Booking", back_populates="client")
    payments = relationship("Payment", back_populates="client")
    pricing = relationship("Pricing", back_populates="user", uselist=False)

class Pricing(Base):
    __tablename__ = "pricing"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=True) # Null for global price
    price_per_session = Column(Float, nullable=False)

    user = relationship("User", back_populates="pricing")

class TrainingStatus(str, enum.Enum):
    PLANNED = "planned"
    COMPLETED = "completed"

class TrainingSession(Base):
    __tablename__ = "training_sessions"

    id = Column(Integer, primary_key=True, index=True)
    coach_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    capacity = Column(Integer, default=1)
    status = Column(String, default=TrainingStatus.PLANNED)
    
    coach = relationship("User", back_populates="sessions")
    bookings = relationship("Booking", back_populates="training_session")

class BookingStatus(str, enum.Enum):
    REQUESTED = "requested"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    training_id = Column(Integer, ForeignKey("training_sessions.id"))
    client_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default=BookingStatus.CONFIRMED)
    created_at = Column(DateTime, default=datetime.utcnow)

    training_session = relationship("TrainingSession", back_populates="bookings")
    client = relationship("User", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False)

class PaymentStatus(str, enum.Enum):
    PAID = "paid"
    UNPAID = "unpaid"

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True)
    client_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float, nullable=False)
    status = Column(String, default=PaymentStatus.UNPAID)
    payment_date = Column(DateTime, nullable=True)

    booking = relationship("Booking", back_populates="payment")
    client = relationship("User", back_populates="payments")
