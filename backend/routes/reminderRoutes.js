const express = require("express");
const router = express.Router();

const {
    getReminders,
    addReminder,
    deleteReminder
} = require("../controllers/reminderController");

// ==============================
// Get All Reminders
// GET /api/reminder/:userId
// ==============================
router.get("/:userId", getReminders);

// ==============================
// Add Reminder
// POST /api/reminder
// ==============================
router.post("/", addReminder);

// ==============================
// Delete Reminder
// DELETE /api/reminder/:id
// ==============================
router.delete("/:id", deleteReminder);

module.exports = router;