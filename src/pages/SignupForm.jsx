import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import "../styles/forms.css";

const Signup = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Валидация полей
  const validateField = (name, value) => {
    let error = "";
    const nameRegex = /^[А-Яа-яЁёІіЇїЄєҐґ-]+$/;
    const noEdgeHyphens = /^[А-Яа-яЁёІіЇїЄєҐґ][А-Яа-яЁёІіЇїЄєҐґ-]*[А-Яа-яЁёІіЇїЄєҐґ]$/;

    if (name === "lastName" || name === "firstName") {
      if (!value) error = `Введите ${name === "lastName" ? "фамилию" : "имя"}`;
      else if (!nameRegex.test(value)) error = "Можно только буквы кириллицы и дефис";
      else if (!noEdgeHyphens.test(value)) error = "Первый и последний символы должны быть буквами";
      else if (value.length < 2 || value.length > 30) error = "Длина должна быть от 2 до 30 символов";
    }

    if (name === "email") {
      if (!value) error = "Введите email";
      else if (!/^\S+@\S+\.\S+$/.test(value)) error = "Некорректный email";
    }

    if (name === "password") {
      if (!value) error = "Введите пароль";
      else if (value.length < 8 || value.length > 20) error = "Пароль: 8-20 символов";
      else if (!/^[A-Za-z0-9!@#$%^&*()_+={}[\]:;"'<>,.?/~`-]+$/.test(value))
        error = "Только латиница, цифры и спецсимволы";
      else if (!/[A-Za-z]/.test(value) || !/\d/.test(value))
        error = "Пароль: минимум 1 буква и 1 цифра";
    }

    return error;
  };

  // Обработчик изменения полей
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Обработчик потери фокуса
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Проверка перед отправкой
  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};
    
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    // Проверка существующего аккаунта
    const savedUsers = JSON.parse(localStorage.getItem("users")) || [];
    const userExists = savedUsers.some((user) => user.email === formData.email);
    
    if (userExists) {
      newErrors.email = "Профиль с таким email уже существует";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Сохранение пользователя
    const newUser = { ...formData };
    localStorage.setItem("users", JSON.stringify([...savedUsers, newUser]));
    localStorage.setItem("isAuthenticated", "true");
    login(newUser);
    navigate("/");
  };

  const isFormValid =
    Object.values(formData).every((value) => value.trim() !== "") &&
    Object.values(errors).every((err) => !err);

  return (
    <AuthLayout>
      <div className="auth-form">
        <h3 className="text-center">Регистрация</h3>
        <p>Введите ваши данные для регистрации:</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="lastName">Фамилия</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-control ${errors.lastName ? "input-error" : ""}`}
            />
            {errors.lastName && <p className="error-message">{errors.lastName}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="firstName">Имя</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-control ${errors.firstName ? "input-error" : ""}`}
            />
            {errors.firstName && <p className="error-message">{errors.firstName}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-control ${errors.email ? "input-error" : ""}`}
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-control ${errors.password ? "input-error" : ""}`}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.83 9L15 12.16V12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9H11.83ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.77 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C10.6739 17 9.40215 16.4732 8.46447 15.5355C7.52678 14.5979 7 13.3261 7 12C7 11.21 7.2 10.47 7.53 9.8ZM2 4.27L4.28 6.55L4.73 7C3.08 8.3 1.78 10 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.81 19.08L19.73 22L21 20.73L3.27 3M12 7C13.3261 7 14.5979 7.52678 15.5355 8.46447C16.4732 9.40215 17 10.6739 17 12C17 12.64 16.87 13.26 16.64 13.82L19.57 16.75C21.07 15.5 22.27 13.86 23 12C21.27 7.61 17 4.5 12 4.5C10.6 4.5 9.26 4.75 8 5.2L10.17 7.35C10.74 7.13 11.35 7 12 7Z" fill="#C7C7CC"/>
            </svg>
            : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9ZM12 17C10.6739 17 9.40215 16.4732 8.46447 15.5355C7.52678 14.5979 7 13.3261 7 12C7 10.6739 7.52678 9.40215 8.46447 8.46447C9.40215 7.52678 10.6739 7 12 7C13.3261 7 14.5979 7.52678 15.5355 8.46447C16.4732 9.40215 17 10.6739 17 12C17 13.3261 16.4732 14.5979 15.5355 15.5355C14.5979 16.4732 13.3261 17 12 17ZM12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5Z" fill="#C7C7CC"/>
            </svg>
            }
              </button>
            </div>
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className={`auth-button ${!isFormValid ? "disabled-button" : ""}`}
            disabled={!isFormValid}
          >
            Создать аккаунт
          </button>
        </form>
        <div className="text-under">
          <p>Есть аккаунт? <Link to="/login">Войти</Link></p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Signup;
