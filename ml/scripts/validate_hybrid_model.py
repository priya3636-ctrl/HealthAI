from hybrid_predict import (
    match_symptoms,
    predict,
    disease_profiles,
    encoder,
    feature_names,
)


print("\n==============================================")
print("       HEALTHAI HYBRID MODEL VALIDATION")
print("==============================================\n")

print("Model diseases:", len(encoder.classes_))
print("Disease profiles:", len(disease_profiles))
print("Symptoms:", len(feature_names))

# ============================================================
# TEST CASES
# ============================================================

TEST_CASES = [
    {
        "name": "Asthma-like symptoms",
        "symptoms": [
            "coughing_up_sputum",
            "nasal_congestion",
            "cough",
            "allergic_reaction",
            "difficulty_breathing",
            "wheezing",
        ],
        "expected": "asthma",
    },
    {
        "name": "Respiratory infection-like symptoms",
        "symptoms": [
            "fever",
            "cough",
            "difficulty_breathing",
            "sharp_chest_pain",
        ],
        "expected": None,
    },
    {
        "name": "Common respiratory symptoms",
        "symptoms": [
            "cough",
            "nasal_congestion",
            "sore_throat",
        ],
        "expected": None,
    },
]


# ============================================================
# RUN VALIDATION
# ============================================================

passed = 0

for number, test in enumerate(TEST_CASES, start=1):

    print("\n==============================================")
    print(f"TEST {number}: {test['name']}")
    print("==============================================")

    symptom_text = ", ".join(test["symptoms"])

    print("\nInput:")
    print(symptom_text)

    matched = match_symptoms(symptom_text)

    print("\nMatched symptoms:")

    for symptom in matched:
        print("✓", symptom)

    if not matched:
        print("❌ No symptoms matched")
        continue

    results = predict(matched)

    print("\nTop 5 predictions:")

    for rank, result in enumerate(results[:5], start=1):

        print(
            f"{rank}. {result['disease']} "
            f"| Hybrid: {result['hybrid_score'] * 100:.2f}% "
            f"| Profile: {result['profile_score'] * 100:.2f}% "
            f"| Weighted: {result['weighted_score'] * 100:.2f}% "
            f"| ML: {result['ml_score'] * 100:.2f}%"
        )

    best = results[0]

    print("\nBest prediction:")
    print(best["disease"])

    if test["expected"]:

        if best["disease"].lower() == test["expected"].lower():
            print("✅ EXPECTED RESULT MATCHED")
            passed += 1
        else:
            print(
                f"⚠️ Expected: {test['expected']}"
            )

    else:
        print("✅ Prediction generated successfully")
        passed += 1


# ============================================================
# FINAL REPORT
# ============================================================

print("\n==============================================")
print("           VALIDATION COMPLETE")
print("==============================================")

print(
    f"\nTests passed: {passed}/{len(TEST_CASES)}"
)

if passed == len(TEST_CASES):

    print("\n🎉 HEALTHAI HYBRID SYSTEM VALIDATION PASSED")

else:

    print(
        "\n⚠️ Some validation tests need review."
    )

print("\n==============================================")