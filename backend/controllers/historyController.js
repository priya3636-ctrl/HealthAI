const PredictionHistory = require("../models/PredictionHistory");

// ==============================
// Save Prediction
// ==============================

const savePrediction = async (req, res) => {
    try {

        const { disease, confidence, symptoms } = req.body;

        if (!disease || confidence === undefined) {
            return res.status(400).json({
                message: "disease and confidence are required"
            });
        }

        const prediction = new PredictionHistory({
            userId: req.user.id,
            disease,
            confidence,
            symptoms: symptoms || []
        });

        await prediction.save();

        res.status(201).json({
            message: "Prediction Saved Successfully",
            prediction
        });

    } catch (error) {

        console.error("Save Prediction Error:", error);

        res.status(500).json({
            message: "Unable to save prediction",
            error: error.message
        });
    }
};


// ==============================
// Get Logged-in User History
// ==============================

const getHistory = async (req, res) => {
    try {

        const userId = req.user.id;

        console.log("History User ID:", userId);

        const history = await PredictionHistory
            .find({ userId })
            .sort({ createdAt: -1 });

        console.log("History Found:", history.length);

        res.status(200).json({
            message: "History fetched successfully",
            history
        });

    } catch (error) {

        console.error("Get History Error:", error);

        res.status(500).json({
            message: "Unable to fetch history",
            error: error.message
        });
    }
};


// ==============================
// Delete One Prediction
// ==============================

const deleteHistory = async (req, res) => {
    try {

        const prediction = await PredictionHistory.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!prediction) {
            return res.status(404).json({
                message: "Prediction not found"
            });
        }

        await PredictionHistory.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Deleted Successfully"
        });

    } catch (error) {

        console.error("Delete History Error:", error);

        res.status(500).json({
            message: "Delete Failed",
            error: error.message
        });
    }
};


// ==============================
// Export Controllers
// ==============================

module.exports = {
    savePrediction,
    getHistory,
    deleteHistory
};