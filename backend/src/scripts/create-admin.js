const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

async function createAdmin() {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_ADDRESS, ADMIN_PASSWORD } = process.env;

    if (
        !ADMIN_NAME ||
        !ADMIN_EMAIL ||
        !ADMIN_ADDRESS ||
        !ADMIN_PASSWORD
    ) {
        throw new Error(
            "Set ADMIN_NAME, ADMIN_EMAIL, ADMIN_ADDRESS, and ADMIN_PASSWORD in the environment."
        );
    }

    const name = ADMIN_NAME.trim();
    const email = ADMIN_EMAIL.trim().toLowerCase();
    const address = ADMIN_ADDRESS.trim();

    if (name.length < 20 || name.length > 60) {
        throw new Error("ADMIN_NAME must be between 20 and 60 characters.");
    }

    if (address.length > 400) {
        throw new Error("ADMIN_ADDRESS cannot exceed 400 characters.");
    }

    if (!emailPattern.test(email)) {
        throw new Error("ADMIN_EMAIL must be a valid email address.");
    }

    if (!passwordPattern.test(ADMIN_PASSWORD)) {
        throw new Error(
            "ADMIN_PASSWORD must be 8-16 characters with an uppercase letter and a special character."
        );
    }

    const [existingUsers] = await pool.execute(
        "SELECT id, role FROM users WHERE email = ?",
        [email]
    );

    if (existingUsers.length > 0) {
        if (existingUsers[0].role === "ADMIN") {
            console.log("An administrator with this email already exists.");
            return;
        }

        throw new Error(
            "This email is already registered to a non-administrator account."
        );
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await pool.execute(
        `INSERT INTO users (name, email, address, password, role)
         VALUES (?, ?, ?, ?, 'ADMIN')`,
        [name, email, address, hashedPassword]
    );

    console.log("Administrator account created successfully.");
}

createAdmin()
    .catch((error) => {
        console.error("ADMIN BOOTSTRAP ERROR:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
