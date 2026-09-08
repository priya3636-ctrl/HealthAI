// ============================================================
// HealthAI - Dashboard Controller
// ============================================================

const PredictionHistory = require("../models/PredictionHistory");


// ============================================================
// GET DASHBOARD
// ============================================================

const getDashboard = async (req, res) => {

    try {

        const { userId } = req.params;


        // ----------------------------------------------------
        // Get prediction history for this user
        // ----------------------------------------------------

        const predictions =
            await PredictionHistory
                .find({ userId })
                .sort({ createdAt: -1 });


        // ----------------------------------------------------
        // Total predictions
        // ----------------------------------------------------

        const totalPredictions =
            predictions.length;


        let lastPrediction =
            "-";


        let topDisease =
            "-";


        // ----------------------------------------------------
        // Calculate dashboard statistics
        // ----------------------------------------------------

        if (totalPredictions > 0) {

            // Latest prediction

            lastPrediction =
                predictions[0].disease;


            // Count diseases

            const diseaseCount = {};


            predictions.forEach(
                function (item) {

                    const disease =
                        item.disease ||
                        "Unknown";


                    diseaseCount[disease] =
                        (
                            diseaseCount[disease] ||
                            0
                        ) + 1;

                }
            );


            // Find most predicted disease

            topDisease =
                Object.keys(
                    diseaseCount
                ).reduce(
                    function (a, b) {

                        return diseaseCount[a] >
                            diseaseCount[b]
                            ? a
                            : b;

                    }
                );

        }


        // ----------------------------------------------------
        // Response
        // ----------------------------------------------------

        res.status(200).json({

            totalPredictions:
                totalPredictions,

            lastPrediction:
                lastPrediction,

            topDisease:
                topDisease,

            recentPredictions:
                predictions.slice(0, 5)

        });


    }

    catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );


        res.status(500).json({

            message:
                "Dashboard Error"

        });

    }

};


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    getDashboard

};