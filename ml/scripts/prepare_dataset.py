import pandas as pd
from pathlib import Path

# ============================================================
# HEALTHAI DATASET PREPARATION
# ============================================================

INPUT_FILE = Path("dataset/data.csv")
OUTPUT_FILE = Path("dataset/clean_healthai.csv")

print("\n==============================================")
print("       HEALTHAI DATASET PREPARATION")
print("==============================================\n")

# ------------------------------------------------------------
# Load
# ------------------------------------------------------------

print("Loading dataset...")

df = pd.read_csv(INPUT_FILE)

print(f"Original shape: {df.shape}")

# ------------------------------------------------------------
# Remove completely empty rows
# ------------------------------------------------------------

before = len(df)

df = df.dropna(how="all")

print(
    "Empty rows removed:",
    before - len(df)
)

# ------------------------------------------------------------
# Remove rows without disease
# ------------------------------------------------------------

target = df.columns[0]

before = len(df)

df = df.dropna(subset=[target])

print(
    "Rows without disease removed:",
    before - len(df)
)

# ------------------------------------------------------------
# Normalize disease names
# ------------------------------------------------------------

df[target] = (
    df[target]
    .astype(str)
    .str.strip()
)

# ------------------------------------------------------------
# Convert symptom columns to numeric
# ------------------------------------------------------------

features = df.columns[1:]

for column in features:

    df[column] = pd.to_numeric(
        df[column],
        errors="coerce"
    ).fillna(0)

# ------------------------------------------------------------
# Keep only valid symptom values
# ------------------------------------------------------------

for column in features:

    df[column] = (
        df[column]
        .clip(lower=0, upper=1)
        .astype("int8")
    )

# ------------------------------------------------------------
# Remove duplicate records
# ------------------------------------------------------------

before = len(df)

df = df.drop_duplicates()

print(
    "Duplicate rows removed:",
    before - len(df)
)

# ------------------------------------------------------------
# Remove records containing no symptoms
# ------------------------------------------------------------

symptom_count = df[features].sum(axis=1)

before = len(df)

df = df[symptom_count > 0]

print(
    "Zero-symptom rows removed:",
    before - len(df)
)

# ------------------------------------------------------------
# Remove exact duplicate symptom patterns
#
# IMPORTANT:
# We do NOT remove all repeated disease examples.
# We only remove identical symptom + disease rows.
# ------------------------------------------------------------

before = len(df)

df = df.drop_duplicates(
    subset=list(features) + [target]
)

print(
    "Duplicate symptom-disease records removed:",
    before - len(df)
)

# ------------------------------------------------------------
# Save
# ------------------------------------------------------------

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n----------------------------------------------")

print(
    "Clean dataset shape:",
    df.shape
)

print(
    "Number of diseases:",
    df[target].nunique()
)

print(
    "Output:",
    OUTPUT_FILE.resolve()
)

print("----------------------------------------------")

print("\n✅ DATASET PREPARATION COMPLETE\n")