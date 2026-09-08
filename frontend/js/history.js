// ==========================================
// HealthAI - Prediction History
// history.js
// ==========================================


// ==========================================
// CONFIGURATION
// ==========================================

const BACKEND_API_URL = "http://localhost:5000";


// ==========================================
// DOM ELEMENTS
// ==========================================

const historyContainer =
    document.getElementById("historyContainer");

const searchInput =
    document.getElementById("searchPrediction");

const totalPredictions =
    document.getElementById("totalPredictions");

const downloadedReports =
    document.getElementById("downloadedReports");


// ==========================================
// GLOBAL DATA
// ==========================================

let predictionHistory = [];


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadPredictionHistory();

    }
);


// ==========================================
// GET AUTH TOKEN
// ==========================================

function getAuthToken() {

    return localStorage.getItem("token");

}


// ==========================================
// LOAD PREDICTION HISTORY
// ==========================================

async function loadPredictionHistory() {

    showLoading();

    try {

        const token =
            getAuthToken();


        if (!token) {

            throw new Error(
                "Please login again to view prediction history."
            );

        }


        console.log(
            "Loading prediction history from:",
            `${BACKEND_API_URL}/api/history`
        );


        const response =
            await fetch(
                `${BACKEND_API_URL}/api/history`,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        console.log(
            "History HTTP status:",
            response.status
        );


        const responseText =
            await response.text();


        console.log(
            "History raw response:",
            responseText
        );


        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        }

        catch (error) {

            throw new Error(
                "History server returned invalid JSON."
            );

        }


        if (!response.ok) {

            throw new Error(

                data.message ||
                data.error ||
                `History API error: ${response.status}`

            );

        }


        predictionHistory =
            Array.isArray(data.history)
                ? data.history
                : [];


        console.log(
            "Prediction history loaded:",
            predictionHistory
        );


        updateStatistics();


        displayHistory(
            predictionHistory
        );

    }

    catch (error) {

        console.error(
            "Unable to load prediction history:",
            error
        );


        showError(
            error.message
        );

    }

}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics() {

    if (totalPredictions) {

        totalPredictions.textContent =
            predictionHistory.length;

    }


    if (downloadedReports) {

        downloadedReports.textContent =
            getDownloadedReportsCount();

    }

}


// ==========================================
// DISPLAY HISTORY
// ==========================================

function displayHistory(history) {

    if (!historyContainer) {

        console.error(
            "historyContainer not found."
        );

        return;

    }


    if (
        !Array.isArray(history) ||
        history.length === 0
    ) {

        showEmptyHistory();

        return;

    }


    historyContainer.innerHTML = "";


    history.forEach(
        function (prediction) {

            const card =
                createHistoryCard(
                    prediction
                );


            historyContainer.appendChild(
                card
            );

        }
    );

}


// ==========================================
// CREATE HISTORY CARD
// ==========================================

function createHistoryCard(prediction) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "history-card";


    // MongoDB disease field

    const disease =
        formatDiseaseName(
            prediction.disease
        );


    // MongoDB symptoms field

    const symptoms =
        formatSymptoms(
            prediction.symptoms
        );


    // Current MongoDB model does not store
    // matched_symptoms separately

    const matchedSymptoms =
        "Not separately recorded";


    // MongoDB confidence field

    const score =
        formatConfidence(
            prediction.confidence
        );


    const strength =
        getPredictionStrength(
            prediction.confidence
        );


    // MongoDB createdAt field

    const date =
        formatDate(
            prediction.createdAt
        );


    // MongoDB _id

    const predictionId =
        String(
            prediction._id || ""
        );


    card.innerHTML = `

        <div class="history-card-header">

            <h2>

                <i class="fa-solid fa-virus"></i>

                ${escapeHTML(disease)}

            </h2>

        </div>


        <p>

            <strong>

                <i class="fa-solid fa-notes-medical"></i>

                Symptoms:

            </strong>

            ${escapeHTML(symptoms)}

        </p>


        <p>

            <strong>

                <i class="fa-solid fa-check-circle"></i>

                Matched Symptoms:

            </strong>

            ${escapeHTML(matchedSymptoms)}

        </p>


        <p>

            <strong>

                <i class="fa-solid fa-chart-line"></i>

                Match Score:

            </strong>

            ${escapeHTML(score)}

        </p>


        <p>

            <strong>

                <i class="fa-solid fa-signal"></i>

                Strength:

            </strong>

            <span class="prediction-strength">

                ${escapeHTML(strength)}

            </span>

        </p>


        <p>

            <strong>

                <i class="fa-solid fa-calendar"></i>

                Date:

            </strong>

            ${escapeHTML(date)}

        </p>


        <div class="card-buttons">

            <button
                type="button"
                class="download-btn"
                onclick="downloadReport('${predictionId}')">

                <i class="fa-solid fa-file-pdf"></i>

                Download Report

            </button>


            <button
                type="button"
                class="delete-btn"
                onclick="deletePrediction('${predictionId}')">

                <i class="fa-solid fa-trash"></i>

                Delete

            </button>

        </div>

    `;


    return card;

}


