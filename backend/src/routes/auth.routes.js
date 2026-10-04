
const express = require("express");

const {
    signup,
    login,
    changePassword
} = require("../controllers/auth.controller");

const verifyToken = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.put("/change-password", verifyToken, changePassword);

module.exports = router;

