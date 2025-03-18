import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useNotification } from "../context/NotificationContext";
import "../styles/forms.css"; 

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const showNotification = useNotification();

  const handleSubmit = (e) => {
    e.preventDefault();

    const savedUser = JSON.parse(localStorage.getItem("userData"));

    if (savedUser && savedUser.email === email.trim()) {
      showNotification("success", "Мы отправили ссылку для восстановления пароля на вашу электронную почту.");
    } else {
      showNotification("error", "Пользователь с таким Email не найден. Проверьте правильность введенных данных.");
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form">
        <h3 className="text-center">Восстановление пароля</h3>
        <p className="text-center">Введите адрес электронной почты,<br /> связанный с вашей учетной записью:</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите email"
              required
            />
          </div>
          <button type="submit" className="auth-button">Отправить</button>
        </form>
        <div className="text-under">
          <p><Link to="/login">Войти в аккаунт</Link></p>
          <p><Link to="/signup">Зарегистрироваться</Link></p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordForm;
