const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });

        console.log("✅ MongoDB Connected Successfully");
        console.log("📦 Database:", conn.connection.name);
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
    }
};

module.exports = connectDB;