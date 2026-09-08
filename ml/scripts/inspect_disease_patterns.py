import pandas as pd
from pathlib import Path

DATASET = Path("dataset/clean_healthai.csv")

print("\n==============================================")
print("       HEALTHAI DISEASE PATTERN INSPECTION")
print("==============================================\n")

df = pd.read_csv(DATASET)

target = df.columns[0]
features = list(df.columns[1:])

print("Rows:", len(df))
print("Diseases:", df[target].nunique())
print("Symptoms:", len(features))

print("\nEnter a disease name exactly as shown in the dataset.")
print("Example: diabetes, pneumonia, asthma")
print("\n")

disease = input("Disease: ").strip()

matches = df[
    df[target].astype(str).str.lower()
    == disease.lower()
]

if len(matches) == 0:

    print("\n❌ Disease not found.")

    print("\nSome available diseases:")

    for name in sorted(
        df[target].astype(str).unique()
    )[:100]:

        print("-", name)

    raise SystemExit


print("\n==============================================")
print("DISEASE:", disease)
print("NUMBER OF RECORDS:", len(matches))
print("==============================================")

# Calculate how frequently each symptom appears
symptom_frequency = matches[features].sum()

symptom_frequency = symptom_frequency.sort_values(
    ascending=False
)

print("\nMost common symptoms for this disease:\n")

for symptom, count in symptom_frequency.head(20).items():

    if count > 0:

        percentage = (
            count / len(matches)
        ) * 100

        print(
            f"{symptom}: "
            f"{int(count)}/{len(matches)} "
            f"({percentage:.1f}%)"
        )

print("\n==============================================")
print("RECOMMENDED SYMPTOM PATTERN")
print("==============================================")

common = symptom_frequency[
    symptom_frequency >= len(matches) * 0.50
]

for symptom in common.index:

    print("-", symptom)

print("\n==============================================")