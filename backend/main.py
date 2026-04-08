from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, trainings, bookings, stats, users, social_auth
from app.core.database import init_db

app = FastAPI(title="Training Tracker API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database
@app.on_event("startup")
def on_startup():
    init_db()

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(trainings.router, prefix="/api/trainings", tags=["trainings"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(social_auth.router, prefix="/api/auth", tags=["social-auth"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Training Tracker API"}
