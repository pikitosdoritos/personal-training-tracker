from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List
from app.core.database import get_db
from app.models.models import Booking, TrainingSession, User, Payment, PaymentStatus
from app.api.deps import get_current_coach
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    coach: User = Depends(get_current_coach)
):
    now = datetime.now()
    this_month = now.replace(day=1)
    
    total_sessions = db.query(TrainingSession).count()
    total_bookings = db.query(Booking).count()
    
    # Income based on TrainingType.cost for completed sessions
    from app.models.models import TrainingType, TrainingStatus
    
    completed_bookings = db.query(Booking).join(
        TrainingSession, Booking.training_id == TrainingSession.id
    ).join(
        TrainingType, TrainingSession.training_type_id == TrainingType.id
    ).filter(TrainingSession.status == TrainingStatus.COMPLETED)
    
    total_income = sum([b.training.training_type.cost for b in completed_bookings.all() if b.training.training_type])
    
    pending_bookings = db.query(Booking).join(
        TrainingSession, Booking.training_id == TrainingSession.id
    ).join(
        TrainingType, TrainingSession.training_type_id == TrainingType.id
    ).filter(TrainingSession.status == TrainingStatus.PLANNED)
    
    pending_income = sum([b.training.training_type.cost for b in pending_bookings.all() if b.training.training_type])
    
    # Monthly stats
    monthly_sessions = db.query(TrainingSession).filter(TrainingSession.date >= this_month.date()).count()
    
    # Most active clients
    active_clients = db.query(
        User.full_name, 
        func.count(Booking.id).label("booking_count")
    ).join(Booking).group_by(User.id).order_by(func.count(Booking.id).desc()).limit(5).all()

    # Weekly income chart (last 7 days)
    weekly_chart = []
    for i in range(6, -1, -1):
        day = (now - timedelta(days=i)).date()
        day_income = db.query(func.sum(Payment.amount)).filter(
            Payment.status == PaymentStatus.PAID,
            func.date(Payment.payment_date) == day
        ).scalar() or 0.0
        weekly_chart.append({
            "name": day.strftime("%a"),
            "income": round(day_income, 2)
        })
    
    return {
        "total_sessions": total_sessions,
        "total_bookings": total_bookings,
        "total_income": round(total_income, 2),
        "pending_income": round(pending_income, 2),
        "monthly_sessions": monthly_sessions,
        "active_clients": [{"name": c[0], "count": c[1]} for c in active_clients],
        "monthly_sessions_chart": weekly_chart,
    }

@router.get("/finances")
def get_finances(
    db: Session = Depends(get_db),
    coach: User = Depends(get_current_coach)
):
    import calendar
    from sqlalchemy import extract
    from datetime import date

    from app.models.models import TrainingType, TrainingStatus
    
    today = date.today()
    monthly_data = []
    
    for i in range(5, -1, -1):
        month = today.month - i
        year = today.year
        while month <= 0:
            month += 12
            year -= 1
        
        # Calculate totals for this month's completed sessions
        month_bookings = db.query(Booking).join(
            TrainingSession, Booking.training_id == TrainingSession.id
        ).join(
            TrainingType, TrainingSession.training_type_id == TrainingType.id
        ).filter(
            TrainingSession.status == TrainingStatus.COMPLETED,
            extract('month', TrainingSession.date) == month,
            extract('year', TrainingSession.date) == year
        ).all()
        
        total = sum([b.training.training_type.cost for b in month_bookings if b.training.training_type])
        
        monthly_data.append({
            "month": calendar.month_abbr[month],
            "income": round(total, 2),
            "target": 5000
        })

    # Recent transactions based on completed bookings
    recent_bookings = db.query(Booking).join(
        TrainingSession, Booking.training_id == TrainingSession.id
    ).filter(
        TrainingSession.status.in_([TrainingStatus.COMPLETED, TrainingStatus.CANCELLED])
    ).order_by(TrainingSession.date.desc()).limit(20).all()

    transactions = []
    for b in recent_bookings:
        user = b.client
        t_type = b.training.training_type
        amount = t_type.cost if t_type else 0
        transactions.append({
            "id": b.id,
            "client": user.first_name + " " + user.last_name if user.first_name else user.email,
            "amount": amount,
            "date": b.training.date.strftime("%b %d, %Y"),
            "status": 'paid' if b.training.status == TrainingStatus.COMPLETED else 'cancelled',
            "booking_id": b.id
        })

    # Total income calculation
    all_completed = db.query(Booking).join(
        TrainingSession, Booking.training_id == TrainingSession.id
    ).join(
        TrainingType, TrainingSession.training_type_id == TrainingType.id
    ).filter(TrainingSession.status == TrainingStatus.COMPLETED).all()
    
    total_paid = sum([b.training.training_type.cost for b in all_completed if b.training.training_type])
    
    all_pending = db.query(Booking).join(
        TrainingSession, Booking.training_id == TrainingSession.id
    ).join(
        TrainingType, TrainingSession.training_type_id == TrainingType.id
    ).filter(TrainingSession.status == TrainingStatus.PLANNED).all()
    
    total_pending = sum([b.training.training_type.cost for b in all_pending if b.training.training_type])

    # This month revenue
    this_month_bookings = db.query(Booking).join(
        TrainingSession, Booking.training_id == TrainingSession.id
    ).join(
        TrainingType, TrainingSession.training_type_id == TrainingType.id
    ).filter(
        TrainingSession.status == TrainingStatus.COMPLETED,
        extract('month', TrainingSession.date) == today.month,
        extract('year', TrainingSession.date) == today.year
    ).all()
    
    this_month_revenue = sum([b.training.training_type.cost for b in this_month_bookings if b.training.training_type])

    return {
        "monthly_data": monthly_data,
        "transactions": transactions,
        "total_paid": round(total_paid, 2),
        "total_pending": round(total_pending, 2),
        "this_month_revenue": round(this_month_revenue, 2),
    }


@router.get("/export/csv")
def export_stats_csv(
    db: Session = Depends(get_db),
    coach: User = Depends(get_current_coach)
):
    import csv
    from io import StringIO
    from fastapi.responses import StreamingResponse
    
    output = StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow(["Client Name", "Booking Count"])
    
    # Data
    active_clients = db.query(
        User.full_name, 
        func.count(Booking.id).label("booking_count")
    ).join(Booking).group_by(User.id).all()
    
    for client in active_clients:
        writer.writerow([client[0], client[1]])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=stats.csv"}
    )
