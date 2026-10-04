const express = require("express");
const {
    getAllUsers,
    getUserDetails,
    getDashboardStats,
    createUser
} = require("../controllers/user.controller");

const verifyToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const router = express.Router();

// Admin: Get all users
router.get(
    "/",
    verifyToken,
    authorizeRoles("ADMIN"),
    getAllUsers
);

// Admin: Get dashboard statistics
router.get(
    "/dashboard/stats",
    verifyToken,
    authorizeRoles("ADMIN"),
    getDashboardStats
);

router.get(
    "/:id",
    verifyToken,
    authorizeRoles("ADMIN"),
    getUserDetails
);

// Admin: Create a new user
router.post(
    "/",
    verifyToken,
    authorizeRoles("ADMIN"),
    createUser
);

module.exports = router;