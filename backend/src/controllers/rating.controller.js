
const pool = require("../config/db");

const submitRating = async (req, res) => {
    try {
        const { store_id, rating } = req.body;
        const userId = req.user.id;

        const storeId = Number(store_id);
        const ratingValue = Number(rating);

        if (
            !Number.isSafeInteger(storeId) ||
            storeId < 1 ||
            rating === undefined ||
            rating === null ||
            rating === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Store ID and rating are required"
            });
        }

        if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        const [stores] = await pool.execute(
            "SELECT id FROM stores WHERE id = ?",
            [storeId]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        await pool.execute(
            `INSERT INTO ratings (user_id, store_id, rating)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE
                rating = VALUES(rating),
                updated_at = CURRENT_TIMESTAMP`,
            [userId, storeId, ratingValue]
        );

        res.status(200).json({
            success: true,
            message: "Rating saved successfully"
        });

    } catch (error) {
        console.error("Submit rating error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = { submitRating };
