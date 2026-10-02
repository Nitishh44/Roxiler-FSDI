
const pool = require("../config/db");

const submitRating = async (req, res) => {
    try {
        const { store_id, rating } = req.body;
        const userId = req.user.id;

        if (!store_id || !rating) {
            return res.status(400).json({
                success: false,
                message: "Store ID and rating are required"
            });
        }

        if (!Number.isInteger(Number(rating)) || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        const [stores] = await pool.execute(
            "SELECT id FROM stores WHERE id = ?",
            [store_id]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        const [existingRating] = await pool.execute(
            "SELECT id FROM ratings WHERE user_id = ? AND store_id = ?",
            [userId, store_id]
        );

        if (existingRating.length > 0) {
            await pool.execute(
                "UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND store_id = ?",
                [rating, userId, store_id]
            );

            return res.json({
                success: true,
                message: "Rating updated successfully"
            });
        }

        await pool.execute(
            "INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)",
            [userId, store_id, rating]
        );

        res.status(201).json({
            success: true,
            message: "Rating submitted successfully"
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

