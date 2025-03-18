import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileMenu from "./ProfileMenu";
import logo from "../images/logo.png";
import "../styles/header.css";

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <img src={logo} alt="Community Hub" />
        </Link>

        <nav className="nav">
          <Link to="/calendar">Календарь</Link>
          <Link to="/community">Сообщество</Link>
          <Link to="/blog">Блог</Link>
          <Link to="/about">О нас</Link>
          <Link to="/contacts">Контакты</Link>
        </nav>
        {user ? <ProfileMenu /> : <Link to="/login" className="login-button">Войти</Link>}
      </div>
    </header>
  );
};

export default Header;
