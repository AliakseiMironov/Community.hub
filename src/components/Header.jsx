import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileMenu from "./ProfileMenu";
import logo from "../images/logo.png";
import "../styles/header.css";
// import { useState } from "react";

const Header = () => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <img src={logo} alt="Community Hub" />
        </Link>

        {/* Бургер-иконка */}
        <div className={`burger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>

        <nav className={`nav ${menuOpen ? "open" : ""}`}>
          <NavLink className="calendar" to="/calendar">Календарь</NavLink>
          <span className="separator"></span>
          <NavLink className="community" to="/community">Сообщество</NavLink>
          <span className="separator"></span>
          <NavLink className="blog" to="/blog">Блог</NavLink>
          <span className="separator"></span>
          <NavLink className="about" to="/about">О нас</NavLink>
          <span className="separator"></span>
          <NavLink className="contacts" to="/contacts">Контакты</NavLink>
        </nav>
        {user ? <ProfileMenu /> : <Link to="/login" className="login-button">Войти</Link>}
      </div>
    </header>
  );
};

export default Header;
