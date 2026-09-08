import pandas as pd
import numpy as np
import joblib
from pathlib import Path

MODEL_DIR = Path("models")
DATASET = Path("dataset/clean_healthai.csv")

print("\n==============================================")
print("        HEALTHAI PREDICTION TEST")
print("==============================================\n")

# Load model
model = joblib.load(
    MODEL_DIR / "best_model.pkl"
)

encoder = joblib.load(
    MODEL_DIR / "label_encoder.pkl"
)

feature_names = joblib.load(
    MODEL_DIR / "feature_names.pkl"
)

# Load dataset only to inspect available symptoms
df = pd.read_csv(DATASET)

print("Model loaded successfully.")
print("Diseases:", len(encoder.classes_))
print("Symptoms:", len(feature_names))

# ------------------------------------------------
# Show symptom names
# ------------------------------------------------

print("\nAvailable symptom examples:")

for symptom in feature_names[:50]:
    print("-", symptom)

# ------------------------------------------------
# User input
# ------------------------------------------------

print("\n==============================================")
print("Enter symptoms")
print("==============================================")

print(
    "\nExample:"
    "\nfever, headache, cough"
)

user_input = input(
    "\nSymptoms: "
).lower()

selected = [
    s.strip()
    for s in user_input.split(",")
    if s.strip()
]

# ------------------------------------------------
# Create feature vector
# ------------------------------------------------

X = np.zeros(
    (1, len(feature_names)),
    dtype=np.uint8
)

matched = []

for symptom in selected:

    normalized = symptom.replace("_", " ").strip()

    # Exact match
    matches = [
        i for i, feature in enumerate(feature_names)
        if feature.lower().replace("_", " ") == normalized
    ]

    # Partial match if exact match doesn't exist
    if not matches:

        matches = [
            i for i, feature in enumerate(feature_names)
            if normalized in feature.lower().replace("_", " ")
        ]

    for index in matches:

        X[0, index] = 1

        matched.append(
            feature_names[index]
        )

# ------------------------------------------------
# Display matching symptoms
# ------------------------------------------------

print("\nMatched symptoms:")

if matched:

    for symptom in sorted(set(matched)):
        print("✓", symptom)

else:

    print("❌ No symptoms matched the dataset.")

    print(
        "\nPlease use symptom names shown above."
    )

    exit()

# ------------------------------------------------
# Prediction
# ------------------------------------------------

prediction = model.predict(X)

disease = encoder.inverse_transform(
    prediction
)[0]

print("\n==============================================")
print("             PREDICTION")
print("==============================================")

print(
    "\nPredicted disease:",
    disease
)

# ------------------------------------------------
# Top predictions
# ------------------------------------------------

if hasattr(model, "predict_proba"):

    probabilities = model.predict_proba(X)[0]

    top_indices = np.argsort(
        probabilities
    )[-5:][::-1]

    print("\nTop predictions:")

    for rank, index in enumerate(
        top_indices,
        start=1
    ):

        print(
            f"{rank}. "
            f"{encoder.inverse_transform([index])[0]} "
            f"({probabilities[index] * 100:.2f}%)"
        )

print("\n==============================================")