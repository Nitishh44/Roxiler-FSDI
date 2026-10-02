const express = require("express");

const {
    createStore,
    getAllStores,
    getOwnerDashboard,
    getUserStores
} = require("../controllers/store.controller");

const verifyToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const router = express.Router();

// Admin: Create Store
router.post(
    "/",
    verifyToken,
    authorizeRoles("ADMIN"),
    createStore
);

// Admin: Get All Stores
router.get(
    "/",
    verifyToken,
    authorizeRoles("ADMIN"),
    getAllStores
);

// Store Owner: Dashboard
router.get(
    "/owner/dashboard",
    verifyToken,
    authorizeRoles("STORE_OWNER"),
    getOwnerDashboard
);

router.get(
    "/user",
    verifyToken,
    authorizeRoles("USER"),
    getUserStores
);

module.exports = router;