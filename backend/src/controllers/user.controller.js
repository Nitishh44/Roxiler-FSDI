const pool = require("../config/db");

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

module.exports = { getAllUsers, getDashboardStats };