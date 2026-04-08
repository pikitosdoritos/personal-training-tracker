# TrackFit - Training Tracker (Coach-Client System)

A premium, modern full-stack application built for personal trainers and coaches to manage clients, sessions, finances, and analytics.

![TrackFit Dashboard](https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3)

## 🚀 Features

- **Coach Dashboard**: Global overview of income, attendance, and clients.
- **Client Management**: Track progress, contact info, and session history.
- **Financial System**: Automatic income calculation based on session prices.
- **Visual Analytics**: Interactive charts for revenue and growth.
- **Glassmorphism UI**: High-fidelity, modern Apple-like interface.
- **Role-Based Access**: Secure login for coaches and clients.
- **Mobile Friendly**: Fully responsive design.

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, Recharts, Lucide Icons, Vanilla CSS.
- **Backend**: FastAPI (Python), SQLAlchemy ORM.
- **Database**: PostgreSQL.
- **DevOps**: Docker & Docker Compose.

## 📦 Setup & Installation

### Prerequisites
- Docker & Docker Compose
- Python 3.11+ (for local development)
- Node.js 18+ (for local development)

### Running with Docker (Recommended)
1. Clone the repository.
2. Run the following command in the root directory:
   ```bash
   docker-compose up --build
   ```
3. Access the application:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000](http://localhost:8000)
   - API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Local Manual Setup

#### Backend
1. `cd backend`
2. `python -m venv venv`
3. `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
4. `pip install -r requirements.txt`
5. `uvicorn main:app --reload`

#### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## 📊 Database Schema

The system uses the following entities:
- **Users**: Authentication and profile data.
- **Pricing**: Individual or global price per session.
- **TrainingSessions**: Schedule data for coach workouts.
- **Bookings**: Junction table for client signups.
- **Payments**: Financial tracking records.

## 📄 License
MIT
