import React from "react";
import "../styles/authBackground.css";
import logo from "../images/header-logo.png";

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-background">
      <img src={logo} alt="community.hub" className="auth-logo" />
      <div className="auth-content">{children}</div>
    </div>
  );
};

export default AuthLayout;