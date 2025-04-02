import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import "../styles/profilePage.css";

const ProfilePage = () => {
  const location = useLocation();

  const menuItems = [
    { name: "Мой профиль", path: "/profile" },
    { name: "Уведомления", path: "/profile/notifications" },
    { name: "Управление мероприятиями", path: "/profile/events" },
    { name: "Управление сообществом", path: "/profile/community" },
    { name: "Настройки", path: "/profile/settings" },
  ];

  return (
    <div className="profile-container">
      {/* Левое меню */}
      <aside className="sidebar">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path} className={location.pathname === item.path ? "active" : ""}>
              <Link to={item.path}>{item.name}</Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Контентная часть */}
      <main className="profile-content">
        <Outlet />
      </main>
    </div>
  );
};

export default ProfilePage;