// ==========================================
// SEARCH HISTORY
// ==========================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const searchTerm =
                this.value
                    .trim()
                    .toLowerCase();


            if (!searchTerm) {

                displayHistory(
                    predictionHistory
                );

                return;

            }


            const filteredHistory =
                predictionHistory.filter(
                    function (prediction) {

                        const disease =
                            String(
                                prediction.disease || ""
                            )
                                .toLowerCase();


                        const symptoms =
                            Array.isArray(
                                prediction.symptoms
                            )
                                ? prediction.symptoms
                                    .join(" ")
                                    .toLowerCase()
                                : String(
                                    prediction.symptoms || ""
                                )
                                    .toLowerCase();


                        return (
                            disease.includes(searchTerm) ||
                            symptoms.includes(searchTerm)
                        );

                    }
                );


            if (
                filteredHistory.length === 0
            ) {

                historyContainer.innerHTML = `

                    <div class="noHistory">

                        <i class="fa-solid fa-magnifying-glass"></i>

                        <h2>
                            No matching predictions
                        </h2>

                        <p>
                            No prediction matched
                            "${escapeHTML(searchTerm)}".
                        </p>

                    </div>

                `;

                return;

            }


            displayHistory(
                filteredHistory
            );

        }
    );

}


// ==========================================
// DOWNLOAD REPORT
// ==========================================

