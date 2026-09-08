import sys
from pathlib import Path
from ml.backend.database.db import get_prediction_history

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware 
from fastapi.staticfiles import StaticFiles
# ============================================================
# HEALTHAI PROJECT PATHS
# ============================================================

# Current file:
# HealthAI/ml/backend/api/main.py
#
# parents[0] = api
# parents[1] = backend
# parents[2] = ml

ML_DIR = Path(__file__).resolve().parents[2]
SCRIPTS_DIR = ML_DIR / "scripts"


# ============================================================
# ADD ML SCRIPTS TO PYTHON PATH
# ============================================================

if not SCRIPTS_DIR.exists():
    raise RuntimeError(
        f"HealthAI scripts folder not found: {SCRIPTS_DIR}"
    )

sys.path.insert(0, str(SCRIPTS_DIR))


# ============================================================
# IMPORT HEALTHAI ML ENGINE
# ============================================================

import hybrid_predict


# ============================================================
# IMPORT DATABASE
# ============================================================

BACKEND_DIR = Path(__file__).resolve().parents[1]

sys.path.insert(0, str(BACKEND_DIR))

from database.db import (
    initialize_database,
    save_prediction,
    get_prediction_history,
    get_prediction,
    delete_prediction,
)


# ============================================================
# INITIALIZE DATABASE
# ============================================================

initialize_database()


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="HealthAI API",
    description=(
        "HealthAI hybrid symptom analysis API "
        "using machine learning, disease profiles, "
        "weighted symptoms and prediction history."
    ),
    version="1.0.0",
)
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[3]
DATA_DIR = PROJECT_ROOT / "data"

app.mount("/data", StaticFiles(directory=str(DATA_DIR)), name="data")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# REQUEST MODEL
# ============================================================

class PredictionRequest(BaseModel):
    symptoms: list[str]


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():

    return {
        "status": "online",
        "application": "HealthAI",
        "message": "HealthAI API is running",
        "version": "1.0.0",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "service": "HealthAI API",
        "ml_engine": "loaded",
        "database": "loaded",
    }


# ============================================================
# MODEL INFORMATION
# ============================================================

@app.get("/model-info")
def model_info():

    return {
        "model_diseases": len(
            hybrid_predict.encoder.classes_
        ),
        "disease_profiles": len(
            hybrid_predict.disease_profiles
        ),
        "symptoms": len(
            hybrid_predict.feature_names
        ),
        "weighted_symptoms": len(
            hybrid_predict.symptom_weights
        ),
    }


# ============================================================
# SYMPTOM MATCHING ENDPOINT
# ============================================================

@app.post("/match-symptoms")
def match_symptoms(request: PredictionRequest):

    user_input = ", ".join(request.symptoms)

    matched_symptoms = hybrid_predict.match_symptoms(
        user_input
    )

    return {
        "success": True,
        "input_symptoms": request.symptoms,
        "matched_symptoms": matched_symptoms,
        "matched_count": len(matched_symptoms),
    }


# ============================================================
# PREDICTION ENDPOINT
# ============================================================

