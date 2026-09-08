import json
from pathlib import Path

import pandas as pd


# ============================================================
# HEALTHAI DISEASE PROFILE BUILDER
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_PATH = BASE_DIR / "dataset" / "clean_healthai.csv"
OUTPUT_PATH = BASE_DIR / "results" / "disease_profiles.json"


print("\n==============================================")
print("      HEALTHAI DISEASE PROFILE BUILDER")
print("==============================================\n")


# ============================================================
# LOAD DATASET
# ============================================================

df = pd.read_csv(DATASET_PATH)

print("Rows:", len(df))
print("Columns:", len(df))


# ============================================================
# FIND DISEASE COLUMN
# ============================================================

possible_disease_columns = [
    "diseases",
    "disease",
    "Disease",
    "label",
    "target"
]

disease_column = None

for col in possible_disease_columns:
    if col in df.columns:
        disease_column = col
        break

if disease_column is None:
    raise RuntimeError(
        "Could not find disease column. "
        f"Available columns: {list(df.columns)[:20]}"
    )


print("Disease column:", disease_column)


# ============================================================
# IDENTIFY SYMPTOM COLUMNS
# ============================================================

# Known non-symptom columns
non_symptom_columns = {
    disease_column,
    "id",
    "ID",
    "index",
    "Index",
    "Unnamed: 0"
}

symptom_columns = [
    col for col in df.columns
    if col not in non_symptom_columns
]


print("Diseases:", df[disease_column].nunique())
print("Potential symptom columns:", len(symptom_columns))


# ============================================================
# CLEAN SYMPTOM VALUES
# ============================================================

def is_positive(value):

    if pd.isna(value):
        return False

    # Numeric representation
    if isinstance(value, (int, float)):
        return value > 0

    value = str(value).strip().lower()

    positive_values = {
        "1",
        "1.0",
        "true",
        "yes",
        "y",
        "present",
        "positive",
        "✓"
    }

    return value in positive_values


# ============================================================
# BUILD PROFILES
# ============================================================

profiles = {}

disease_groups = df.groupby(disease_column)

for disease, group in disease_groups:

    disease = str(disease).strip()

    symptoms = {}

    for symptom in symptom_columns:

        values = group[symptom]

        positive_count = sum(
            is_positive(value)
            for value in values
        )

        if positive_count > 0:

            frequency = positive_count / len(group)

            symptoms[symptom] = round(
                float(frequency),
                4
            )

    profiles[disease] = {
        "record_count": int(len(group)),
        "symptoms": symptoms
    }


# ============================================================
# VALIDATION
# ============================================================

diseases_with_symptoms = sum(
    1
    for profile in profiles.values()
    if profile["symptoms"]
)

empty_profiles = [
    disease
    for disease, profile in profiles.items()
    if not profile["symptoms"]
]


print("\n==============================================")
print("PROFILE BUILD COMPLETE")
print("==============================================")

print("Diseases processed:", len(profiles))
print("Diseases with symptoms:", diseases_with_symptoms)
print("Empty profiles:", len(empty_profiles))
print("Symptoms available:", len(symptom_columns))


if empty_profiles:

    print("\nWARNING: Some diseases have no detected symptoms.")

    for disease in empty_profiles[:20]:
        print("-", disease)


# ============================================================
# SAVE
# ============================================================

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

with open(
    OUTPUT_PATH,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        profiles,
        file,
        indent=2,
        ensure_ascii=False
    )


print("\nSaved:")
print(OUTPUT_PATH)

print("\n==============================================")