function downloadReport(id) {

    const prediction =
        predictionHistory.find(
            function (item) {

                return String(
                    item._id
                ) === String(id);

            }
        );


    if (!prediction) {

        alert(
            "Prediction record not found."
        );

        return;

    }


    const disease =
        formatDiseaseName(
            prediction.disease
        );


    const symptoms =
        formatSymptoms(
            prediction.symptoms
        );


    const score =
        formatConfidence(
            prediction.confidence
        );


    const strength =
        getPredictionStrength(
            prediction.confidence
        );


    const date =
        formatDate(
            prediction.createdAt
        );


    const reportWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=700"
        );


    if (!reportWindow) {

        alert(
            "Please allow pop-ups in your browser to generate the report."
        );

        return;

    }


    reportWindow.document.open();


    reportWindow.document.write(`

        <!DOCTYPE html>

        <html lang="en">

        <head>

            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0">

            <title>
                HealthAI Prediction Report
            </title>


            <style>

                * {
                    box-sizing: border-box;
                }


                body {

                    margin: 0;

                    padding: 40px;

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;

                    color: #1f2937;

                    background: white;

                }


                .report {

                    max-width: 850px;

                    margin: auto;

                }


                .header {

                    text-align: center;

                    border-bottom:
                        2px solid #2563eb;

                    padding-bottom: 20px;

                    margin-bottom: 30px;

                }


                .header h1 {

                    margin: 0;

                    color: #2563eb;

                    font-size: 34px;

                }


                .header h2 {

                    margin:
                        8px 0;

                    font-size: 22px;

                }


                .header p {

                    color: #6b7280;

                    margin: 5px 0;

                }


                .result {

                    background: #eef5ff;

                    border-radius: 12px;

                    padding: 25px;

                    margin-bottom: 25px;

                    border-left:
                        5px solid #2563eb;

                }


                .result h3 {

                    margin-top: 0;

                    color: #2563eb;

                }


                .result h1 {

                    margin:
                        10px 0;

                    font-size: 30px;

                }


                .section {

                    margin-bottom: 22px;

                }


                .section h3 {

                    color: #2563eb;

                    margin-bottom: 8px;

                }


                .section p {

                    line-height: 1.6;

                }


                .warning {

                    background: #fff7ed;

                    border-left:
                        5px solid #f97316;

                    padding: 18px;

                    margin-top: 30px;

                    line-height: 1.6;

                }


                .warning strong {

                    color: #c2410c;

                }


                .footer {

                    margin-top: 40px;

                    padding-top: 20px;

                    border-top:
                        1px solid #ddd;

                    text-align: center;

                    font-size: 12px;

                    color: #6b7280;

                }


                @media print {

                    body {

                        padding: 20px;

                    }

                }

            </style>

        </head>


        <body>

            <div class="report">


                <div class="header">

                    <h1>
                        HealthAI
                    </h1>

                    <h2>
                        AI Prediction Report
                    </h2>

                    <p>
                        Prediction ID:
                        ${escapeHTML(prediction._id)}
                    </p>

                </div>


                <div class="result">

                    <h3>
                        Predicted Condition
                    </h3>

                    <h1>
                        ${escapeHTML(disease)}
                    </h1>

                    <p>

                        <strong>
                            Match Score:
                        </strong>

                        ${escapeHTML(score)}

                    </p>


                    <p>

                        <strong>
                            Result Strength:
                        </strong>

                        ${escapeHTML(strength)}

                    </p>

                </div>


                <div class="section">

                    <h3>
                        Report Date
                    </h3>

                    <p>
                        ${escapeHTML(date)}
                    </p>

                </div>


                <div class="section">

                    <h3>
                        Reported Symptoms
                    </h3>

                    <p>
                        ${escapeHTML(symptoms)}
                    </p>

                </div>


                <div class="warning">

                    <strong>
                        Medical Disclaimer
                    </strong>

                    <p>

                        This report is generated by an
                        AI-based symptom-pattern system
                        for informational purposes only.

                        It is not a medical diagnosis and
                        should not replace advice from a
                        qualified healthcare professional.

                    </p>

                </div>


                <div class="footer">

                    HealthAI |
                    AI Healthcare Assistant

                </div>


            </div>

        </body>

        </html>

    `);


    reportWindow.document.close();


    setTimeout(
        function () {

            reportWindow.focus();

            reportWindow.print();


            saveDownloadedReport(
                prediction._id
            );

        },
        500
    );

}


// ==========================================
// SAVE DOWNLOADED REPORT
// ==========================================

function saveDownloadedReport(id) {

    try {

        let downloaded =
            JSON.parse(
                localStorage.getItem(
                    "healthAI_downloaded_reports"
                ) || "[]"
            );


        if (!Array.isArray(downloaded)) {

            downloaded = [];

        }


        const stringId =
            String(id);


        if (
            !downloaded.some(
                function (item) {

                    return String(item) === stringId;

                }
            )
        ) {

            downloaded.push(
                stringId
            );


            localStorage.setItem(
                "healthAI_downloaded_reports",
                JSON.stringify(downloaded)
            );

        }


        updateStatistics();

    }

    catch (error) {

        console.error(
            "Unable to save report count:",
            error
        );

    }

}


// ==========================================
// GET DOWNLOADED REPORT COUNT
// ==========================================

function getDownloadedReportsCount() {

    try {

        const downloaded =
            JSON.parse(
                localStorage.getItem(
                    "healthAI_downloaded_reports"
                ) || "[]"
            );


        if (
            !Array.isArray(downloaded)
        ) {

            return 0;

        }


        return downloaded.length;

    }

    catch (error) {

        console.error(
            "Unable to read downloaded reports:",
            error
        );

        return 0;

    }

}


