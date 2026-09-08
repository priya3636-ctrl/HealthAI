import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "best_model.pkl"
ENCODER_PATH = BASE_DIR / "models" / "label_encoder.pkl"
FEATURE_PATH = BASE_DIR / "models" / "feature_names.pkl"

PROFILE_PATH = BASE_DIR / "results" / "disease_profiles.json"
WEIGHTS_PATH = BASE_DIR / "results" / "symptom_weights.csv"


# ============================================================
# LOAD FILES
# ============================================================

print("\nLoading HealthAI files...")

model = joblib.load(MODEL_PATH)
encoder = joblib.load(ENCODER_PATH)
feature_names = joblib.load(FEATURE_PATH)

with open(PROFILE_PATH, "r", encoding="utf-8") as f:
    disease_profiles = json.load(f)

weights_df = pd.read_csv(WEIGHTS_PATH)

symptom_weights = dict(
    zip(
        weights_df["symptom"].astype(str),
        weights_df["weight"].astype(float)
    )
)

print("\n==============================================")
print("       HEALTHAI HYBRID PREDICTOR")
print("==============================================\n")

print("Model diseases:", len(encoder.classes_))
print("Disease profiles:", len(disease_profiles))
print("Symptoms:", len(feature_names))
print("Weighted symptoms:", len(symptom_weights))


# ============================================================
# NORMALIZATION
# ============================================================

def normalize(text):
    return str(text).strip().lower().replace("-", "_").replace(" ", "_")


# ============================================================
# BUILD SYMPTOM LOOKUP
# ============================================================

feature_lookup = {}

for feature in feature_names:
    normalized = normalize(feature)
    feature_lookup[normalized] = feature


# ============================================================
# MATCH USER SYMPTOMS
# ============================================================

def match_symptoms(user_input):

    selected = [
        normalize(x)
        for x in user_input.split(",")
        if x.strip()
    ]

    matched = []

    for symptom in selected:

        if symptom in feature_lookup:
            matched.append(feature_lookup[symptom])
            continue

        # Try matching spaces/underscores
        normalized_variants = {
            symptom,
            symptom.replace("_", " "),
            symptom.replace(" ", "_")
        }

        found = False

        for feature in feature_names:

            feature_normalized = normalize(feature)

            if feature_normalized in normalized_variants:
                matched.append(feature)
                found = True
                break

        if not found:
            continue

    return sorted(set(matched))


# ============================================================
# CREATE ML FEATURE VECTOR
# ============================================================

def create_feature_vector(matched_symptoms):

    X = pd.DataFrame(
        np.zeros((1, len(feature_names)), dtype=np.uint8),
        columns=feature_names
    )

    for symptom in matched_symptoms:

        if symptom in X.columns:
            X.loc[0, symptom] = 1

    return X


# ============================================================
# PROFILE SCORE
# ============================================================

def calculate_profile_score(disease, matched_symptoms):

    profile = disease_profiles.get(disease)

    if not profile:
        return 0.0, 0, 0

    symptoms = profile.get("symptoms", {})

    if not isinstance(symptoms, dict) or not symptoms:
        return 0.0, 0, 0

    matched_count = 0
    total_expected = len(symptoms)

    weighted_sum = 0.0

    for symptom in matched_symptoms:

        frequency = symptoms.get(symptom)

        if frequency is None:
            continue

        frequency = float(frequency)

        if frequency > 0:
            matched_count += 1
            weighted_sum += frequency

    if total_expected == 0:
        return 0.0, matched_count, total_expected

    # Basic profile coverage
    coverage = matched_count / total_expected

    # Average frequency among matched symptoms
    if matched_count > 0:
        average_frequency = weighted_sum / matched_count
    else:
        average_frequency = 0.0

    # Profile score
    score = coverage * average_frequency

    return score, matched_count, total_expected


# ============================================================
# WEIGHTED SYMPTOM SCORE
# ============================================================

def calculate_weighted_score(disease, matched_symptoms):

    profile = disease_profiles.get(disease)

    if not profile:
        return 0.0

    symptoms = profile.get("symptoms", {})

    if not isinstance(symptoms, dict):
        return 0.0

    numerator = 0.0
    denominator = 0.0

    for symptom in matched_symptoms:

        weight = symptom_weights.get(symptom, 1.0)

        frequency = float(symptoms.get(symptom, 0.0))

        denominator += weight

        numerator += weight * frequency

    if denominator == 0:
        return 0.0

    return numerator / denominator


