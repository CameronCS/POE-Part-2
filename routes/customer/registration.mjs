import express from "express";
import bcrypt from "bcrypt";

import db from "../../db/conn.mjs";

const router = express.Router();

router.post('/', async (req, res) => {
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

        const collection = db.collection("users");
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

router.get('/health', (req, res) => {
    res.status(200).send("OK");
});

export default router;
