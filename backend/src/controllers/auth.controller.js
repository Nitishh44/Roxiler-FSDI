const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
    try {
        const { name, email, address, password } = req.body;

        if (!name || !email || !address || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof address !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, email, address, and password must be text"
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanAddress = address.trim();

        if (cleanName.length < 20 || cleanName.length > 60) {
            return res.status(400).json({
                success: false,
                message: "Name must be between 20 and 60 characters"
            });
        }

        if (cleanAddress.length > 400) {
            return res.status(400).json({
                success: false,
                message: "Address must not exceed 400 characters"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanEmail)) {
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

        const [existingUser] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [cleanEmail]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.execute(
            `INSERT INTO users (name, email, password, address, role)
             VALUES (?, ?, ?, ?, 'USER')`,
            [cleanName, cleanEmail, hashedPassword, cleanAddress]
        );

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            userId: result.insertId
        });

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const [users] = await pool.execute(
            "SELECT id, name, email, password, role FROM users WHERE email = ?",
            [cleanEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (
            typeof currentPassword !== "string" ||
            typeof newPassword !== "string" ||
            !currentPassword ||
            !newPassword
        ) {
            return res.status(400).json({
                success: false,
                message: "Current and new password are required"
            });
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: "New password must be 8-16 characters with uppercase and special character"
            });
        }

        const [users] = await pool.execute(
            "SELECT password FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            users[0].password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.execute(
            "UPDATE users SET password = ? WHERE id = ?",
            [hashedPassword, userId]
        );

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Change password error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    signup,
    login,
    changePassword
};