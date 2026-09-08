const User = require("../models/User");

// Get Profile
const getProfile = async (req, res) => {

    try {

        const { id } = req.params;

        const user = await User.findById(id).select("-password");

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        res.json(user);

    }

    catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

// Update Profile
const updateProfile = async (req, res) => {

    try {

        const { id } = req.params;

        const { name, age, gender } = req.body;

        const user = await User.findByIdAndUpdate(

            id,

            {
                name,
                age,
                gender
            },

            {
                new: true
            }

        ).select("-password");

        res.json({

            message: "Profile Updated Successfully",

            user

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

module.exports = {

    getProfile,
    updateProfile

};