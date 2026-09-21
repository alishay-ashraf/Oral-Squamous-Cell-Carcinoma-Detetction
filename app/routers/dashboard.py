from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=schemas.DashboardStatsOut)
def stats(db: Session = Depends(get_db)):
    total = db.query(func.count(models.Prediction.id)).scalar() or 0
    week_ago = datetime.utcnow() - timedelta(days=7)
    this_week = db.query(func.count(models.Prediction.id)).filter(models.Prediction.created_at >= week_ago).scalar() or 0
    avg_conf = db.query(func.avg(models.Prediction.confidence)).scalar() or 0
    avg_ms = db.query(func.avg(models.Prediction.inference_ms)).scalar() or 0
    malignant = db.query(func.count(models.Prediction.id)).filter(models.Prediction.finding == "OSCC").scalar() or 0
    patients = db.query(func.count(models.Patient.id)).scalar() or 0
    return schemas.DashboardStatsOut(
        total_scans=total, scans_this_week=this_week, avg_confidence=float(avg_conf),
        avg_inference_ms=int(avg_ms), malignant_flags=malignant, active_patients=patients,
    )