# ============================================================
# MAIN PREDICTION
# ============================================================

def predict(matched_symptoms):

    X = create_feature_vector(matched_symptoms)

    # ML probabilities
    probabilities = model.predict_proba(X)[0]

    results = []

    for index, probability in enumerate(probabilities):

        disease = encoder.classes_[index]

        ml_score = float(probability)

        profile_score, matched_count, total_expected = (
            calculate_profile_score(
                disease,
                matched_symptoms
            )
        )

        weighted_score = calculate_weighted_score(
            disease,
            matched_symptoms
        )

        # ----------------------------------------------------
        # HYBRID SCORE
        #
        # Profile matching is intentionally dominant.
        # ML contributes supporting evidence.
        # ----------------------------------------------------

        hybrid_score = (
            0.60 * profile_score
            + 0.30 * weighted_score
            + 0.10 * ml_score
        )

        results.append(
            {
                "disease": disease,
                "hybrid_score": hybrid_score,
                "profile_score": profile_score,
                "weighted_score": weighted_score,
                "ml_score": ml_score,
                "matched_count": matched_count,
                "total_expected": total_expected,
            }
        )

    results.sort(
        key=lambda x: x["hybrid_score"],
        reverse=True
    )

    return results


# ============================================================
# DISPLAY RESULTS
# ============================================================

def display_results(results, matched_symptoms):

    print("\n==============================================")
    print("      HEALTHAI HYBRID RESULTS")
    print("==============================================")

    print("\nMatched symptoms:")

    for symptom in matched_symptoms:
        print("✓", symptom)

    print("\nTop predictions:")

    for rank, result in enumerate(results[:5], start=1):

        print(f"\n{rank}. {result['disease']}")

        print(
            f"   Hybrid score: "
            f"{result['hybrid_score'] * 100:.2f}%"
        )

        print(
            f"   Profile score: "
            f"{result['profile_score'] * 100:.2f}%"
        )

        print(
            f"   Weighted symptom score: "
            f"{result['weighted_score'] * 100:.2f}%"
        )

        print(
            f"   ML score: "
            f"{result['ml_score'] * 100:.2f}%"
        )

        print(
            f"   Matched symptoms: "
            f"{result['matched_count']}/"
            f"{result['total_expected']}"
        )

    best = results[0]

    print("\n==============================================")
    print("             BEST MATCH")
    print("==============================================")

    print(
        f"\nPossible condition: "
        f"{best['disease']}"
    )

    print(
        f"Match score: "
        f"{best['hybrid_score'] * 100:.2f}%"
    )

    # --------------------------------------------------------
    # RESULT STRENGTH
    # --------------------------------------------------------

    score = best["hybrid_score"]

    if score >= 0.65:
        strength = "Strong symptom-pattern match"
    elif score >= 0.45:
        strength = "Moderate symptom-pattern match"
    elif score >= 0.25:
        strength = "Possible symptom-pattern match"
    else:
        strength = "Weak symptom-pattern match"

    print(f"\nResult strength: {strength}")

    print(
        "\n⚕️ This is an AI-generated "
        "health-information result, not a medical diagnosis."
    )

    print(
        "For serious, severe, or worsening symptoms, "
        "consult a qualified healthcare professional."
    )

    print("\n==============================================\n")


# ============================================================
# INTERACTIVE MODE
# ============================================================

def interactive_mode():

    print("\n==============================================")
    print("Enter symptoms")
    print("==============================================")

    print(
        "\nUse dataset symptom names."
        "\nExample:"
        "\ncough, nasal_congestion, difficulty_breathing, wheezing"
    )

    while True:

        user_input = input("\nSymptoms: ").strip()

        if not user_input:
            print("\nHealthAI stopped.")
            break

        matched_symptoms = match_symptoms(user_input)

        if not matched_symptoms:

            print("\n❌ No symptoms matched.")

            print(
                "Use dataset symptom names "
                "or run find_symptom.py."
            )

            continue

        results = predict(matched_symptoms)

        display_results(
            results,
            matched_symptoms
        )


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    interactive_mode()