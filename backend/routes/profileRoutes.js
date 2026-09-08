const express = require("express");

const router = express.Router();

const {

    getProfile,
    updateProfile

} = require("../controllers/profileController");

router.get("/:id", getProfile);

router.put("/:id", updateProfile);

module.exports = router;