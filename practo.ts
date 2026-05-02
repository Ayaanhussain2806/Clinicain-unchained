const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

/* ================= DB CONNECTION ================= */
mongoose.connect("mongodb://127.0.0.1:27017/practo_clone")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

/* ================= MODELS ================= */

// User
const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  email: String,
  password: String
}));

// Doctor
const Doctor = mongoose.model("Doctor", new mongoose.Schema({
  name: String,
  specialization: String,
  availability: [String]
}));

// Appointment
const Appointment = mongoose.model("Appointment", new mongoose.Schema({
  userId: String,
  doctorId: String,
  slot: String,
  status: { type: String, default: "booked" }
}));

/* ================= MIDDLEWARE ================= */

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, "secret");
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};

/* ================= AUTH APIs ================= */

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ msg: "User registered", user });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user || user.password !== req.body.password) {
    return res.status(400).json({ msg: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, "secret");
  res.json({ token });
});

/* ================= DOCTOR APIs ================= */

// Add doctor
app.post("/api/doctors", async (req, res) => {
  const doctor = new Doctor(req.body);
  await doctor.save();
  res.json(doctor);
});

// Get all doctors
app.get("/api/doctors", async (req, res) => {
  const doctors = await Doctor.find();
  res.json(doctors);
});

// Search doctor by specialization
app.get("/api/doctors/search/:spec", async (req, res) => {
  const doctors = await Doctor.find({
    specialization: req.params.spec
  });
  res.json(doctors);
});

/* ================= APPOINTMENT APIs ================= */

// Book appointment (Protected)
app.post("/api/appointments/book", authMiddleware, async (req, res) => {
  const appointment = new Appointment({
    userId: req.user.id,
    doctorId: req.body.doctorId,
    slot: req.body.slot
  });

  await appointment.save();
  res.json({ msg: "Appointment booked", appointment });
});

// Get user appointments
app.get("/api/appointments", authMiddleware, async (req, res) => {
  const appointments = await Appointment.find({ userId: req.user.id });
  res.json(appointments);
});

// Cancel appointment
app.delete("/api/appointments/:id", authMiddleware, async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.json({ msg: "Appointment cancelled" });
});

/* ================= SERVER ================= */

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
