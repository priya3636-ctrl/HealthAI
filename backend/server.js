const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/database");

const predictionRoutes = require("./routes/predictionRoutes");
const authRoutes = require("./routes/authRoutes");
const historyRoutes = require("./routes/historyRoutes");
const profileRoutes = require("./routes/profileRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const reportRoutes = require("./routes/reportRoutes");
const reminderRoutes = require("./routes/reminderRoutes");

const app = express();

connectDB();

app.use(cors());

app.use(
    express.json({
        verify: (req, res, buf) => {
            if (
                req.originalUrl === "/api/report" &&
                req.method === "POST"
            ) {
                console.log("[report] raw body:", buf.toString());
            }
        }
    })
);

app.get("/", (req, res) => {
    res.send("🚀 HealthAI Backend Server is Running...");
});

app.use("/api", predictionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/reminder", reminderRoutes);

const PORT = process.env.PORT || 5000;

// Run normally when using: npm start
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

// Required for Vercel
module.exports = app;