const { spawn } = require("child_process");
const path = require("path");

function runPrediction(symptoms) {

    return new Promise((resolve, reject) => {

        const pythonFile = path.join(__dirname, "../../ml_model/predict.py");

        const python = spawn("python", [
            pythonFile,
            JSON.stringify(symptoms)
        ]);

        let result = "";
        let error = "";

        python.stdout.on("data", (data) => {

            result += data.toString();

        });

        python.stderr.on("data", (data) => {

            error += data.toString();

        });

        python.on("close", (code) => {

            if (code === 0) {

                // Python returns plain text
                resolve(result.trim());

            } else {

                reject(error);

            }

        });

    });

}

module.exports = runPrediction;