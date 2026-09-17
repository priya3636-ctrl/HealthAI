// ============================================================
// HealthAI - Dashboard
// dashboard.js
// ============================================================


// ============================================================
// CHECK LOGIN
// ============================================================

const userData = localStorage.getItem("user");
const token = localStorage.getItem("token");

if (!userData || !token) {

    alert("Please Login First");

    window.location.href = "login.html";

}

const user = JSON.parse(userData);


// ============================================================
// SHOW USERNAME
// ============================================================

const usernameElement =
    document.getElementById("username");

if (usernameElement) {

    usernameElement.innerText =
        user.name || "HealthAI User";

}


// ============================================================
// API CONFIGURATION
// ============================================================

const DASHBOARD_API_URL =
    "https://healthai-backend-ashy.vercel.app/api/dashboard";


// ============================================================
// CHART REFERENCES
// ============================================================

let barChart = null;
let pieChart = null;


// ============================================================
// LOAD DASHBOARD DATA
// ============================================================

async function loadDashboard() {

    try {

        console.log(
            "Loading dashboard data..."
        );

        console.log(
            "Dashboard API:",
            `${DASHBOARD_API_URL}/${user.id}`
        );


        // ----------------------------------------------------
        // GET DASHBOARD DATA
        // ----------------------------------------------------

        const response =
            await fetch(
                `${DASHBOARD_API_URL}/${user.id}`,
                {
                    method: "GET",

                    cache: "no-store",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Cache-Control":
                            "no-cache"

                    }

                }
            );


        console.log(
            "Dashboard HTTP status:",
            response.status
        );


        const responseText =
            await response.text();


        console.log(
            "Dashboard raw response:",
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
                "Dashboard returned invalid JSON."
            );

        }


        // ----------------------------------------------------
        // CHECK HTTP STATUS
        // ----------------------------------------------------

        if (!response.ok) {

            throw new Error(

                data.message ||
                `Dashboard request failed with HTTP ${response.status}`

            );

        }


        console.log(
            "Dashboard data:",
            data
        );


        // ====================================================
        // STATISTICS
        // ====================================================

        const totalPredictionsElement =
            document.getElementById(
                "totalPredictions"
            );


        const topDiseaseElement =
            document.getElementById(
                "topDisease"
            );


        const lastPredictionElement =
            document.getElementById(
                "lastPrediction"
            );


        if (totalPredictionsElement) {

            totalPredictionsElement.innerText =
                data.totalPredictions ?? 0;

        }


        if (topDiseaseElement) {

            topDiseaseElement.innerText =
                data.topDisease ||
                "No predictions yet";

        }


        if (lastPredictionElement) {

            lastPredictionElement.innerText =
                data.lastPrediction ||
                "No predictions yet";

        }


        // ====================================================
        // RECENT PREDICTIONS
        // ====================================================

        const table =
            document.getElementById(
                "recentPredictions"
            );


        const recentPredictions =
            Array.isArray(
                data.recentPredictions
            )
                ? data.recentPredictions
                : [];


        if (table) {

            table.innerHTML = "";


            if (
                recentPredictions.length === 0
            ) {

                table.innerHTML = `

                    <tr>

                        <td colspan="2">
                            No predictions available.
                        </td>

                    </tr>

                `;

            }

            else {

                recentPredictions.forEach(
                    function (item) {

                        const date =
                            item.createdAt
                                ? new Date(
                                    item.createdAt
                                ).toLocaleString()
                                : "Unknown date";


                        const disease =
                            item.disease ||
                            "Unknown disease";


                        table.innerHTML += `

                            <tr>

                                <td>
                                    ${escapeHtml(date)}
                                </td>

                                <td>
                                    ${escapeHtml(disease)}
                                </td>

                            </tr>

                        `;

                    }
                );

            }

        }


        // ====================================================
        // DISEASE STATISTICS
        // ====================================================

        const diseaseCount = {};


        recentPredictions.forEach(
            function (item) {

                const disease =
                    item.disease ||
                    "Unknown";


                if (
                    !diseaseCount[disease]
                ) {

                    diseaseCount[disease] =
                        0;

                }


                diseaseCount[disease]++;

            }
        );


        const labels =
            Object.keys(
                diseaseCount
            );


        const values =
            Object.values(
                diseaseCount
            );


        // ====================================================
        // BAR CHART
        // ====================================================

        const barCanvas =
            document.getElementById(
                "barChart"
            );


        if (
            barCanvas &&
            typeof Chart !== "undefined"
        ) {

            if (barChart) {

                barChart.destroy();

            }


            barChart =
                new Chart(
                    barCanvas,
                    {

                        type: "bar",

                        data: {

                            labels: labels,

                            datasets: [

                                {

                                    label:
                                        "Predictions",

                                    data:
                                        values,

                                    backgroundColor:
                                        "#2563eb"

                                }

                            ]

                        },

                        options: {

                            responsive:
                                true,

                            plugins: {

                                legend: {

                                    display:
                                        false

                                }

                            }

                        }

                    }
                );

        }


        // ====================================================
        // PIE CHART
        // ====================================================

        const pieCanvas =
            document.getElementById(
                "pieChart"
            );


        if (
            pieCanvas &&
            typeof Chart !== "undefined"
        ) {

            if (pieChart) {

                pieChart.destroy();

            }


            pieChart =
                new Chart(
                    pieCanvas,
                    {

                        type: "pie",

                        data: {

                            labels:
                                labels,

                            datasets: [

                                {

                                    data:
                                        values,

                                    backgroundColor: [

                                        "#2563eb",
                                        "#16a34a",
                                        "#f59e0b",
                                        "#ef4444",
                                        "#8b5cf6",
                                        "#06b6d4"

                                    ]

                                }

                            ]

                        },

                        options: {

                            responsive:
                                true

                        }

                    }
                );

        }


        console.log(
            "Dashboard loaded successfully."
        );

    }

    catch (error) {

        console.error(
            "DASHBOARD ERROR:",
            error
        );


        alert(
            "Unable to Load Dashboard: " +
            error.message
        );

    }

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


// ============================================================
// LOAD DASHBOARD
// ============================================================

loadDashboard();