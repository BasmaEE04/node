const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
require("dotenv").config(); // For environment variables

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Temporary in-memory store for OTPs (use a more persistent store in production)
let otpStore = {};

// Generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

// Function to send OTP
const sendOTP = async (email) => {
    const otp = generateOTP();

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER, // Use environment variables
            pass: process.env.EMAIL_PASS,
        },
    });

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}: ${otp}`);

    // Store the OTP for this email (in-memory storage for demo purposes)
    otpStore[email] = otp;
};

// API Route to Request OTP (Send OTP)
app.post("/send-otp", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        await sendOTP(email);
        res.json({ message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error sending OTP" });
    }
});

// API Route to Verify OTP (Check OTP)
app.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: "Email and OTP are required" });
    }

    // Check if OTP is valid for this email
    const storedOTP = otpStore[email];

    if (storedOTP && storedOTP === parseInt(otp)) {
        // OTP is correct, remove it from store after verification
        delete otpStore[email];
        res.json({ message: "OTP verified successfully" });
    } else {
        res.status(400).json({ error: "Invalid OTP" });
    }
});

// Start server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});