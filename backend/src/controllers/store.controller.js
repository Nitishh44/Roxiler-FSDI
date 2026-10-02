const pool = require("../config/db");

// Create Store (Admin)
const createStore = async (req, res) => {
    try {
        const { name, email, address, owner_id } = req.body;

        if (!name || !email || !address || !owner_id) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (name.length < 20 || name.length > 60) {
            return res.status(400).json({
                success: false,
                message: "Store name must be 20-60 characters"
            });
        }

        if (address.length > 400) {
            return res.status(400).json({
                success: false,
                message: "Address cannot exceed 400 characters"
            });
        }

        const [owners] = await pool.query(
            "SELECT id, role FROM users WHERE id = ?",
            [owner_id]
        );

        if (owners.length === 0 || owners[0].role !== "STORE_OWNER") {
            return res.status(400).json({
                success: false,
                message: "Valid store owner not found"
            });
        }

        const [result] = await pool.query(
            `INSERT INTO stores (name, email, address, owner_id)
             VALUES (?, ?, ?, ?)`,
            [name, email, address, owner_id]
        );

        res.status(201).json({
            success: true,
            message: "Store created successfully",
            storeId: result.insertId
        });

    } catch (error) {
        console.error("CREATE STORE ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create store"
        });
    }
};

// Get All Stores (Admin)
const getAllStores = async (req, res) => {
    try {
        const [stores] = await pool.query(
            `SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                s.owner_id,
                u.name AS owner_name,
                u.email AS owner_email,
                s.created_at
             FROM stores s
             JOIN users u ON s.owner_id = u.id
             ORDER BY s.id DESC`
        );

        res.status(200).json({
            success: true,
            count: stores.length,
            stores
        });

    } catch (error) {
        console.error("GET STORES ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch stores"
        });
    }
};

// Get Stores for Normal User
const getUserStores = async (req, res) => {
    try {
        const userId = req.user.id;

        const [stores] = await pool.query(
            `SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                COALESCE(ROUND(AVG(r.rating), 2), 0) AS averageRating,
                COUNT(r.id) AS totalRatings,
                MAX(CASE
                    WHEN r.user_id = ? THEN r.rating
                    ELSE NULL
                END) AS myRating
             FROM stores s
             LEFT JOIN ratings r ON s.id = r.store_id
             GROUP BY s.id, s.name, s.email, s.address
             ORDER BY s.id DESC`,
            [userId]
        );

        res.status(200).json({
            success: true,
            count: stores.length,
            stores
        });

    } catch (error) {
        console.error("GET USER STORES ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch stores"
        });
    }
};


// Store Owner Dashboard
const getOwnerDashboard = async (req, res) => {
    try {
        const ownerId = req.user.id;

        const [stores] = await pool.query(
            `SELECT id, name
             FROM stores
             WHERE owner_id = ?`,
            [ownerId]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No store found for this owner"
            });
        }

        const storeId = stores[0].id;

        const [stats] = await pool.query(
            `SELECT
                COUNT(*) AS totalRatings,
                COALESCE(ROUND(AVG(rating), 2), 0) AS averageRating
             FROM ratings
             WHERE store_id = ?`,
            [storeId]
        );

        const [raters] = await pool.query(
            `SELECT
                u.name,
                u.email,
                r.rating,
                r.created_at
             FROM ratings r
             JOIN users u ON r.user_id = u.id
             WHERE r.store_id = ?
             ORDER BY r.created_at DESC`,
            [storeId]
        );

        res.status(200).json({
            success: true,
            store: stores[0],
            totalRatings: stats[0].totalRatings,
            averageRating: stats[0].averageRating,
            raters
        });

    } catch (error) {
        console.error("OWNER DASHBOARD ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch owner dashboard"
        });
    }
};

module.exports = {
    createStore,
    getAllStores,
    getOwnerDashboard,
    getUserStores
};