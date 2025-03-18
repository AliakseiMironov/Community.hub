import React from "react";
import { Container} from "react-bootstrap";

const Home = () => {
 
  return (
    <Container className="d-flex flex-column align-items-center justify-content-center vh-100">
      <h1 className="mb-4">Добро пожаловать!</h1>
      <p>Нажмите кнопку ниже, чтобы войти в систему.</p>
    </Container>
  );
};

export default Home;