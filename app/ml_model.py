# """
# Loads oscc_second.keras (EfficientNetB3, binary Normal/OSCC) and runs
# predictions on ultrasound scans (DICOM .dcm or exported image files).

# Mirrors the training script's preprocessing exactly:
#   - tf.image.resize to 300x300
#   - tensorflow.keras.applications.efficientnet.preprocess_input
#     (NOT /255.0 — EfficientNet normalizes internally)
# """
# import io
# import time
# import numpy as np
# import tensorflow as tf
# from PIL import Image
# from tensorflow.keras.applications.efficientnet import preprocess_input
# from app.config import settings

# IMG_SIZE = (300, 300)              # EfficientNetB3's native input size
# CLASS_NAMES = ["Normal", "OSCC"]   # index 0, 1 — matches training

# # TODO: replace with the exact value printed during training as
# # "Best threshold found on val set: X.XX" (find_best_threshold() in your
# # training script). 0.5 is a placeholder until you have that number.
# DECISION_THRESHOLD = 0.5

# _model = None


# def load_model():
#     global _model
#     if _model is None:
#         _patch_quantization_config_compat()
#         _model = tf.keras.models.load_model(settings.MODEL_PATH)
#     return _model


# def _patch_quantization_config_compat():
#     """
#     oscc_second.keras was saved with a Keras version that writes a
#     'quantization_config' key into every layer's config. This Keras
#     version's layers don't accept that kwarg yet, so we strip it during
#     deserialization. Doesn't touch weights or architecture — purely a
#     forward-compat shim.
#     """
#     from keras.src.ops.operation import Operation

#     if getattr(Operation, "_quant_patch_applied", False):
#         return

#     original_from_config = Operation.from_config.__func__

#     @classmethod
#     def patched_from_config(cls, config):
#         if isinstance(config, dict):
#             config = {k: v for k, v in config.items() if k != "quantization_config"}
#         return original_from_config(cls, config)

#     Operation.from_config = patched_from_config
#     Operation._quant_patch_applied = True


# def _read_image_array(file_bytes: bytes, filename: str) -> np.ndarray:
#     """
#     Returns a raw (H, W, 3) float array, unresized and unnormalized —
#     mirrors load_dicom_image() from the training script so inference sees
#     the same pixel distribution training did.
#     """
#     if filename.lower().endswith(".dcm"):
#         import pydicom
#         ds = pydicom.dcmread(io.BytesIO(file_bytes))
#         arr = ds.pixel_array.astype("float32")
#         if arr.ndim == 2:
#             # Grayscale DICOM — training data was saved as RGB, so stack
#             # the single channel 3x to match the (H, W, 3) shape expected.
#             arr = np.stack([arr, arr, arr], axis=-1)
#         return arr

#     # Non-DICOM fallback (e.g. a PNG/JPG export)
#     img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
#     return np.asarray(img).astype("float32")


# def preprocess(arr: np.ndarray) -> np.ndarray:
#     resized = tf.image.resize(arr, IMG_SIZE).numpy()
#     processed = preprocess_input(resized)
#     return np.expand_dims(processed.astype(np.float32), axis=0)


# def predict(file_bytes: bytes, filename: str):
#     model = load_model()
#     arr = _read_image_array(file_bytes, filename)
#     batch = preprocess(arr)

#     start = time.perf_counter()
#     raw = model.predict(batch, verbose=0)[0]
#     inference_ms = int((time.perf_counter() - start) * 1000)

#     p_oscc = float(raw[0])   # sigmoid output = P(class 1) = P(OSCC)
#     p_normal = 1.0 - p_oscc

#     finding = "OSCC" if p_oscc > DECISION_THRESHOLD else "Normal"
#     confidence = p_oscc if finding == "OSCC" else p_normal

#     probabilities = sorted(
#         [
#             {"label": "Normal", "probability": p_normal},
#             {"label": "OSCC", "probability": p_oscc},
#         ],
#         key=lambda p: p["probability"],
#         reverse=True,
#     )

#     return {
#         "finding": finding,
#         "confidence": confidence,
#         "probabilities": probabilities,
#         "inference_ms": inference_ms,
#     }

