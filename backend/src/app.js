const express = require("express");
const cors = require("cors");

const verifyToken = require("./middleware/auth.middleware");
const authorizeRoles = require("./middleware/role.middleware");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const storeRoutes = require("./routes/store.routes");

console.log("AUTH ROUTES LOADED");
console.log("APP FILE LOADED:", __filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log("INCOMING REQUEST:", req.method, req.url);
    next();
});

// Root Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Roxiler FSDI API is running 🚀"
    });
});

// Test Route
app.get("/api/test", (req, res) => {
    res.send("TEST ROUTE WORKING");
});

// JWT Protected Route
app.get("/api/protected", verifyToken, (req, res) => {
    res.json({
        success: true,
        message: "Protected route reached",
        user: req.user
    });
});

// Admin Only Route
app.get(
    "/api/admin-test",
    verifyToken,
    authorizeRoles("ADMIN"),
    (req, res) => {
        res.json({
            success: true,
            message: "Admin access granted"
        });
    }
);

// Authentication Routes
app.use("/api/auth", (req, res, next) => {
    console.log("AUTH ROUTER HIT:", req.method, req.originalUrl);
    next();
}, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
const ratingRoutes = require("./routes/rating.routes");
app.use("/api/ratings", ratingRoutes);

console.log("APP EXPORTING SUCCESSFULLY");

module.exports = app;