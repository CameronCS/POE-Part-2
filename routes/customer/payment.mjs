import express from "express";
import db from "../../db/conn.mjs";
import checkAuth from "../../middleware/checkauth.mjs"; // Authentication middleware
import { ObjectId } from "mongodb";

const router = express.Router();

// Create a new payment
router.post('/', checkAuth, async (req, res) => {
    const { amount, currency, provider, accountInfo, swiftCode } = req.body;

    // Basic input validation
    if (!amount || !currency || !provider || !accountInfo || !swiftCode) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const newPayment = {
            amount,
            currency,
            provider,
            accountInfo,
            swiftCode,
            createdAt: new Date(),
            status: "Pending" // Initial status
        };

        const collection = db.collection("payments");
        const result = await collection.insertOne(newPayment);

        res.status(201).json({ message: "Payment created successfully", paymentId: result.insertedId });
    } catch (error) {
        console.error("Error during payment creation:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Retrieve all payments
router.get('/', checkAuth, async (req, res) => {
    try {
        const collection = db.collection("payments");
        const payments = await collection.find({}).toArray();

        res.status(200).json(payments);
    } catch (error) {
        console.error("Error retrieving payments:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Retrieve a payment by ID
router.get('/:id', checkAuth, async (req, res) => {
    const { id } = { _id: new ObjectId(req.params.id) };
    try {
        const collection = db.collection("payments");
        const payment = await collection.findOne({id}); // Import ObjectId from mongodb

        if (!payment) {
            return res.status(404).json({ message: "Payment not found." });
        }

        res.status(200).json(payment);
    } catch (error) {
        console.error("Error retrieving payment by ID:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Health Check Route
router.get('/health', (req, res) => {
    res.status(200).send("OK");
});

export default router;
