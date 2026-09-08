const express = require("express");

const router = express.Router();

const {
    savePrediction,
    getHistory,
    deleteHistory
} = require("../controllers/historyController");

const authMiddleware = require("../middleware/authMiddleware");

// Save prediction
router.post("/", authMiddleware, savePrediction);

// Get logged-in user's history
router.get("/", authMiddleware, getHistory);

// Delete prediction
router.delete("/:id", authMiddleware, deleteHistory);

module.exports = router;