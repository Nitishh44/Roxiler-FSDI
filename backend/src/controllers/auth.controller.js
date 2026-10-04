
const signup = async (req, res) => {
    try {
        const { name, email, address, password } = req.body;

        if (!name || !email || !address || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
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

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            userId: result.insertId
        });

    } catch (error) {
        console.error("Signup error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

