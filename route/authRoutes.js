const express = require("express");
const router = express.Router();

// Fake DB
let users = [];

// Register
router.post("/register", (req, res) => {
  const { email, password } = req.body;

  const userExists = users.find(u => u.email === email);
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ email, password });
  res.json({ message: "User registered successfully" });
});

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({ message: "Login successful", user });
});

module.exports = router;