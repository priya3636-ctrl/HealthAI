const Reminder = require("../models/Reminder");

// ======================================
// Get All Reminders
// ======================================

const getReminders = async (req, res) => {

    try {

        const reminders = await Reminder.find({

            userId: req.params.userId

        }).sort({ createdAt: -1 });

        res.json(reminders);

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            message: "Unable to fetch reminders"

        });

    }

};

// ======================================
// Add Reminder
// ======================================

const addReminder = async (req, res) => {

    try {

        const {

            userId,
            medicine,
            time,
            startDate,
            endDate

        } = req.body;

        const reminder = new Reminder({

            userId,
            medicine,
            time,
            startDate,
            endDate

        });

        await reminder.save();

        res.status(201).json(reminder);

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            message: "Unable to save reminder"

        });

    }

};

// ======================================
// Delete Reminder
// ======================================

const deleteReminder = async (req, res) => {

    try {

        await Reminder.findByIdAndDelete(req.params.id);

        res.json({

            message: "Reminder Deleted"

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            message: "Unable to delete reminder"

        });

    }

};

module.exports = {

    getReminders,
    addReminder,
    deleteReminder

};