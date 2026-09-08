const express = require("express");
const router = express.Router();

const { chatbot } = require("../controllers/chatbotController");

// HealthAI Chatbot API
// POST http://localhost:5000/api/chatbot/chat
router.post("/chat", chatbot);

module.exports = router;