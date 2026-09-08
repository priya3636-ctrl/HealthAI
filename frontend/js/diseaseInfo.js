const diseaseInfo = {

    "asthma": {
        description: "Asthma is a chronic disease that affects the airways and makes breathing difficult.",
        causes: [
            "Dust allergy",
            "Air pollution",
            "Smoking",
            "Cold weather"
        ],
        symptoms: [
            "Shortness of breath",
            "Cough",
            "Chest tightness",
            "Wheezing"
        ],
        treatment: [
            "Use prescribed inhalers",
            "Take medicines regularly",
            "Avoid dust and smoke",
            "Practice breathing exercises"
        ],
        foods: [
            "Fresh fruits",
            "Green vegetables",
            "Warm fluids",
            "Vitamin C rich foods"
        ],
        avoid: [
            "Smoking",
            "Cold drinks",
            "Dust exposure",
            "Air pollution"
        ],
        doctor: "Consult a Pulmonologist if symptoms continue."
    },

    "diabetes": {
        description: "Diabetes is a disease where blood sugar levels remain higher than normal.",
        causes: [
            "Genetics",
            "Obesity",
            "Lack of exercise",
            "Poor diet"
        ],
        symptoms: [
            "Frequent urination",
            "Increased thirst",
            "Weight loss",
            "Fatigue"
        ],
        treatment: [
            "Take prescribed medicines",
            "Monitor blood sugar",
            "Exercise daily",
            "Maintain healthy weight"
        ],
        foods: [
            "Whole grains",
            "Vegetables",
            "Low sugar fruits",
            "High fiber foods"
        ],
        avoid: [
            "Soft drinks",
            "Sugary foods",
            "Fast food",
            "Excess sweets"
        ],
        doctor: "Consult an Endocrinologist."
    },

    "hypertension": {
        description: "Hypertension is high blood pressure that increases the risk of heart disease.",
        causes: [
            "Stress",
            "High salt intake",
            "Obesity",
            "Smoking"
        ],
        symptoms: [
            "Headache",
            "Dizziness",
            "Blurred vision",
            "Chest pain"
        ],
        treatment: [
            "Reduce salt",
            "Exercise",
            "Take prescribed medicines",
            "Maintain healthy weight"
        ],
        foods: [
            "Leafy vegetables",
            "Bananas",
            "Oats",
            "Low-fat dairy"
        ],
        avoid: [
            "High salt foods",
            "Alcohol",
            "Smoking",
            "Processed foods"
        ],
        doctor: "Consult a Cardiologist."
    }

};

// Default information for diseases not yet added
const defaultDiseaseInfo = {
    description: "HealthAI identified this disease using the trained machine learning model. Detailed information for this disease will be added in future updates.",
    causes: [
        "May vary from person to person",
        "Genetic factors",
        "Lifestyle factors",
        "Environmental factors"
    ],
    symptoms: [
        "Symptoms depend on the specific disease",
        "Consult a healthcare professional for diagnosis"
    ],
    treatment: [
        "Follow medical advice",
        "Do not self-medicate",
        "Consult a specialist"
    ],
    foods: [
        "Healthy balanced diet",
        "Fresh fruits",
        "Vegetables",
        "Drink enough water"
    ],
    avoid: [
        "Smoking",
        "Alcohol",
        "Processed foods",
        "Ignoring symptoms"
    ],
    doctor: "Please consult the appropriate medical specialist for proper diagnosis and treatment."
};