
const pool = require("../config/db");

// Create Store (Admin)
const createStore = async (req, res) => {
    try {
        const { name, email, address, owner_id } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof address !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !address.trim() ||
            owner_id === undefined ||
            owner_id === null ||
            owner_id === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanAddress = address.trim();
        const ownerId = Number(owner_id);

        if (!Number.isSafeInteger(ownerId) || ownerId < 1) {
            return res.status(400).json({
                success: false,
                message: "A valid store owner is required"
            });
        }

        if (cleanName.length < 20 || cleanName.length > 60) {
            return res.status(400).json({
                success: false,
                message: "Store name must be 20-60 characters"
            });
        }

        if (cleanAddress.length > 400) {
            return res.status(400).json({
                success: false,
                message: "Address cannot exceed 400 characters"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });
        }

        const [existingStore] = await pool.query(
            "SELECT id FROM stores WHERE email = ?",
            [cleanEmail]
        );

        if (existingStore.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Store email already registered"
            });
        }

        const [owners] = await pool.query(
            "SELECT id, role FROM users WHERE id = ?",
            [ownerId]
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
            [cleanName, cleanEmail, cleanAddress, ownerId]
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
                COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating,
                COUNT(r.id) AS total_ratings,
                s.created_at
             FROM stores s
             JOIN users u ON s.owner_id = u.id
             LEFT JOIN ratings r ON s.id = r.store_id
             GROUP BY
                s.id, s.name, s.email, s.address,
                s.owner_id, u.name, u.email, s.created_at
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
            `SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                COALESCE(ROUND(AVG(r.rating), 2), 0) AS averageRating,
                COUNT(r.id) AS totalRatings
             FROM stores s
             LEFT JOIN ratings r ON s.id = r.store_id
             WHERE s.owner_id = ?
             GROUP BY s.id, s.name, s.email, s.address
             ORDER BY s.id DESC`,
            [ownerId]
        );

        const [raters] = await pool.query(
            `SELECT
                s.id AS storeId,
                s.name AS storeName,
                u.name,
                u.email,
                r.rating,
                r.created_at
             FROM ratings r
             JOIN users u ON r.user_id = u.id
             JOIN stores s ON r.store_id = s.id
             WHERE s.owner_id = ?
             ORDER BY r.created_at DESC`,
            [ownerId]
        );

        res.status(200).json({
            success: true,
            stores,
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
