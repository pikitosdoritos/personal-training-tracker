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
    total_income = db.query(func.sum(Payment.amount)).filter(Payment.status == PaymentStatus.PAID).scalar() or 0.0
    pending_income = db.query(func.sum(Payment.amount)).filter(Payment.status == PaymentStatus.UNPAID).scalar() or 0.0
    
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

    today = date.today()
    monthly_data = []
    for i in range(5, -1, -1):
        # Calculate month/year going back i months
        month = today.month - i
        year = today.year
        while month <= 0:
            month += 12
            year -= 1
        total = db.query(func.sum(Payment.amount)).filter(
            Payment.status == PaymentStatus.PAID,
            extract('month', Payment.payment_date) == month,
            extract('year', Payment.payment_date) == year
        ).scalar() or 0.0
        monthly_data.append({
            "month": calendar.month_abbr[month],
            "income": round(total, 2),
            "target": 5000
        })

    # Recent transactions
    recent = db.query(Payment, User, Booking).join(
        Booking, Payment.booking_id == Booking.id
    ).join(
        User, Payment.client_id == User.id
    ).order_by(Payment.id.desc()).limit(20).all()

    transactions = []
    for payment, user, booking in recent:
        transactions.append({
            "id": payment.id,
            "client": user.full_name or user.email,
            "amount": payment.amount,
            "date": payment.payment_date.strftime("%b %d, %Y") if payment.payment_date else "Pending",
            "status": payment.status.value if hasattr(payment.status, 'value') else payment.status,
            "booking_id": booking.id
        })

    total_paid = db.query(func.sum(Payment.amount)).filter(Payment.status == PaymentStatus.PAID).scalar() or 0.0
    total_pending = db.query(func.sum(Payment.amount)).filter(Payment.status == PaymentStatus.UNPAID).scalar() or 0.0

    # This month revenue
    this_month_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.status == PaymentStatus.PAID,
        extract('month', Payment.payment_date) == today.month,
        extract('year', Payment.payment_date) == today.year
    ).scalar() or 0.0

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
