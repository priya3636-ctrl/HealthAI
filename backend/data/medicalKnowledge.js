const medicalKnowledge = {

    greetings: [
        "hello",
        "hi",
        "hey",
        "good morning",
        "good afternoon",
        "good evening"
    ],

    healthy: {
        keywords: [
            "healthy",
            "diet",
            "food",
            "exercise",
            "fitness",
            "lifestyle",
            "nutrition",
            "weight"
        ],
        answer: `
Healthy Lifestyle Tips:

• Eat a balanced diet rich in fruits and vegetables.
• Drink at least 2–3 liters of water daily.
• Exercise for at least 30 minutes every day.
• Sleep for 7–8 hours every night.
• Avoid smoking and alcohol.
• Reduce stress through meditation or yoga.
• Get regular health checkups.
`
    },

    fever: {
        keywords: [
            "fever",
            "high temperature",
            "body temperature"
        ],
        answer: `
Fever Information:

• Fever is usually a sign that your body is fighting an infection.
• Drink plenty of fluids.
• Take adequate rest.
• Use medicines only as advised by a doctor.
• Seek medical attention if fever is very high or lasts more than 3 days.
`
    },

    diabetes: {
        keywords: [
            "diabetes",
            "blood sugar",
            "glucose"
        ],
        answer: `
Diabetes Information:

• Diabetes is a condition where blood sugar levels become too high.
• Eat low-sugar foods.
• Exercise regularly.
• Monitor blood glucose levels.
• Take prescribed medication.
• Consult your doctor regularly.
`
    },

    hypertension: {
        keywords: [
            "bp",
            "blood pressure",
            "hypertension"
        ],
        answer: `
Hypertension Information:

• Reduce salt intake.
• Exercise regularly.
• Maintain a healthy weight.
• Avoid smoking.
• Take medicines as prescribed.
• Monitor blood pressure frequently.
`
    },

    cold: {
        keywords: [
            "cold",
            "cough",
            "flu"
        ],
        answer: `
Cold & Cough:

• Drink warm fluids.
• Take sufficient rest.
• Gargle with warm salt water.
• Eat nutritious food.
• Consult a doctor if symptoms worsen.
`
    },

    headache: {
        keywords: [
            "headache",
            "migraine"
        ],
        answer: `
Headache Advice:

• Stay hydrated.
• Get enough sleep.
• Reduce stress.
• Avoid excessive screen time.
• Consult a doctor if headaches are frequent or severe.
`
    },

    firstAid: {
        keywords: [
            "first aid",
            "burn",
            "bleeding",
            "injury",
            "wound"
        ],
        answer: `
Basic First Aid:

• Clean wounds with clean water.
• Apply gentle pressure to stop bleeding.
• Cover wounds using sterile bandages.
• Cool burns under running water.
• Seek emergency care for severe injuries.
`
    },

    medicine: {
        keywords: [
            "medicine",
            "tablet",
            "drug",
            "medication"
        ],
        answer: `
Medicine Guidance:

• Never self-medicate.
• Always follow your doctor's prescription.
• Complete the full course of antibiotics.
• Check expiry dates before use.
`
    }

};

module.exports = medicalKnowledge;