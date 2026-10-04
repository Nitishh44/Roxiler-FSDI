const pool = require("../config/db");
const bcrypt = require("bcryptjs");

// Get all users (Admin)
const getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT id, name, email, address, role, created_at
             FROM users
             ORDER BY id DESC`
        );

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error("GET USERS ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
};

const getUserDetails = async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT id, name, email, address, role, created_at
             FROM users
             WHERE id = ?`,
            [req.params.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = users[0];
        let stores = [];

        if (user.role === "STORE_OWNER") {
            [stores] = await pool.query(
                `SELECT
                    s.id,
                    s.name,
                    COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating,
                    COUNT(r.id) AS total_ratings
                 FROM stores s
                 LEFT JOIN ratings r ON r.store_id = s.id
                 WHERE s.owner_id = ?
                 GROUP BY s.id, s.name
                 ORDER BY s.name ASC`,
                [user.id]
            );
        }

        res.status(200).json({
            success: true,
            user,
            stores
        });
    } catch (error) {
        console.error("GET USER DETAILS ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch user details"
        });
    }
};

// Create User (Admin)
const createUser = async (req, res) => {
    try {
        const { name, email, address, password, role } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof address !== "string" ||
            typeof password !== "string" ||
            typeof role !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (name.trim().length < 20 || name.trim().length > 60) {
            return res.status(400).json({
                success: false,
                message: "Name must be between 20 and 60 characters"
            });
        }

        if (address.trim().length > 400) {
            return res.status(400).json({
                success: false,
                message: "Address must not exceed 400 characters"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be 8-16 characters with at least one uppercase letter and one special character"
            });
        }

        const allowedRoles = ["ADMIN", "USER", "STORE_OWNER"];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        const [existingUser] = await pool.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            `INSERT INTO users (name, email, address, password, role)
             VALUES (?, ?, ?, ?, ?)`,
            [name.trim(), email.trim().toLowerCase(), address.trim(), hashedPassword, role]
        );

        res.status(201).json({
            success: true,
            message: "User created successfully",
            userId: result.insertId
        });

    } catch (error) {
        console.error("CREATE USER ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create user"
        });
    }
};

// Admin Dashboard Statistics
const getDashboardStats = async (req, res) => {
    try {
        const [userStats] = await pool.query(
            `SELECT
                COUNT(*) AS totalUsers,
                SUM(role = 'USER') AS totalNormalUsers,
                SUM(role = 'STORE_OWNER') AS totalStoreOwners,
                SUM(role = 'ADMIN') AS totalAdmins
             FROM users`
        );

        const [storeStats] = await pool.query(
            "SELECT COUNT(*) AS totalStores FROM stores"
        );

        const [ratingStats] = await pool.query(
            "SELECT COUNT(*) AS totalRatings FROM ratings"
        );

        res.status(200).json({
            success: true,
            stats: {
                ...userStats[0],
                ...storeStats[0],
                ...ratingStats[0]
            }
        });

    } catch (error) {
        console.error("DASHBOARD STATS ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics"
        });
    }
};

module.exports = {
    getAllUsers,
    getUserDetails,
    createUser,
    getDashboardStats
};