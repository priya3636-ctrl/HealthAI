# 🏥 HealthAI — Intelligent Healthcare Assistant

> **An AI-powered healthcare platform for disease prediction, personalized health information, patient history, and intelligent health assistance.**

## 🌐 Live Demo

**HealthAI Web Application:**
https://healthai-frontend-kappa.vercel.app

**Dashboard:**
https://healthai-frontend-kappa.vercel.app/dashboard.html

**Disease Prediction:**
https://healthai-frontend-kappa.vercel.app/prediction.html

**GitHub Repository:**
https://github.com/priya3636-ctrl/HealthAI

---

## 🎯 Problem Statement

People often experience multiple symptoms but may not know what they could indicate or what type of healthcare information to consider next.

**HealthAI** provides an interactive platform that analyzes selected symptoms using a machine-learning-based prediction system and presents possible disease-related information along with supporting health information.

The system is designed as an **educational and decision-support application**, not as a replacement for professional medical diagnosis.

---

## ✨ Key Features

* 🔐 User registration and secure login
* 🩺 Symptom-based disease prediction
* 🤖 Machine-learning-powered prediction engine
* 📊 Prediction confidence and supporting symptom information
* 💡 Disease information and personalized health recommendations
* 📋 Prediction history
* 📄 Health prediction report generation
* 🏥 Nearby hospital information
* 💬 Healthcare chatbot with local/offline health-information retrieval
* 👤 User profile management
* ⏰ Health reminders
* 📱 Responsive web interface
* ⚡ REST API-based architecture

---

## 🧠 Machine Learning

HealthAI uses a trained **Random Forest classification model** as part of its prediction system.

### Model Details

| Property                  | Value                    |
| ------------------------- | ------------------------ |
| Model                     | Random Forest Classifier |
| Number of trees           | 150                      |
| Maximum depth             | 25                       |
| Minimum samples per leaf  | 2                        |
| Number of features        | 377                      |
| Number of disease classes | 702                      |
| Class weighting           | Balanced                 |
| Random state              | 42                       |

The application combines the machine-learning output with symptom/profile-based scoring to generate the final prediction result.

### Prediction Scoring

The current hybrid prediction system combines:

* **60%** profile-based score
* **30%** weighted symptom score
* **10%** machine-learning score

This hybrid approach is intended to use both learned model information and symptom-matching information.

---

## 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │      HealthAI UI      │
                         │   HTML / CSS / JS     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Vercel Frontend    │
                         │    Web Application   │
                         └──────────┬───────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  │                                   │
                  ▼                                   ▼
        ┌──────────────────┐                ┌──────────────────┐
        │ Node.js / Express│                │ FastAPI ML API   │
        │ Backend           │                │ Local ML Server  │
        └────────┬─────────┘                └────────┬─────────┘
                 │                                   │
                 ▼                                   ▼
        ┌──────────────────┐                ┌──────────────────┐
        │ MongoDB Atlas    │                │ Random Forest    │
        │ User & History   │                │ + Hybrid Scoring │
        └──────────────────┘                └──────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Vercel

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Authentication

### Machine Learning

* Python
* FastAPI
* scikit-learn
* Random Forest
* Label Encoding
* Symptom matching
* Hybrid prediction scoring

### Other

* REST APIs
* JSON data
* SQLite for local ML prediction records
* PDF report generation

---

## 📂 Project Structure

```text
HealthAI/
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── prediction.html
│   ├── history.html
│   ├── profile.html
│   ├── chatbot.html
│   ├── css/
│   ├── js/
│   └── images/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
└── ml/
    ├── backend/
    │   ├── api/
    │   └── database/
    │
    ├── models/
    │   ├── best_model.pkl
    │   ├── label_encoder.pkl
    │   └── feature_names.pkl
    │
    ├── data/
    ├── hybrid_predict.py
    └── ...
```

---

## 🔄 Prediction Workflow

```text
User selects symptoms
        ↓
Frontend sends symptoms
        ↓
FastAPI prediction API
        ↓
Symptom matching
        ↓
Random Forest prediction
        ↓
Hybrid scoring
        ↓
Top disease predictions
        ↓
Disease information
        ↓
Health recommendations
        ↓
Prediction history
        ↓
Optional PDF report
```

---

## 📊 Prediction Results

HealthAI presents multiple prediction results rather than displaying only a single output.

The result can include:

