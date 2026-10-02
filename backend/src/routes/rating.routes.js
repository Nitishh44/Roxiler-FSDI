const express = require("express");
const router = express.Router();

const { submitRating } = require("../controllers/rating.controller");
const verifyToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post(
    "/",
    verifyToken,
    authorizeRoles("USER"),
    submitRating
);

module.exports = router;