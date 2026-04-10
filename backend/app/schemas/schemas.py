from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, time, datetime
from ..models.models import UserRole, BookingStatus, PaymentStatus, TrainingStatus

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    age: Optional[int] = None
    phone_number: Optional[str] = None
    telegram_username: Optional[str] = None
    role: UserRole = UserRole.CLIENT
    contact_info: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    contact_info: Optional[str] = None

class UserOut(UserBase):
    id: int
    class Config:
        from_attributes = True

# Pricing Schemas
class PricingBase(BaseModel):
    price_per_session: float

class PricingCreate(PricingBase):
    user_id: Optional[int] = None

class PricingOut(PricingBase):
    id: int
    user_id: Optional[int]
    class Config:
        from_attributes = True

# Training Session Schemas
class TrainingSessionBase(BaseModel):
    title: str
    date: date
    start_time: time
    end_time: time
    capacity: int = 1
    status: TrainingStatus = TrainingStatus.PLANNED

class TrainingSessionCreate(TrainingSessionBase):
    client_id: Optional[int] = None

class TrainingSessionOut(TrainingSessionBase):
    id: int
    coach_id: int
    class Config:
        from_attributes = True

# Booking Schemas
class BookingBase(BaseModel):
    training_id: int

class BookingCreate(BookingBase):
    pass

class BookingOut(BaseModel):
    id: int
    training_id: int
    client_id: int
    status: BookingStatus
    created_at: datetime
    class Config:
        from_attributes = True

# Payment Schemas
class PaymentBase(BaseModel):
    amount: float
    status: PaymentStatus = PaymentStatus.UNPAID

class PaymentOut(PaymentBase):
    id: int
    booking_id: int
    client_id: int
    payment_date: Optional[datetime]
    class Config:
        from_attributes = True

# Auth
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
