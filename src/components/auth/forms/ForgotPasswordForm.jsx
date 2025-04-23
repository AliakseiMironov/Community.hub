import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../AuthLayout/AuthLayout";
import { useNotification } from "../../../context/NotificationContext";
import "./forms.css"; 

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const showNotification = useNotification();

  const validateEmail = (value) => {
    if (!value) {
      setErrors({ email: "Введите email" });
    } else if (!/^\S+@\S+\.\S+$/.test(value)) {
      setErrors({ email: "Некорректный email" });
    } else {
      setErrors({});
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setErrors({ email: "Введите email" });
      return;
    }

    const savedUser = JSON.parse(localStorage.getItem("userData"));

    if (savedUser && savedUser.email === email.trim()) {
      showNotification('check_email', 'Мы отправили ссылку для восстановления пароля на вашу электронную почту.');
    } else {
      showNotification('error', 'Пользователь с таким Email не найден. Проверьте правильность введенных данных.');
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form">
        <h3 className="text-center">Восстановление пароля</h3>
        <p className="text-center">Введите адрес электронной почты,<br /> связанный с вашей учетной записью:</p>
        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label>Email</label>
            <input
              type="email"
              className={`auth-form-control ${errors.email ? "input-error" : ""}`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({});
              }}
              onBlur={(e) => validateEmail(e.target.value)}
              placeholder="Введите email"
              required
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
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
