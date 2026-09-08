const mongoose = require("mongoose");

const predictionHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        disease: {
            type: String,
            required: true
        },

        confidence: {
            type: Number,
            required: true
        },

        symptoms: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "PredictionHistory",
    predictionHistorySchema
);