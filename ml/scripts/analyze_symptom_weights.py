import pandas as pd
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET = BASE_DIR / "dataset" / "clean_healthai.csv"
OUTPUT = BASE_DIR / "results" / "symptom_weights.csv"

print("\n==============================================")
print("      HEALTHAI SYMPTOM WEIGHT ANALYSIS")
print("==============================================\n")

print("Loading dataset...")

df = pd.read_csv(DATASET)

# ------------------------------------------------------------
# Find disease column
# ------------------------------------------------------------

if "diseases" in df.columns:
    disease_col = "diseases"
elif "disease" in df.columns:
    disease_col = "disease"
else:
    print("❌ Disease column not found.")
    print(df.columns.tolist())
    raise SystemExit

# ------------------------------------------------------------
# Basic information
# ------------------------------------------------------------

disease_count = df[disease_col].nunique()

features = [
    c for c in df.columns
    if c != disease_col
]

print("Rows:", len(df))
print("Diseases:", disease_count)
print("Symptoms:", len(features))

# ------------------------------------------------------------
# Calculate symptom weights
# ------------------------------------------------------------

results = []

for symptom in features:

    values = pd.to_numeric(
        df[symptom],
        errors="coerce"
    ).fillna(0)

    # Only rows where symptom is actually present
    present_rows = df.loc[
        values > 0
    ]

    if len(present_rows) == 0:
        # Ignore completely unused features
        continue

    diseases_with_symptom = (
        present_rows[disease_col]
        .nunique()
    )

    # IDF-style weighting
    weight = np.log(
        (disease_count + 1)
        /
        (diseases_with_symptom + 1)
    ) + 1

    results.append({
        "symptom": symptom,
        "diseases_with_symptom": diseases_with_symptom,
        "disease_frequency":
            diseases_with_symptom / disease_count,
        "weight": round(weight, 4)
    })

weights = pd.DataFrame(results)

# ------------------------------------------------------------
# Sort by discriminative power
# ------------------------------------------------------------

weights = weights.sort_values(
    "weight",
    ascending=False
).reset_index(drop=True)

# ------------------------------------------------------------
# Save
# ------------------------------------------------------------

weights.to_csv(
    OUTPUT,
    index=False
)

# ------------------------------------------------------------
# Display
# ------------------------------------------------------------

print("\n==============================================")
print("MOST DISCRIMINATIVE SYMPTOMS")
print("==============================================\n")

print(
    weights.head(30).to_string(
        index=False
    )
)

print("\n==============================================")
print("COMMON SYMPTOMS")
print("==============================================\n")

print(
    weights.tail(20).to_string(
        index=False
    )
)

print("\n==============================================")
print("SUMMARY")
print("==============================================")

print(
    "Valid symptoms:",
    len(weights)
)

print(
    "Ignored unused symptoms:",
    len(features) - len(weights)
)

print("\nSaved:")
print(OUTPUT)

print("\n==============================================")
print("COMPLETE")
print("==============================================")