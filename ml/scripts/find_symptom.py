import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

feature_path = BASE_DIR / "models" / "feature_names.pkl"

features = joblib.load(feature_path)

search = input("Enter symptom to search: ").strip().lower()

print("\nMatches:\n")

found = False

for feature in features:

    if search in feature.lower().replace("_", " "):

        print("✓", feature)

        found = True

if not found:
    print("❌ No matching symptom found.")