const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    medicine: {
        type: String,
        required: true
    },

    time: {
        type: String,
        required: true
    },

    startDate: {
        type: String,
        required: true
    },

    endDate: {
        type: String,
        required: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Reminder", reminderSchema);