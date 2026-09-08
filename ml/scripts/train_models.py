import pandas as pd
import numpy as np
import joblib

from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# ============================================================
# HEALTHAI MEMORY-EFFICIENT MODEL TRAINING
# ============================================================

DATASET = Path("dataset/clean_healthai.csv")

MODEL_DIR = Path("models")
RESULT_DIR = Path("results")

MODEL_DIR.mkdir(exist_ok=True)
RESULT_DIR.mkdir(exist_ok=True)


print("\n==============================================")
print("   HEALTHAI MEMORY-EFFICIENT MODEL TRAINING")
print("==============================================\n")


# ============================================================
# LOAD ONLY REQUIRED DATA
# ============================================================

print("Loading dataset...")

df = pd.read_csv(DATASET)

target = df.columns[0]
features = list(df.columns[1:])


print("Original shape:", df.shape)
print("Diseases:", df[target].nunique())
print("Symptoms:", len(features))


# ============================================================
# REMOVE SINGLE-SAMPLE DISEASES
# ============================================================

counts = df[target].value_counts()

valid_diseases = counts[counts >= 2].index

df = df[
    df[target].isin(valid_diseases)
].copy()


print("\nAfter rare-class handling:")
print("Rows:", len(df))
print("Diseases:", df[target].nunique())


# ============================================================
# MEMORY OPTIMIZATION
# ============================================================

print("\nOptimizing memory...")

X = df[features].astype(np.uint8)

y_text = df[target].astype(str)


print(
    "Feature memory:",
    round(X.memory_usage(deep=True).sum() / 1024**2, 2),
    "MB"
)


# ============================================================
# ENCODE TARGET
# ============================================================

encoder = LabelEncoder()

y = encoder.fit_transform(y_text)


# ============================================================
# STRATIFIED SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,

    test_size=0.20,

    random_state=42,

    stratify=y
)


print("\nTraining rows:", len(X_train))
print("Testing rows:", len(X_test))


# ============================================================
# MEMORY CONTROL
#
# Use a maximum of 60,000 training records.
#
# We preserve disease classes by selecting examples
# across the training set rather than taking only the
# first N rows.
# ============================================================

MAX_TRAIN_ROWS = 60000


if len(X_train) > MAX_TRAIN_ROWS:

    print(
        f"\nTraining dataset is large."
        f"\nReducing training rows to {MAX_TRAIN_ROWS:,}..."
    )

    train_temp = pd.DataFrame(
        X_train,
        index=X_train.index
    )

    train_temp["__target__"] = y_train

    sampled_parts = []

    # Allocate approximately equal representation
    # while respecting available examples.

    diseases = train_temp["__target__"].unique()

    per_class = max(
        1,
        MAX_TRAIN_ROWS // len(diseases)
    )

    for disease in diseases:

        group = train_temp[
            train_temp["__target__"] == disease
        ]

        n = min(
            len(group),
            per_class
        )

        sampled_parts.append(
            group.sample(
                n=n,
                random_state=42
            )
        )

    sampled = pd.concat(
        sampled_parts
    )

    # If fewer than desired rows were selected,
    # fill from remaining training data.

    if len(sampled) < MAX_TRAIN_ROWS:

        remaining = train_temp.drop(
            sampled.index,
            errors="ignore"
        )

        needed = MAX_TRAIN_ROWS - len(sampled)

        if len(remaining) > 0:

            extra = remaining.sample(
                n=min(
                    needed,
                    len(remaining)
                ),
                random_state=42
            )

            sampled = pd.concat(
                [sampled, extra]
            )

    sampled = sampled.sample(
        frac=1,
        random_state=42
    )

    y_train = sampled["__target__"].to_numpy(
        dtype=np.int32
    )

    X_train = sampled.drop(
        columns=["__target__"]
    ).astype(np.uint8)

    print(
        "Final training rows:",
        len(X_train)
    )


# ============================================================
# RANDOM FOREST
# ============================================================

print("\n==============================================")
print("Training Random Forest")
print("==============================================\n")


model = RandomForestClassifier(

    n_estimators=150,

    max_depth=25,

    min_samples_leaf=2,

    class_weight="balanced",

    random_state=42,

    n_jobs=2
)


model.fit(
    X_train,
    y_train
)


print("\n✅ Model training completed.")


# ============================================================
# TEST
# ============================================================

print("\nTesting model...")

predictions = model.predict(
    X_test
)


accuracy = accuracy_score(
    y_test,
    predictions
)


print(
    "\nAccuracy:",
    round(
        accuracy * 100,
        2
    ),
    "%"
)


# ============================================================
# SAVE MODEL
# ============================================================

joblib.dump(
    model,
    MODEL_DIR / "best_model.pkl"
)

joblib.dump(
    encoder,
    MODEL_DIR / "label_encoder.pkl"
)

joblib.dump(
    features,
    MODEL_DIR / "feature_names.pkl"
)


# ============================================================
# SAVE REPORT
# ============================================================

report = classification_report(

    y_test,

    predictions,

    labels=np.unique(y_test),

    target_names=encoder.inverse_transform(
        np.unique(y_test)
    ),

    zero_division=0
)


with open(
    RESULT_DIR / "best_model_report.txt",
    "w",
    encoding="utf-8"
) as f:

    f.write(
        "HealthAI Random Forest Model\n\n"
    )

    f.write(
        f"Accuracy: {accuracy:.6f}\n\n"
    )

    f.write(report)


# ============================================================
# SAVE COMPARISON
# ============================================================

comparison = pd.DataFrame({

    "Model": [
        "Memory Efficient Random Forest"
    ],

    "Accuracy": [
        accuracy
    ]

})


comparison.to_csv(

    RESULT_DIR /
    "model_comparison.csv",

    index=False
)


# ============================================================
# COMPLETE
# ============================================================

print("\n==============================================")
print("             TRAINING COMPLETE")
print("==============================================")

print(
    "Model: Random Forest"
)

print(
    "Accuracy:",
    round(
        accuracy * 100,
        2
    ),
    "%"
)

print("\nSaved files:")

print(
    "models/best_model.pkl"
)

print(
    "models/label_encoder.pkl"
)

print(
    "models/feature_names.pkl"
)

print(
    "results/best_model_report.txt"
)

print(
    "results/model_comparison.csv"
)

print("\n==============================================\n")