// ==========================================
// DELETE PREDICTION
// ==========================================

async function deletePrediction(id) {

    const prediction =
        predictionHistory.find(
            function (item) {

                return String(
                    item._id
                ) === String(id);

            }
        );


    if (!prediction) {

        alert(
            "Prediction record not found."
        );

        return;

    }


    const disease =
        formatDiseaseName(
            prediction.disease
        );


    const confirmed =
        window.confirm(
            `Are you sure you want to delete the prediction for "${disease}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const token =
            getAuthToken();


        if (!token) {

            throw new Error(
                "Please login again."
            );

        }


        const response =
            await fetch(
                `${BACKEND_API_URL}/api/history/${encodeURIComponent(id)}`,
                {

                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const responseText =
            await response.text();


        let data = {};


        try {

            data =
                JSON.parse(
                    responseText
                );

        }

        catch (_) {

            // Response may not be JSON

        }


        if (!response.ok) {

            throw new Error(

                data.message ||
                data.error ||
                `Delete failed with status ${response.status}`

            );

        }


        // Remove from frontend data

        predictionHistory =
            predictionHistory.filter(
                function (item) {

                    return String(
                        item._id
                    ) !== String(id);

                }
            );


        // Remove downloaded-report tracking

        removeDownloadedReport(id);


        updateStatistics();


        // Re-apply search

        if (
            searchInput &&
            searchInput.value.trim()
        ) {

            searchInput.dispatchEvent(
                new Event("input")
            );

        }

        else {

            displayHistory(
                predictionHistory
            );

        }


        alert(
            "Prediction deleted successfully."
        );

    }

    catch (error) {

        console.error(
            "Delete prediction error:",
            error
        );


        alert(
            "Unable to delete this prediction: " +
            error.message
        );

    }

}


// ==========================================
// REMOVE DOWNLOADED REPORT TRACKING
// ==========================================

function removeDownloadedReport(id) {

    try {

        let downloaded =
            JSON.parse(
                localStorage.getItem(
                    "healthAI_downloaded_reports"
                ) || "[]"
            );


        if (!Array.isArray(downloaded)) {

            downloaded = [];

        }


        downloaded =
            downloaded.filter(
                function (item) {

                    return String(item) !== String(id);

                }
            );


        localStorage.setItem(
            "healthAI_downloaded_reports",
            JSON.stringify(downloaded)
        );

    }

    catch (error) {

        console.error(
            "Unable to update downloaded reports:",
            error
        );

    }

}


// ==========================================
// LOADING STATE
// ==========================================

function showLoading() {

    if (!historyContainer) {

        return;

    }


    historyContainer.innerHTML = `

        <div class="noHistory">

            <i class="fa-solid fa-spinner fa-spin"></i>

            <h2>
                Loading prediction history...
            </h2>

            <p>
                Please wait while HealthAI
                retrieves your previous predictions.
            </p>

        </div>

    `;

}


// ==========================================
// EMPTY STATE
// ==========================================

function showEmptyHistory() {

    if (!historyContainer) {

        return;

    }


    historyContainer.innerHTML = `

        <div class="noHistory">

            <i class="fa-solid fa-clock-rotate-left"></i>

            <h2>
                No prediction history
            </h2>

            <p>
                Your previous AI disease predictions
                will appear here.
            </p>

        </div>

    `;

}


// ==========================================
// ERROR STATE
// ==========================================

function showError(message) {

    if (!historyContainer) {

        return;

    }


    const safeMessage =
        message ||
        "HealthAI could not connect to the prediction history server.";


    historyContainer.innerHTML = `

        <div class="noHistory">

            <i class="fa-solid fa-triangle-exclamation"></i>

            <h2>
                Unable to load history
            </h2>

            <p>
                ${escapeHTML(safeMessage)}
            </p>

            <button
                type="button"
                class="dashboard-btn"
                onclick="loadPredictionHistory()">

                <i class="fa-solid fa-rotate"></i>

                Try Again

            </button>

        </div>

    `;

}


// ==========================================
// FORMAT DISEASE NAME
// ==========================================

function formatDiseaseName(value) {

    if (!value) {

        return "Unknown condition";

    }


    return String(value)

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
            /\b\w/g,
            function (char) {

                return char.toUpperCase();

            }
        );

}


// ==========================================
// FORMAT SYMPTOMS
// ==========================================

function formatSymptoms(value) {

    if (!value) {

        return "No symptoms recorded";

    }


    if (Array.isArray(value)) {

        if (value.length === 0) {

            return "No symptoms recorded";

        }


        return value
            .map(
                function (item) {

                    return String(item)
                        .replace(
                            /_/g,
                            " "
                        )
                        .trim();

                }
            )
            .join(", ");

    }


    return String(value)

        .replace(
            /_/g,
            " "
        )

        .replace(
            /\s*,\s*/g,
            ", "
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


// ==========================================
// FORMAT CONFIDENCE
// ==========================================

function formatConfidence(confidence) {

    const numericConfidence =
        Number(confidence);


    if (
        Number.isNaN(numericConfidence)
    ) {

        return "Not available";

    }


    // Express history stores confidence
    // as a percentage.

    let percentage =
        numericConfidence;


    // Safety support if a decimal
    // somehow gets stored.

    if (
        percentage > 0 &&
        percentage <= 1
    ) {

        percentage =
            percentage * 100;

    }


    percentage =
        Math.min(
            Math.max(
                percentage,
                0
            ),
            100
        );


    return `${percentage.toFixed(2)}%`;

}


// ==========================================
// PREDICTION STRENGTH
// ==========================================

function getPredictionStrength(confidence) {

    const numericConfidence =
        Number(confidence);


    if (
        Number.isNaN(numericConfidence)
    ) {

        return "Prediction result";

    }


    let percentage =
        numericConfidence;


    if (
        percentage > 0 &&
        percentage <= 1
    ) {

        percentage =
            percentage * 100;

    }


    if (
        percentage >= 65
    ) {

        return "Strong symptom-pattern match";

    }


    if (
        percentage >= 45
    ) {

        return "Moderate symptom-pattern match";

    }


    if (
        percentage >= 25
    ) {

        return "Possible symptom-pattern match";

    }


    return "Weak symptom-pattern match";

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(value) {

    if (!value) {

        return "Date unavailable";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return date.toLocaleString(
        "en-IN",
        {

            day: "2-digit",

            month: "short",

            year: "numeric",

            hour: "2-digit",

            minute: "2-digit"

        }
    );

}


// ==========================================
// HTML SECURITY
// ==========================================

function escapeHTML(value) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// GLOBAL FUNCTIONS
// ==========================================

window.refreshPredictionHistory =
    loadPredictionHistory;


window.loadPredictionHistory =
    loadPredictionHistory;


window.downloadReport =
    downloadReport;


window.deletePrediction =
    deletePrediction;
    // ============================================================
// SAVE PREDICTION HISTORY
// ============================================================

async function savePredictionHistory(
    disease,
    confidence,
    symptoms
) {

    try {

        const user =
            JSON.parse(
                localStorage.getItem("user")
            );

        const token =
            localStorage.getItem("token");


        if (!user || !token) {

            console.log(
                "No logged-in user or authentication token. History skipped."
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


        const responseText =
            await response.text();


        console.log(
            "History HTTP status:",
            response.status
        );


        console.log(
            "History response:",
            responseText
        );


        if (!response.ok) {

            let errorMessage =
                `History save failed with status ${response.status}`;


            try {

                const errorData =
                    JSON.parse(
                        responseText
                    );


                errorMessage =
                    errorData.message ||
                    errorData.error ||
                    errorMessage;

            }

            catch (_) {

                // Response was not JSON

            }


            throw new Error(
                errorMessage
            );

        }


        console.log(
            "Prediction history saved successfully."
        );

    }

    catch (error) {

        // History failure must NOT break prediction

        console.warn(
            "History save failed. Prediction is still valid.",
            error
        );

    }

}