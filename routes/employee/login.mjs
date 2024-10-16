import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../../db/conn.mjs";
import ExpressBrute from "express-brute";

const router = express.Router();
var store = new ExpressBrute.MemoryStore();
var bruteForce = new ExpressBrute(store);

// Employee Login
router.post('/new', async (req, res) => {
    const { username, password } = req.body;

    // Basic input validation
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const newDocument = {
            username,
            password: hashedPassword,
        };

        const collection = db.collection("employees");
        const existingUser = await collection.findOne({ username });

        // Check if the user already exists
        if (existingUser) {
            return res.status(409).json({ message: "Username already exists." });
        }

        const result = await collection.insertOne(newDocument);
        res.status(201).json({ message: "User registered successfully", userId: result.insertedId });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});


router.post('/', bruteForce.prevent, async (req, res) => {
    const { username, password } = req.body;

    // Basic input validation
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        const collection = db.collection("employees"); // Assuming you have a separate collection for employees
        const employee = await collection.findOne({ username });

        // Check if the employee exists
        if (!employee) {
            return res.status(401).json({ message: "Authentication failed!" });
        }

        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, employee.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Authentication failed!" });
        }

        // Create a token upon successful authentication
        const token = jwt.sign({ username }, process.env.JWT_TOKEN_LEN, { expiresIn: "1h" });

        // Respond with the token and a success message
        res.status(200).json({ message: "Authentication successful", token });
    } catch (error) {
        console.error("Error during employee login:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Employee Logout
router.post('/logout', (req, res) => {
    // Invalidate the token on the client-side. 
    // For a JWT, this is typically done by simply discarding it on the client.
    res.status(200).json({ message: "Logout successful." });
});

// Health Check Route
router.get('/health', (req, res) => {
    res.status(200).send("OK");
});

export default router;
