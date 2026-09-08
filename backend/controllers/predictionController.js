const runPrediction = require("../utils/pythonRunner");
const Prediction = require("../models/Prediction");

const predictDisease = async (req, res) => {

    try {

        const { symptoms, userId } = req.body;

        if (!symptoms || symptoms.length === 0) {

            return res.status(400).json({
                error: "Symptoms are required"
            });

        }

        // Python returns JSON string
        const predictionString = await runPrediction(symptoms);

        // Convert string to JavaScript array
        const prediction = JSON.parse(predictionString);

        // Save only the top disease
        if (userId) {

            await Prediction.create({

                userId,
                symptoms,
                disease: prediction[0].disease

            });

        }

        res.json({

            prediction

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            error: "Prediction Failed"

        });

    }

};

module.exports = {

    predictDisease

};