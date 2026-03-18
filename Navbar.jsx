import React from "react";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-logo">
        Clinician Unchained
      </div>

      {/* Links */}
      <div className="navbar-links">
        <a href="/">Home</a>
        <a href="/dashboard">Dashboard</a>
        <a href="/storage">Storage</a>
        <a href="/timer">Timer</a>
      </div>

      {/* Right Section */}
      <div className="navbar-actions">
        <button className="nav-btn">Login</button>
        <div className="profile">R</div>
      </div>
    </nav>
  );
};

export default Navbar;