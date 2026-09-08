const express = require("express");
const router = express.Router();

const { generateReport } = require("../controllers/reportController");

// POST /api/report
router.post("/", generateReport);

module.exports = router;