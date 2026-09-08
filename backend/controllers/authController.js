const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ======================
// Register User
// ======================
const register = async (req, res) => {
    try {
        const { name, email, password, age, gender } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        // Check whether user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            age,
            gender
        });

        // Save user to MongoDB
        await user.save();

        return res.status(201).json({
            message: "Registration Successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                gender: user.gender
            }
        });

    } catch (error) {
        console.error("❌ Registration Error:", error);

        return res.status(500).json({
            message: "Server Error"
        });
    }
};

// ======================
// Login User
// ======================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid Password"
            });
        }

        // Check JWT secret
        if (!process.env.JWT_SECRET) {
            console.error("❌ JWT_SECRET is missing in .env");

            return res.status(500).json({
                message: "JWT configuration error"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            message: "Login Successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                gender: user.gender
            }
        });

    } catch (error) {
        console.error("❌ Login Error:", error);

        return res.status(500).json({
            message: "Server Error"
        });
    }
};

// ======================
// Export
// ======================
module.exports = {
    register,
    login
};