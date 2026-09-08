const express = require("express");
const router = express.Router();

const {
    predictDisease
} = require("../controllers/predictionController");

// POST /api/predict
router.post("/predict", predictDisease);

module.exports = router;