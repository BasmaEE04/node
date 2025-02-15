const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
require("dotenv").config(); // For environment variables

const app = express();
app.use(cors());
app.use(bodyParser.json());

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

    return otp; // Return OTP for verification
};

// API Route to Request OTP
app.post("/send-otp", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        const otp = await sendOTP(email);
        res.json({ message: "OTP sent successfully", otp }); // Send OTP (remove in production)
    } catch (error) {
        res.status(500).json({ error: "Error sending OTP" });
    }
});

// Start server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
