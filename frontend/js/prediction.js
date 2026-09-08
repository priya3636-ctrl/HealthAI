// ============================================================
// HealthAI - Disease Prediction
// prediction.js
// ============================================================

console.log("HealthAI prediction.js loaded successfully.");


// ============================================================
// CONFIGURATION
// ============================================================
const ML_API_URL = "http://127.0.0.1:8000";
const BACKEND_API_URL = "http://localhost:5000";
const SYMPTOMS_URL = "http://127.0.0.1:8000/data/symptoms.json";

const DISEASE_INFO_URL = "http://127.0.0.1:8000/data/diseaseInfo.json";


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let allSymptoms = [];
let diseaseInfo = {};

let lastPrediction = null;
let lastSelectedSymptoms = [];


// ============================================================
// DEFAULT DISEASE INFORMATION
// ============================================================

const defaultDiseaseInfo = {

    description:
        "The prediction is generated using the HealthAI machine learning model based on the symptoms selected.",

    doctor:
        "Please consult a qualified healthcare professional for proper diagnosis.",

    treatment: [
        "Consult a doctor before taking medicines.",
        "Follow professional medical advice.",
        "Take adequate rest."
    ],

    avoid: [
        "Do not self-medicate.",
        "Seek medical attention if symptoms become severe."
    ],

    foods: [
        "Maintain a balanced and nutritious diet.",
        "Drink sufficient water."
    ],

    symptoms: []

};


// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Prediction page DOM loaded.");

    loadUser();

    loadSymptoms();

    loadDiseaseInfo();

    setupSearch();

    setupPredictionButton();

    setupLogout();

});


// ============================================================
// LOAD USER
// ============================================================

function loadUser() {

    const usernameElement =
        document.getElementById("username");

    if (!usernameElement) {
        return;
    }

    try {

        const user =
            JSON.parse(
                localStorage.getItem("user")
            );

        if (user && user.name) {

            usernameElement.textContent =
                `Welcome, ${user.name}`;

        } else {

            usernameElement.textContent =
                "Welcome";

        }

    }

    catch (error) {

        console.warn(
            "Unable to read logged-in user."
        );

        usernameElement.textContent =
            "Welcome";

    }

}


// ============================================================
// LOAD SYMPTOMS
// ============================================================