"""
Loads oscc_second.keras (EfficientNetB3, binary Normal/OSCC) and runs
predictions on ultrasound scans (DICOM .dcm or exported image files).

Mirrors the training script's preprocessing exactly:
  - tf.image.resize to 300x300
  - tensorflow.keras.applications.efficientnet.preprocess_input
    (NOT /255.0 — EfficientNet normalizes internally)
"""
import io
import time
import numpy as np
import tensorflow as tf
from PIL import Image
from tensorflow.keras.applications.efficientnet import preprocess_input
from app.config import settings

IMG_SIZE = (300, 300)              # EfficientNetB3's native input size
CLASS_NAMES = ["Normal", "OSCC"]   # index 0, 1 — matches training

# TODO: replace with the exact value printed during training as
# "Best threshold found on val set: X.XX" (find_best_threshold() in your
# training script). 0.5 is a placeholder until you have that number.
DECISION_THRESHOLD = 0.5

_model = None


def load_model():
    global _model
    if _model is None:
        _patch_quantization_config_compat()
        _model = tf.keras.models.load_model(settings.MODEL_PATH)
    return _model


def _patch_quantization_config_compat():
    """
    oscc_second.keras was saved with a Keras version that writes a
    'quantization_config' key into every layer's config. This Keras
    version's layers don't accept that kwarg yet, so we strip it during
    deserialization. Doesn't touch weights or architecture — purely a
    forward-compat shim.
    """
    from keras.src.ops.operation import Operation

    if getattr(Operation, "_quant_patch_applied", False):
        return

    original_from_config = Operation.from_config.__func__

    @classmethod
    def patched_from_config(cls, config):
        if isinstance(config, dict):
            config = {k: v for k, v in config.items() if k != "quantization_config"}
        return original_from_config(cls, config)

    Operation.from_config = patched_from_config
    Operation._quant_patch_applied = True


def read_image_array(file_bytes: bytes, filename: str) -> np.ndarray:
    """
    Returns a raw (H, W, 3) float array, unresized and unnormalized —
    mirrors load_dicom_image() from the training script so inference sees
    the same pixel distribution training did.
    """
    if filename.lower().endswith(".dcm"):
        import pydicom
        ds = pydicom.dcmread(io.BytesIO(file_bytes))
        arr = ds.pixel_array.astype("float32")
        if arr.ndim == 2:
            # Grayscale DICOM — training data was saved as RGB, so stack
            # the single channel 3x to match the (H, W, 3) shape expected.
            arr = np.stack([arr, arr, arr], axis=-1)
        return arr

    # Non-DICOM fallback (e.g. a PNG/JPG export)
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    return np.asarray(img).astype("float32")


def to_display_png_bytes(arr: np.ndarray) -> bytes:
    """
    Converts a raw (H, W, 3) float array into normal 8-bit PNG bytes so
    the scan can actually be shown in the browser and embedded in PDF
    reports. DICOM pixel values are often outside 0-255, so this does a
    simple min-max contrast stretch for display purposes only — the
    model itself never sees this stretched version, only the original
    array via preprocess_input().
    """
    a = arr.astype("float32")
    lo, hi = float(a.min()), float(a.max())
    if hi - lo < 1e-6:
        stretched = np.zeros_like(a, dtype="uint8")
    else:
        stretched = ((a - lo) / (hi - lo) * 255.0).clip(0, 255).astype("uint8")
    img = Image.fromarray(stretched, mode="RGB")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def preprocess(arr: np.ndarray) -> np.ndarray:
    resized = tf.image.resize(arr, IMG_SIZE).numpy()
    processed = preprocess_input(resized)
    return np.expand_dims(processed.astype(np.float32), axis=0)


def predict_array(arr: np.ndarray):
    model = load_model()
    batch = preprocess(arr)

    start = time.perf_counter()
    raw = model.predict(batch, verbose=0)[0]
    inference_ms = int((time.perf_counter() - start) * 1000)

    p_oscc = float(raw[0])   # sigmoid output = P(class 1) = P(OSCC)
    p_normal = 1.0 - p_oscc

    finding = "OSCC" if p_oscc > DECISION_THRESHOLD else "Normal"
    confidence = p_oscc if finding == "OSCC" else p_normal

    probabilities = sorted(
        [
            {"label": "Normal", "probability": p_normal},
            {"label": "OSCC", "probability": p_oscc},
        ],
        key=lambda p: p["probability"],
        reverse=True,
    )

    return {
        "finding": finding,
        "confidence": confidence,
        "probabilities": probabilities,
        "inference_ms": inference_ms,
    }