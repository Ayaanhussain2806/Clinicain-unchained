// Simple middleware (fake auth check)

function authMiddleware(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  // Fake validation
  if (token !== "mysecrettoken") {
    return res.status(401).json({ message: "Invalid token" });
  }

  next();
}

module.exports = authMiddleware;