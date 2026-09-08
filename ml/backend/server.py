from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pathlib import Path
import sys

# ============================================================
# HEALTHAI BACKEND API
# ============================================================

# ------------------------------------------------------------
# Locate ML scripts
# ------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

ML_DIR = BASE_DIR
SCRIPTS_DIR = ML_DIR / "scripts"

if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))


# ------------------------------------------------------------
# Import validated HealthAI hybrid predictor
# ------------------------------------------------------------

try:
    from hybrid_predict import (
        load_all,
        match_symptoms,
        predict_disease,
    )
except ImportError as e:
    print("ERROR: Could not import HealthAI ML system.")
    print(e)
    raise


# ------------------------------------------------------------
# Load ML system once when server starts
# ------------------------------------------------------------

print("\n==============================================")
print("          STARTING HEALTHAI API")
print("==============================================\n")

try:
    model, encoder, feature_names, profiles, weights = load_all()

    print("HealthAI ML system loaded successfully.")
    print(f"Model diseases: {len(encoder.classes_)}")
    print(f"Disease profiles: {len(profiles)}")
    print(f"Symptoms: {len(feature_names)}")
    print(f"Weighted symptoms: {len(weights)}")

except Exception as e:
    print("\nERROR loading HealthAI ML system:")
    print(e)
    raise


# ------------------------------------------------------------
# FastAPI application
# ------------------------------------------------------------

app = FastAPI(
    title="HealthAI API",
    description="AI-powered symptom analysis and health-information API",
    version="1.0.0",
)


# ------------------------------------------------------------
# Request model
# ------------------------------------------------------------

class PredictionRequest(BaseModel):
    symptoms: list[str]


# ------------------------------------------------------------
# Health check
# ------------------------------------------------------------

@app.get("/")
def root():

    return {
        "status": "online",
        "application": "HealthAI",
        "message": "HealthAI API is running",
        "version": "1.0.0"
    }


# ------------------------------------------------------------
# System information
# ------------------------------------------------------------

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "model_diseases": len(encoder.classes_),
        "disease_profiles": len(profiles),
        "symptoms": len(feature_names),
        "weighted_symptoms": len(weights)
    }


# ------------------------------------------------------------
# Prediction endpoint
# ------------------------------------------------------------

@app.post("/predict")
def predict(request: PredictionRequest):

    # Remove empty values
    symptoms = [
        str(symptom).strip()
        for symptom in request.symptoms
        if str(symptom).strip()
    ]

    if not symptoms:
        raise HTTPException(
            status_code=400,
            detail="Please provide at least one symptom."
        )

    # Convert list to predictor input format
    symptom_text = ", ".join(symptoms)

    # Match symptoms against dataset vocabulary
    matched_symptoms = match_symptoms(symptom_text)

    if not matched_symptoms:

        return {
            "success": False,
            "message": "No recognized symptoms found.",
            "input_symptoms": symptoms,
            "matched_symptoms": [],
            "predictions": []
        }

    # Run hybrid prediction
    predictions = predict_disease(
        matched_symptoms,
        model,
        encoder,
        feature_names,
        profiles,
        weights
    )

    if not predictions:
        return {
            "success": False,
            "message": "Unable to generate a prediction.",
            "input_symptoms": symptoms,
            "matched_symptoms": matched_symptoms,
            "predictions": []
        }

    # --------------------------------------------------------
    # Prepare top predictions
    # --------------------------------------------------------

    results = []

    for item in predictions[:5]:

        result = {
            "disease": item.get("disease"),
            "hybrid_score": round(
                float(item.get("hybrid_score", 0)) * 100,
                2
            ),
            "profile_score": round(
                float(item.get("profile_score", 0)) * 100,
                2
            ),
            "weighted_symptom_score": round(
                float(item.get("weighted_score", 0)) * 100,
                2
            ),
            "ml_score": round(
                float(item.get("ml_score", 0)) * 100,
                2
            )
        }

        if "matched_count" in item:
            result["matched_symptoms"] = item["matched_count"]

        if "total_profile_symptoms" in item:
            result["total_profile_symptoms"] = item[
                "total_profile_symptoms"
            ]

        results.append(result)

    # --------------------------------------------------------
    # Best prediction
    # --------------------------------------------------------

    best = results[0]

    score = best["hybrid_score"]

    if score >= 65:
        strength = "Strong symptom-pattern match"
    elif score >= 45:
        strength = "Moderate symptom-pattern match"
    elif score >= 25:
        strength = "Possible symptom-pattern match"
    else:
        strength = "Weak symptom-pattern match"

    # --------------------------------------------------------
    # API response
    # --------------------------------------------------------

    return {
        "success": True,
        "input_symptoms": symptoms,
        "matched_symptoms": matched_symptoms,

        "best_match": {
            "disease": best["disease"],
            "match_score": best["hybrid_score"],
            "result_strength": strength
        },

        "top_predictions": results,

        "disclaimer": (
            "This is an AI-generated health-information result, "
            "not a medical diagnosis. For serious, severe, or "
            "worsening symptoms, consult a qualified healthcare professional."
        )
    }