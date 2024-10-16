import express from "express";
import db from "../../db/conn.mjs";
import checkAuth from "../../middleware/checkauth.mjs"; // Make sure to use this to check for authentication
import { ObjectId } from "mongodb";

const router = express.Router();

// Retrieve a list of pending payments for verification
router.get('/', checkAuth, async (req, res) => {
    try {
        const collection = db.collection("payments");
        const pendingPayments = await collection.find({ status: "Pending" }).toArray();

        res.status(200).json(pendingPayments);
    } catch (error) {
        console.error("Error retrieving pending payments:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Retrieve details for a specific payment by ID
router.get('/:id', checkAuth, async (req, res) => {
    const { id } = req.params;

    try {
        const collection = db.collection("payments");
        const payment = await collection.findOne({ _id: new ObjectId(id) });

        if (!payment) {
            return res.status(404).json({ message: "Payment not found." });
        }

        res.status(200).json(payment);
    } catch (error) {
        console.error("Error retrieving payment by ID:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Verify a payment (update status as verified)
router.post('/:id/verify', checkAuth, async (req, res) => {
    const { id } = req.params;

    try {
        const collection = db.collection("payments");
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status: "Verified" } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "Payment not found or already verified." });
        }

        res.status(200).json({ message: "Payment verified successfully." });
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Submit a verified payment to SWIFT
router.post('/:id/submit', checkAuth, async (req, res) => {
    const { id } = req.params;

    try {
        const collection = db.collection("payments");
        const result = await collection.updateOne(
            { _id: new ObjectId(id), status: "Verified" },
            { $set: { status: "Submitted" } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "Payment not found or not verified." });
        }

        // Here you can add additional logic to submit the payment to SWIFT
        res.status(200).json({ message: "Payment submitted to SWIFT successfully." });
    } catch (error) {
        console.error("Error submitting payment to SWIFT:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Health Check Route
router.get('/health', (req, res) => {
    res.status(200).send("OK");
});

export default router;
