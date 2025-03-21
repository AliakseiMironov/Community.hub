import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/profileMenu.css";

const getUserInitials = (firstName, lastName) => {
  return firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : "";
};

const ProfileMenu = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) return null; 

  const userInitials = getUserInitials(user.firstName, user.lastName);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  const handleMenuClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="profile-menu" ref={menuRef}>
      <button className="profile-avatar" onClick={() => setIsOpen(!isOpen)}>
        {userInitials}
        <span className="notification-indicator"></span>
      </button>

      {isOpen && (
        <ul className="profile-dropdown">
          <li onClick={() => handleMenuClick("/profile")}>Мой профиль</li>
          <li onClick={() => handleMenuClick("/profile/notifications")}>Уведомления</li>
          <li onClick={() => handleMenuClick("/profile/events")}>Мероприятия</li>
          <li onClick={() => handleMenuClick("/profile/community")}>Сообщества</li>
          <li onClick={() => handleMenuClick("/profile/settings")}>Настройки</li>
          <li onClick={handleLogout}>Выйти</li>
        </ul>
      )}
    </div>
  );
};

export default ProfileMenu;
