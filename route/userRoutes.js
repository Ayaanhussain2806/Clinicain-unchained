const express = require("express");
const router = express.Router();

// Sample user data
let profile = {
  name: "Rishabh",
  email: "rishabh@example.com",
  role: "student"
};

// Get profile
router.get("/profile", (req, res) => {
  res.json(profile);
});

// Update profile
router.put("/profile", (req, res) => {
  const { name } = req.body;
  profile.name = name || profile.name;

  res.json({ message: "Profile updated", profile });
});

module.exports = router;