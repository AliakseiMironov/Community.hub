import React from "react";
import { Container, Card } from "react-bootstrap";
import "../styles/forms.css";

const AuthCard = ({ title, children }) => (
  <Container className="auth-container">
    <Card className="auth-card">
      <h3 className="auth-title">{title}</h3>
      {children}
    </Card>
  </Container>
);

export default AuthCard;
