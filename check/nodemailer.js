const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Store OTP temporarily (in real apps use DB)
let otpStore = {};

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Setup mail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your_email@gmail.com",
    pass: "your_app_password" // NOT your real password
  }
});

// Send OTP API
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  const otp = generateOTP();
  otpStore[email] = {
    otp,
    expiry: Date.now() + 5 * 60 * 1000 // 5 minutes
  };

  const mailOptions = {
    from: "your_email@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Verify OTP API
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  const record = otpStore[email];

  if (!record) {
    return res.status(400).json({ message: "No OTP found" });
  }

  if (Date.now() > record.expiry) {
    return res.status(400).json({ message: "OTP expired" });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  delete otpStore[email]; // clear after success

  res.json({ message: "Email verified successfully ✅" });
});

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});