@app.post("/predict")
def predict(request: PredictionRequest):

    # --------------------------------------------------------
    # Convert symptoms to ML-engine format
    # --------------------------------------------------------

    user_input = ", ".join(request.symptoms)

    # --------------------------------------------------------
    # Match symptoms
    # --------------------------------------------------------

    matched_symptoms = hybrid_predict.match_symptoms(
        user_input
    )

    # --------------------------------------------------------
    # No recognized symptoms
    # --------------------------------------------------------

    if not matched_symptoms:

        return {
            "success": False,
            "message": (
                "No recognized symptoms found. "
                "Please use symptoms available in "
                "the HealthAI dataset."
            ),
            "input_symptoms": request.symptoms,
            "matched_symptoms": [],
            "predictions": [],
        }

    # --------------------------------------------------------
    # Run hybrid prediction
    # --------------------------------------------------------

    results = hybrid_predict.predict(
        matched_symptoms
    )

    # --------------------------------------------------------
    # Safety check
    # --------------------------------------------------------

    if not results:

        return {
            "success": False,
            "message": "HealthAI could not generate a prediction.",
            "input_symptoms": request.symptoms,
            "matched_symptoms": matched_symptoms,
            "predictions": [],
        }

    # --------------------------------------------------------
    # Top 5 predictions
    # --------------------------------------------------------

    top_results = results[:5]

    predictions = []

    for result in top_results:

        predictions.append(
            {
                "disease": result["disease"],

                "hybrid_score": round(
                    result["hybrid_score"],
                    4
                ),

                "hybrid_percentage": round(
                    result["hybrid_score"] * 100,
                    2
                ),

                "profile_score": round(
                    result["profile_score"],
                    4
                ),

                "profile_percentage": round(
                    result["profile_score"] * 100,
                    2
                ),

                "weighted_score": round(
                    result["weighted_score"],
                    4
                ),

                "weighted_percentage": round(
                    result["weighted_score"] * 100,
                    2
                ),

                "ml_score": round(
                    result["ml_score"],
                    4
                ),

                "ml_percentage": round(
                    result["ml_score"] * 100,
                    2
                ),

                "matched_symptoms": result[
                    "matched_count"
                ],

                "expected_symptoms": result[
                    "total_expected"
                ],
            }
        )

    # --------------------------------------------------------
    # Best prediction
    # --------------------------------------------------------

    best = top_results[0]

    score = best["hybrid_score"]

    if score >= 0.65:

        strength = "Strong symptom-pattern match"

    elif score >= 0.45:

        strength = "Moderate symptom-pattern match"

    elif score >= 0.25:

        strength = "Possible symptom-pattern match"

    else:

        strength = "Weak symptom-pattern match"

    # --------------------------------------------------------
    # SAVE PREDICTION TO DATABASE
    # --------------------------------------------------------

    prediction_id = save_prediction(

        symptoms=request.symptoms,

        matched_symptoms=matched_symptoms,

        best_disease=best["disease"],

        best_score=best["hybrid_score"],

        strength=strength,
    )

    # --------------------------------------------------------
    # FINAL RESPONSE
    # --------------------------------------------------------

    return {

        "success": True,

        "prediction_id": prediction_id,

        "input_symptoms": request.symptoms,

        "matched_symptoms": matched_symptoms,

        "matched_count": len(
            matched_symptoms
        ),

        "best_match": {

            "disease": best["disease"],

            "score": round(
                best["hybrid_score"],
                4
            ),

            "percentage": round(
                best["hybrid_score"] * 100,
                2
            ),

            "strength": strength,
        },

        "predictions": predictions,

        "disclaimer": (
            "This is an AI-generated "
            "health-information result, "
            "not a medical diagnosis. "
            "For serious, severe, or worsening "
            "symptoms, consult a qualified "
            "healthcare professional."
        ),
    }


# ============================================================
# PREDICTION HISTORY
# ============================================================

@app.get("/history")
def history():

    records = get_prediction_history()

    return {
        "success": True,
        "count": len(records),
        "history": records,
    }


# ============================================================
# SINGLE HISTORY RECORD
# ============================================================

@app.get("/history/{prediction_id}")
def history_item(prediction_id: int):

    record = get_prediction(
        prediction_id
    )

    if record is None:

        raise HTTPException(
            status_code=404,
            detail="Prediction not found."
        )

    return {
        "success": True,
        "prediction": record,
    }


# ============================================================
# DELETE HISTORY RECORD
# ============================================================

@app.delete("/history/{prediction_id}")
def delete_history(prediction_id: int):

    deleted = delete_prediction(
        prediction_id
    )

    if not deleted:

        raise HTTPException(
            status_code=404,
            detail="Prediction not found."
        )

    return {
        "success": True,
        "message": "Prediction deleted successfully.",
        "prediction_id": prediction_id,
    }
