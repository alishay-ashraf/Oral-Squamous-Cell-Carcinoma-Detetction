import os, uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, ml_model
from app.config import settings

router = APIRouter(prefix="/api", tags=["predictions"])

def _to_out(pred: models.Prediction) -> schemas.PredictionOut:
    base = settings.PUBLIC_BASE_URL
    return schemas.PredictionOut(
        id=pred.id, patient_id=pred.patient_id, patient_name=pred.patient.name,
        modality=pred.modality, finding=pred.finding, confidence=pred.confidence,
        probabilities=pred.probabilities,
        image_url=f"{base}/uploads/{os.path.basename(pred.image_path)}",
        heatmap_url=f"{base}/uploads/{os.path.basename(pred.heatmap_path)}" if pred.heatmap_path else None,
        notes=pred.notes, model_version=pred.model_version, inference_ms=pred.inference_ms,
        created_at=pred.created_at,
    )

@router.get("/predictions", response_model=list[schemas.PredictionOut])
def list_predictions(patient_id: str | None = None, db: Session = Depends(get_db)):
    q = db.query(models.Prediction)
    if patient_id:
        q = q.filter(models.Prediction.patient_id == patient_id)
    return [_to_out(p) for p in q.order_by(models.Prediction.created_at.desc()).all()]

@router.post("/predict", response_model=schemas.PredictionOut)
async def predict(file: UploadFile = File(...), patientId: str = Form(...), db: Session = Depends(get_db)):
    patient = db.query(models.Patient).get(patientId)
    if not patient:
        raise HTTPException(404, "Patient not found.")

    file_bytes = await file.read()

    # Decode once (handles both DICOM and regular image files), then save
    # a normal PNG for display — the browser/PDF can't render raw DICOM.
    try:
        arr = ml_model.read_image_array(file_bytes, file.filename or "")
    except Exception as e:
        raise HTTPException(400, f"Couldn't read this scan file: {e}")

    saved_name = f"{uuid.uuid4().hex}.png"
    saved_path = os.path.join(settings.UPLOAD_DIR, saved_name)
    with open(saved_path, "wb") as f:
        f.write(ml_model.to_display_png_bytes(arr))

    result = ml_model.predict_array(arr)

    notes = (
        "Findings are suspicious for OSCC. Recommend biopsy and specialist referral."
        if result["finding"] == "OSCC"
        else "No signs of malignancy detected in this scan."
    )

    pred = models.Prediction(
        patient_id=patient.id, modality="Ultrasound", finding=result["finding"],
        confidence=result["confidence"], probabilities=result["probabilities"],
        image_path=saved_path, notes=notes, model_version="oscc_second",
        inference_ms=result["inference_ms"],
    )
    db.add(pred)
    db.commit()
    db.refresh(pred)
    return _to_out(pred)