async function loadSymptoms() {

    const container =
        document.getElementById(
            "symptomContainer"
        );

    if (!container) {

        console.error(
            "ERROR: symptomContainer was not found."
        );

        return;

    }


    // Show loading

    container.innerHTML = `

        <div class="loading">

            <i class="fa-solid fa-spinner fa-spin"></i>

            <p>Loading symptoms...</p>

        </div>

    `;


    console.log(
        "Loading symptoms from:",
        SYMPTOMS_URL
    );


    try {

        const response =
            await fetch(
                SYMPTOMS_URL,
                {
                    cache: "no-store"
                }
            );


        console.log(
            "Symptoms HTTP status:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                `Unable to load symptoms.json. HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        // Accept either:
        //
        // ["cough", "fever"]
        //
        // OR
        //
        // { "symptoms": ["cough", "fever"] }

        if (Array.isArray(data)) {

            allSymptoms = data;

        }

        else if (
            data &&
            Array.isArray(data.symptoms)
        ) {

            allSymptoms =
                data.symptoms;

        }

        else {

            throw new Error(
                "symptoms.json does not contain a valid symptom array."
            );

        }


        // Clean symptoms

        allSymptoms = [
            ...new Set(

                allSymptoms

                    .filter(
                        function (symptom) {

                            return (
                                typeof symptom === "string"
                            );

                        }
                    )

                    .map(
                        function (symptom) {

                            return symptom.trim();

                        }
                    )

                    .filter(Boolean)

            )
        ];


        console.log(
            `Loaded ${allSymptoms.length} symptoms.`
        );


        if (allSymptoms.length === 0) {

            throw new Error(
                "No symptoms were found in symptoms.json."
            );

        }


        // Display symptoms

        renderSymptoms(
            allSymptoms
        );


        console.log(
            "Symptoms displayed successfully."
        );

    }

    catch (error) {

        console.error(
            "SYMPTOM LOADING ERROR:",
            error
        );


        container.innerHTML = `

            <div class="error">

                <i class="fa-solid fa-circle-xmark"></i>

                <h3>
                    Unable to load symptoms
                </h3>

                <p>
                    ${escapeHtml(
                        error.message
                    )}
                </p>

                <button
                    type="button"
                    id="retrySymptomsBtn"
                    class="again-btn">

                    <i class="fa-solid fa-rotate-right"></i>

                    Retry

                </button>

            </div>

        `;


        const retryButton =
            document.getElementById(
                "retrySymptomsBtn"
            );


        if (retryButton) {

            retryButton.addEventListener(
                "click",
                loadSymptoms
            );

        }

    }

}


// ============================================================
// RENDER SYMPTOMS
// ============================================================

function renderSymptoms(
    symptoms
) {

    const container =
        document.getElementById(
            "symptomContainer"
        );

    if (!container) {
        return;
    }


    container.innerHTML = "";


    symptoms.forEach(
        function (symptom, index) {

            const label =
                document.createElement(
                    "label"
                );


            label.className =
                "symptom-item";


            const checkbox =
                document.createElement(
                    "input"
                );


            checkbox.type =
                "checkbox";


            checkbox.id =
                `symptom_${index}`;


            checkbox.value =
                symptom;


            const span =
                document.createElement(
                    "span"
                );


            span.textContent =
                formatSymptomName(
                    symptom
                );


            label.appendChild(
                checkbox
            );


            label.appendChild(
                span
            );


            container.appendChild(
                label
            );

        }
    );

}


// ============================================================
// FORMAT SYMPTOM NAME
// ============================================================

function formatSymptomName(
    symptom
) {

    return String(symptom)

        .replace(
            /_/g,
            " "
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim()

        .replace(
            /\w\S*/g,
            function (word) {

                return (
                    word.charAt(0).toUpperCase() +
                    word.substring(1).toLowerCase()
                );

            }
        );

}


// ============================================================
// SEARCH SYMPTOMS
// ============================================================

function setupSearch() {

    const searchInput =
        document.getElementById(
            "searchSymptoms"
        );


    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "input",
        function () {

            const searchText =
                searchInput.value
                    .trim()
                    .toLowerCase();


            const filteredSymptoms =
                allSymptoms.filter(
                    function (symptom) {

                        return String(symptom)
                            .toLowerCase()
                            .replace(
                                /_/g,
                                " "
                            )
                            .includes(
                                searchText
                            );

                    }
                );


            renderSymptoms(
                filteredSymptoms
            );

        }
    );

}


// ============================================================
// PREDICTION BUTTON
// ============================================================

function setupPredictionButton() {

    const predictBtn =
        document.getElementById(
            "predictBtn"
        );


    if (!predictBtn) {

        console.error(
            "ERROR: predictBtn not found."
        );

        return;

    }


    predictBtn.addEventListener(
        "click",
        predictDisease
    );


    console.log(
        "Prediction button connected successfully."
    );

}


// ============================================================
// PREDICT DISEASE
// ============================================================

async function predictDisease() {

    const predictBtn =
        document.getElementById(
            "predictBtn"
        );


    const reportPanel =
        document.querySelector(
            ".report-panel"
        );


    const selectedSymptoms = [];


    document
        .querySelectorAll(
            "#symptomContainer input[type='checkbox']:checked"
        )
        .forEach(
            function (checkbox) {

                selectedSymptoms.push(
                    checkbox.value
                );

            }
        );


    console.log(
        "Selected symptoms:",
        selectedSymptoms
    );


    // --------------------------------------------------------
    // Check symptoms
    // --------------------------------------------------------

    if (
        selectedSymptoms.length === 0
    ) {

        alert(
            "Please select at least one symptom."
        );

        return;

    }


    // Save selected symptoms

    lastSelectedSymptoms =
        [...selectedSymptoms];


    // --------------------------------------------------------
    // Button loading
    // --------------------------------------------------------

    if (predictBtn) {

        predictBtn.disabled =
            true;


        predictBtn.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            Analysing...

        `;

    }


    // --------------------------------------------------------
    // Report loading
    // --------------------------------------------------------

    if (reportPanel) {

        reportPanel.innerHTML = `

            <div class="loading">

                <i class="fa-solid fa-spinner fa-spin"></i>

                <h2>
                    AI is analysing your symptoms...
                </h2>

                <p>
                    Please wait while HealthAI
                    generates your prediction.
                </p>

            </div>

        `;

    }


    // --------------------------------------------------------
    // Send request
    // --------------------------------------------------------

    try {

        console.log(
            "Sending prediction request to:",
            `${ML_API_URL}/predict`
        );


        const response =
            await fetch(`${ML_API_URL}/predict`, 
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            symptoms: selectedSymptoms.map(s => s.replace(/^symptom_/, ""))

                        })

                }
            );


        console.log(
            "Prediction HTTP status:",
            response.status
        );


        // ----------------------------------------------------
        // Read response as text first
        // ----------------------------------------------------

        const responseText =
            await response.text();


        console.log(
            "Prediction raw response:",
            responseText
        );


        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        }

        catch (jsonError) {

            throw new Error(
                "Backend did not return valid JSON."
            );

        }


        // ----------------------------------------------------
        // Check HTTP status
        // ----------------------------------------------------

        if (!response.ok) {

            throw new Error(

                data.message ||
                data.error ||
                `Prediction failed with HTTP ${response.status}`

            );

        }


        console.log(
            "Prediction API response:",
            data
        );


        // ----------------------------------------------------
        // Accept different response names
        // ----------------------------------------------------

        const results =
            data.prediction ||
            data.predictions ||
            data.results;


        if (
            !Array.isArray(results) ||
            results.length === 0
        ) {

            throw new Error(
                "Backend returned no prediction results."
            );

        }


        console.log(
            "Prediction results:",
            results
        );


        lastPrediction =
            results;


        // Show report

        showPrediction(
            results,
            selectedSymptoms
        );

    }

    catch (error) {

        console.error(
            "PREDICTION ERROR:",
            error
        );


        if (reportPanel) {

            reportPanel.innerHTML = `

                <div class="error">

                    <i class="fa-solid fa-circle-xmark"></i>

                    <h2>
                        Prediction Failed
                    </h2>

                    <p>
                        ${escapeHtml(
                            error.message ||
                            "Unable to connect to HealthAI backend."
                        )}
                    </p>

                    <button
                        type="button"
                        class="again-btn"
                        id="retryPredictionBtn">

                        <i class="fa-solid fa-rotate-right"></i>

                        Try Again

                    </button>

                </div>

            `;


            const retryButton =
                document.getElementById(
                    "retryPredictionBtn"
                );


            if (retryButton) {

                retryButton.addEventListener(
                    "click",
                    predictDisease
                );

            }

        }

    }

    finally {

        if (predictBtn) {

            predictBtn.disabled =
                false;


            predictBtn.innerHTML = `

                <i class="fa-solid fa-microchip"></i>

                Predict Disease

            `;

        }

    }

}


// ============================================================
// LOAD DISEASE INFORMATION
// ============================================================

async function loadDiseaseInfo() {

    try {

        const response =
            await fetch(
                DISEASE_INFO_URL,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            console.warn(
                "diseaseInfo.json could not be loaded."
            );

            return;

        }


        const data =
            await response.json();


        if (
            data &&
            typeof data === "object"
        ) {

            diseaseInfo =
                data;

        }


        console.log(
            "Disease information loaded successfully."
        );

    }

    catch (error) {

        console.warn(
            "Disease information loading failed:",
            error
        );

    }

}


// ============================================================
// SHOW PREDICTION
// ============================================================

function showPrediction(
    results,
    selectedSymptoms
) {

    const reportPanel =
        document.querySelector(
            ".report-panel"
        );


    if (!reportPanel) {

        console.error(
            "report-panel not found."
        );

        return;

    }


    if (
        !Array.isArray(results) ||
        results.length === 0
    ) {

        reportPanel.innerHTML = `

            <div class="error">

                <h2>
                    No prediction available
                </h2>

                <p>
                    Please try again with different symptoms.
                </p>

            </div>

        `;

        return;

    }


    const top =
        results[0];


    // --------------------------------------------------------
    // Disease name
    // --------------------------------------------------------

    const disease =
        top.disease ||
        top.Disease ||
        top.predictedDisease ||
        top.prediction ||
        "Unknown Disease";


    // --------------------------------------------------------
    // Confidence
    // --------------------------------------------------------

    let confidence = Number(
        top.hybrid_percentage ??
        top.percentage ??
        top.confidence ??
        top.probability ??
        top.score ??
        0
    );


    // Convert decimal probability
    // Example: 0.55 -> 55

    if (
        confidence > 0 &&
        confidence <= 1
    ) {

        confidence =
            confidence * 100;

    }


    confidence =
        Math.min(
            Math.max(
                confidence,
                0
            ),
            100
        );


    // --------------------------------------------------------
    // Disease information
    // --------------------------------------------------------

    const diseaseName =
        String(disease)
            .toLowerCase()
            .trim();


    const info =
        diseaseInfo[diseaseName] ||
        defaultDiseaseInfo;


    // --------------------------------------------------------
    // Save latest prediction
    // --------------------------------------------------------

    lastPrediction = {

        disease:
            disease,

        confidence:
            confidence,

        info:
            info,

        symptoms: selectedSymptoms.map(s => s.replace(/^symptom_/, ""))

    };


    // --------------------------------------------------------
    // Prediction counter
    // --------------------------------------------------------

    let predictionCount =
        Number(
            localStorage.getItem(
                "predictionCount"
            ) || 0
        );


    predictionCount++;


    localStorage.setItem(
        "predictionCount",
        predictionCount
    );


    // --------------------------------------------------------
    // Save history
    // --------------------------------------------------------

    savePredictionHistory(
        disease,
        confidence,
        selectedSymptoms
    );


    // --------------------------------------------------------
    // Risk
    // --------------------------------------------------------

    let riskText =
        "Low Risk";


    if (
        confidence < 50
    ) {

        riskText =
            "Needs Review";

    }

    else if (
        confidence < 75
    ) {

        riskText =
            "Moderate";

    }


    // --------------------------------------------------------
    // Report UI
    // --------------------------------------------------------

    reportPanel.innerHTML = `

        <div class="report-container">


            <div class="report-title">

                <i class="fa-solid fa-file-waveform"></i>

                <h2>
                    AI Diagnosis Report
                </h2>

                <p>
                    Generated by HealthAI Machine Learning System
                </p>

            </div>


            <div class="main-disease-card">


                <div class="disease-icon">

                    <i class="fa-solid fa-heart-pulse"></i>

                </div>


                <h1>
                    ${escapeHtml(disease)}
                </h1>


                <p class="confidence-label">

                    Prediction Confidence

                </p>


                <h2>
                    ${confidence.toFixed(2)}%
                </h2>


                <div class="progress">

                    <div
                        class="progress-bar"
                        style="width:${confidence}%">
                    </div>

                </div>


                <span class="risk-badge">

                    🟢 ${riskText}

                </span>


            </div>


            <div class="report-grid">


                <div class="report-card">

                    <i class="fa-solid fa-circle-info"></i>

                    <h3>
                        Description
                    </h3>

                    <p>
                        ${escapeHtml(
                            info.description ||
                            defaultDiseaseInfo.description
                        )}
                    </p>

                </div>


                <div class="report-card">

                    <i class="fa-solid fa-user-doctor"></i>

                    <h3>
                        Recommended Specialist
                    </h3>

                    <p>
                        ${escapeHtml(
                            info.doctor ||
                            defaultDiseaseInfo.doctor
                        )}
                    </p>

                </div>


                <div class="report-card">

                    <i class="fa-solid fa-capsules"></i>

                    <h3>
                        Treatment
                    </h3>

                    ${createList(
                        info.treatment
                    )}

                </div>


                <div class="report-card">

                    <i class="fa-solid fa-shield-heart"></i>

                    <h3>
                        Precautions
                    </h3>

                    ${createList(
                        info.avoid
                    )}

                </div>


                <div class="report-card">

                    <i class="fa-solid fa-bowl-food"></i>

                    <h3>
                        Recommended Foods
                    </h3>

                    ${createList(
                        info.foods
                    )}

                </div>


                <div class="report-card">

                    <i class="fa-solid fa-stethoscope"></i>

                    <h3>
                        Common Symptoms
                    </h3>

                    ${createList(
                        info.symptoms
                    )}

                </div>


            </div>


            <div class="report-buttons">


                <button
                    type="button"
                    id="downloadBtn"
                    class="download-btn">

                    <i class="fa-solid fa-file-arrow-down"></i>

                    Download Report

                </button>


                <button
                    type="button"
                    id="predictAgainBtn"
                    class="again-btn">

                    <i class="fa-solid fa-rotate-right"></i>

                    Predict Again

                </button>


            </div>


        </div>

    `;


    // Attach report buttons

    setupReportButtons();

}


// ============================================================
// CREATE LIST
// ============================================================

function createList(
    items
) {

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        return `

            <p>
                Information not available.
            </p>

        `;

    }


    return `

        <ul>

            ${items
                .map(
                    function (item) {

                        return `

                            <li>
                                ${escapeHtml(
                                    String(item)
                                )}
                            </li>

                        `;

                    }
                )
                .join("")
            }

        </ul>

    `;

}


// ============================================================
// SAVE PREDICTION HISTORY
// ============================================================

async function savePredictionHistory(
    disease,
    confidence,
    symptoms
) {

    try {

        const token =
            localStorage.getItem("token");


        if (!token) {

            console.warn(
                "No authentication token found. History skipped."
            );

            return;

        }


        console.log(
            "Saving prediction history to:",
            `${BACKEND_API_URL}/api/history`
        );


        const response =
            await fetch(
                `${BACKEND_API_URL}/api/history`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            disease:
                                disease,

                            confidence:
                                confidence,

                            symptoms:
                                symptoms

                        })

                }
            );


        const text =
            await response.text();


        console.log(
            "History HTTP status:",
            response.status
        );


        console.log(
            "History response:",
            text
        );


        if (!response.ok) {

            console.warn(
                "History save failed:",
                response.status,
                text
            );

            return;

        }


        console.log(
            "Prediction history saved successfully."
        );

    }

    catch (error) {

        console.warn(
            "History save failed. Prediction is still valid.",
            error
        );

    }

}