* Predicted disease
* Confidence percentage
* Profile score
* Weighted symptom score
* Machine-learning score
* Matched symptoms
* Expected symptoms
* Disease description
* Recommended specialist
* Treatment-related information
* Precautions
* Food-related information
* Common symptoms

---

## 💬 Healthcare Chatbot

HealthAI includes a healthcare chatbot designed for retrieving information from the application's available health-information data.

The current implementation uses **local/offline retrieval** and does not depend on the Gemini API.

This helps keep the core chatbot functionality independent of an external generative-AI API.

---

## 🔐 Authentication & Data

The application includes:

* User registration
* User login
* JWT-based authentication
* Protected backend routes
* MongoDB Atlas integration
* Prediction history associated with users

---

## 📄 Health Reports

After receiving a prediction result, users can:

1. View the prediction.
2. Select **Download Report**.
3. Generate a printable HealthAI report.
4. Save the report as PDF through the browser's print dialog.

---

## 🚀 Deployment

### Frontend

The frontend is deployed using Vercel.

**Production URL:**

https://healthai-frontend-kappa.vercel.app

### Backend

The Node.js/Express backend is deployed separately.

**Backend URL:**

https://healthai-backend-ashy.vercel.app

### Machine Learning API

The current large machine-learning model is executed through the local FastAPI ML service.

The trained model is approximately **1.2 GB**, so the current free deployment architecture does not load the ML model directly into Vercel.

For a complete local demonstration:

```powershell
cd "C:\Users\KOTESWARARAO\Downloads\Project-Info\HealthAI"

python -m uvicorn ml.backend.api.main:app --host 0.0.0.0 --port 8000
```

The ML API will run at:

```text
http://127.0.0.1:8000
```

---

## 💻 Local Development

### 1. Clone the repository

```bash
git clone https://github.com/priya3636-ctrl/HealthAI.git
cd HealthAI
```

### 2. Start the backend

```bash
cd backend
npm install
npm start
```

### 3. Start the frontend

From the frontend directory:

```bash
python -m http.server 5500
```

Then open:

```text
http://127.0.0.1:5500
```

### 4. Start the ML API

From the project root:

```powershell
python -m uvicorn ml.backend.api.main:app --host 0.0.0.0 --port 8000
```

---

## ⚠️ Important Deployment Note

The public Vercel frontend and backend are available online, while the current **1.2 GB machine-learning model is intended to run through the local FastAPI ML service**.

Therefore, the public frontend should not be represented as a completely cloud-hosted machine-learning inference service.

The project is structured so the ML model and supporting files can be preserved and redeployed when suitable free compute infrastructure is available.

---

## 🧪 Current Project Status

| Module                | Status      |
| --------------------- | ----------- |
| User Authentication   | ✅ Completed |
| Dashboard             | ✅ Completed |
| Disease Prediction UI | ✅ Completed |
| ML Prediction API     | ✅ Completed |
| Hybrid Prediction     | ✅ Completed |
| Prediction History    | ✅ Completed |
| PDF Report            | ✅ Completed |
| Predict Again         | ✅ Completed |
| Disease Information   | ✅ Completed |
| Chatbot               | ✅ Completed |
| Profile               | ✅ Completed |
| Reminders             | ✅ Completed |
| Nearby Hospitals      | ✅ Completed |
| Frontend Deployment   | ✅ Completed |
| Backend Deployment    | ✅ Completed |
| GitHub Repository     | ✅ Completed |
| ML Model Repository   | ✅ Completed |

---

## 🔬 Project Highlights

HealthAI demonstrates the integration of:

```text
Machine Learning
      +
Symptom Analysis
      +
REST APIs
      +
Web Development
      +
Authentication
      +
Database Management
      +
Prediction History
      +
Report Generation
```

The project focuses on building a complete end-to-end healthcare application rather than only training a machine-learning model.

---

## ⚕️ Disclaimer

**HealthAI is an educational and informational software project.**

The predictions and health information provided by this application are not medical diagnoses and should not be used as a substitute for professional medical advice, examination, or treatment.

Users should consult qualified healthcare professionals for medical decisions.

---

## 👩‍💻 Developer

**Priyanka Nerusu**

B.Tech — Data Science

GitHub:
https://github.com/priya3636-ctrl

---

## ⭐ Project

If you find this project useful or interesting, consider starring the repository.

**HealthAI — Intelligent Healthcare Assistant**
