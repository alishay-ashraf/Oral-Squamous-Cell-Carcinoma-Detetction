from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import Base, engine
from app import ml_model
from app.routers import auth, patients, predictions, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(title="OSCC Detector API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(predictions.router)
app.include_router(dashboard.router)

@app.on_event("startup")
def load_ml_model():
    ml_model.load_model()

@app.get("/api/health")
def health():
    return {"status": "ok"}