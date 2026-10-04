const assert = require("node:assert/strict");
const test = require("node:test");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../src/config/db");
const { signup, login } = require("../src/controllers/auth.controller");
const { submitRating } = require("../src/controllers/rating.controller");

function responseRecorder() {
    return {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
}

test("signup rejects names shorter than the assessment minimum", async () => {
    const res = responseRecorder();

    await signup({
        body: {
            name: "Too short",
            email: "person@example.com",
            address: "An address",
            password: "Strong-Pass1"
        }
    }, res);

    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /20 and 60 characters/);
});

test("signup rejects invalid email before any database operation", async () => {
    const res = responseRecorder();

    await signup({
        body: {
            name: "Assessment Candidate Full Name",
            email: "not-an-email",
            address: "An address",
            password: "Strong-Pass1"
        }
    }, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, "Invalid email address");
});

test("ratings outside the required 1–5 range are rejected", async () => {
    const res = responseRecorder();

    await submitRating({
        body: { store_id: 10, rating: 6 },
        user: { id: 1 }
    }, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, "Rating must be between 1 and 5");
});

test("signup hashes the password and login returns a role-bound token", async () => {
    const originalExecute = pool.execute;
    const originalSecret = process.env.JWT_SECRET;
    let passwordHash;

    try {
        process.env.JWT_SECRET = "assessment-test-secret";
        pool.execute = async (query, values) => {
            if (query.includes("SELECT id FROM users")) {
                return [[]];
            }

            if (query.includes("INSERT INTO users")) {
                passwordHash = values[2];
                return [{ insertId: 42 }];
            }

            throw new Error("Unexpected SQL query in auth test");
        };

        const signupResponse = responseRecorder();
        await signup({
            body: {
                name: "Assessment Candidate Full Name",
                email: "candidate@example.com",
                address: "42 Example Avenue",
                password: "Strong-Pass1"
            }
        }, signupResponse);

        assert.equal(signupResponse.statusCode, 201);
        assert.notEqual(passwordHash, "Strong-Pass1");
        assert.equal(await bcrypt.compare("Strong-Pass1", passwordHash), true);

        pool.execute = async () => [[{
            id: 42,
            name: "Assessment Candidate Full Name",
            email: "candidate@example.com",
            password: passwordHash,
            role: "USER"
        }]];

        const loginResponse = responseRecorder();
        await login({
            body: {
                email: "candidate@example.com",
                password: "Strong-Pass1"
            }
        }, loginResponse);

        assert.equal(loginResponse.statusCode, 200);
        assert.equal(jwt.verify(loginResponse.body.token, process.env.JWT_SECRET).role, "USER");
        assert.equal(loginResponse.body.user.id, 42);
    } finally {
        pool.execute = originalExecute;
        if (originalSecret === undefined) {
            delete process.env.JWT_SECRET;
        } else {
            process.env.JWT_SECRET = originalSecret;
        }
    }
});

test("valid rating saves with an atomic insert-or-update", async () => {
    const originalExecute = pool.execute;
    let saveQuery;
    let saveValues;

    try {
        pool.execute = async (query, values) => {
            if (query.includes("SELECT id FROM stores")) {
                return [[{ id: 9 }]];
            }
            saveQuery = query;
            saveValues = values;
            return [{ affectedRows: 1 }];
        };

        const res = responseRecorder();
        await submitRating({
            body: { store_id: "9", rating: "5" },
            user: { id: 7 }
        }, res);

        assert.equal(res.statusCode, 200);
        assert.match(saveQuery, /ON DUPLICATE KEY UPDATE/);
        assert.deepEqual(saveValues, [7, 9, 5]);
    } finally {
        pool.execute = originalExecute;
    }
});
