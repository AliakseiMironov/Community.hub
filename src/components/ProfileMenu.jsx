import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/profileMenu.css";

// Функция для получения инициалов
const getUserInitials = (firstName, lastName) => {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
};

// Функция для генерации случайного цвета
const getRandomColor = () => {
  const colors = ["#FFA07A", "#FFD700", "#98FB98", "#87CEFA", "#DDA0DD", "#FF69B4"];
  return colors[Math.floor(Math.random() * colors.length)];
};

const ProfileMenu = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const userInitials = getUserInitials(user.firstName, user.lastName);
  const bgColor = getRandomColor();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="profile-menu">
      <button className="profile-avatar" style={{ backgroundColor: bgColor }} onClick={() => setIsOpen(!isOpen)}>
        {userInitials}
      </button>

      {isOpen && (
        <ul className="profile-dropdown">
          <li onClick={() => navigate("/profile")}>Профиль</li>
          <li onClick={() => navigate("/profile/notifications")}>Уведомления</li>
          <li onClick={() => navigate("/profile/events")}>Мои мероприятия</li>
          <li onClick={() => navigate("/profile/community")}>Мои сообщества</li>
          <li onClick={() => navigate("/profile/settings")}>Настройки</li>
          <li className="logout" onClick={handleLogout}>Выйти</li>
        </ul>
      )}
    </div>
  );
};

export default ProfileMenu;
