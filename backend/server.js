require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const csurf = require("csurf");

const authRoutes = require("./routes/authRoutes");

const app = express();

// 🔐 Security Middlewares
app.use(express.json());
app.use(helmet());
app.use(xss());
app.use(cookieParser());

// 🌍 CORS
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// 🚫 Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// 🔒 CSRF Protection
const csrfProtection = csurf({ cookie: true });
app.use(csrfProtection);

// 🌐 Routes
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Secure API Running 🚀",
    csrfToken: req.csrfToken()
  });
});

// DB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB Connected");
  app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
  );
})
.catch(err => console.log(err));