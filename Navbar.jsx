import React from "react";
import "./Navbar.css";

function Navbar() {
  return (
    <div className="navbar">
      <div className="navbar-left">
        <span className="logo">NETFLIX</span>
      </div>
      <div className="navbar-right">
        <span>Home</span>
        <span>TV Shows</span>
        <span>Movies</span>
        <span>My List</span>
        <img
          className="nav-avatar"
          src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
          alt="Avatar"
        />
      </div>
    </div>
  );
}

export default Navbar;
