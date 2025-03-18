import React, { createContext, useState, useContext, useEffect } from "react";

// Создаём контекст
const AuthContext = createContext();

// Хук для использования контекста
export const useAuth = () => useContext(AuthContext);

// Провайдер авторизации
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Загружаем пользователя из localStorage при загрузке приложения
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userData"));
    if (storedUser) setUser(storedUser);
  }, []);

  // Функция входа
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  // Функция выхода
  const logout = () => {
    setUser(null); // Только очищаем состояние, данные остаются в localStorage

    // localStorage.removeItem("userData");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
