import React, { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import EventList from "../components/EventList";
import "../styles/profilePage.css";

const ProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef(null);

  useEffect(() => {
    // Получаем высоту хедера
    const updateHeaderHeight = () => {
      const header = document.querySelector("nav"); // Находим хедер
      if (header) {
        setHeaderHeight(header.offsetHeight); // Устанавливаем его высоту
      }
    };

    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight); // Обновляем при изменении размера окна
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  const handleAddEvent = () => {
    navigate("/register-event");
  };

  const menuItems = [
    { name: "Мой профиль", path: "/profile" },
    { name: "Управление мероприятиями", path: "/profile/events" },
    { name: "Управление сообществом", path: "/profile/community" },
    { name: "Уведомления", path: "/profile/notifications" },
    { name: "Настройки", path: "/profile/settings" },
  ];

  return (
    <div className="profile-container" style={{ marginTop: `${headerHeight}px` }}>
      {/* 🔹 Левое меню */}
      <aside className="sidebar" style={{ top: `${headerHeight}px` }}>
        <ul>
          {menuItems.map((item) => (
            <li key={item.path} className={location.pathname === item.path ? "active" : ""}>
              <Link to={item.path}>{item.name}</Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* 🔹 Контентная часть */}
      <main className="profile-content">
        {location.pathname === "/profile" && <h2>Мой профиль (заглушка)</h2>}

        {location.pathname === "/profile/events" && (
          <div className="events-management">
            <Button onClick={handleAddEvent} className="create-event-btn">
              + Создать мероприятие
            </Button>

            {events.length === 0 ? (
              <div className="empty-events">
                <p>Здесь будут отображаться карточки мероприятий, которые вы создадите.</p>
              </div>
            ) : (
              <EventList events={events} setEvents={setEvents} />
            )}
          </div>
        )}

        {location.pathname === "/profile/community" && <h2>Управление сообществом (заглушка)</h2>}
        {location.pathname === "/profile/notifications" && <h2>Уведомления (заглушка)</h2>}
        {location.pathname === "/profile/settings" && <h2>Настройки (заглушка)</h2>}

        <Outlet />
      </main>
    </div>
  );
};

export default ProfilePage;
