from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables from backend/.env file (resolve relative path)
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

try:
    from .routers import transcription, ambulances, dispatch, emergencies
except ImportError:  # pragma: no cover - allows running as a script from backend/
    from routers import transcription, ambulances, dispatch, emergencies

app = FastAPI(
    title="SARS - Smart Ambulance Routing System",
    description="AI-powered ambulance dispatch and routing system",
    version="1.0.0"
)

# CORS middleware configuration
# In production, set CORS_ORIGINS env var to your frontend URL(s),
# comma-separated.  Falls back to localhost dev ports if not set.
_cors_env = os.getenv("CORS_ORIGINS", "")
if _cors_env.strip():
    cors_origins = [o.strip() for o in _cors_env.split(",") if o.strip()]
else:
    cors_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(transcription.router, prefix="/api/transcription", tags=["Transcription"])
app.include_router(ambulances.router, prefix="/api/ambulances", tags=["Ambulances"])
app.include_router(dispatch.router, prefix="/api/dispatch", tags=["Dispatch"])
app.include_router(emergencies.router, prefix="/api/emergencies", tags=["Emergencies"])

@app.get("/")
async def root():
    return {
        "message": "SARS API - Smart Ambulance Routing System",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SARS Backend API"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
