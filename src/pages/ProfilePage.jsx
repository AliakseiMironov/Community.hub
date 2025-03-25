import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import EventList from "../components/EventList";
import "../styles/profilePage.css";

const ProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

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
        {location.pathname === "/profile" && <h2>Мой профиль (заглушка)</h2>}

        {location.pathname === "/profile/events" && (
          <div className="events-management">
            <button onClick={handleAddEvent} className="create-event-btn">
            <span className="icon-wrapper">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 7C14 7.55228 13.5523 8 13 8H8V13C8 13.5523 7.55228 14 7 14C6.44772 14 6 13.5523 6 13V8H1C0.447715 8 0 7.55228 0 7C0 6.44772 0.447715 6 1 6H6V1C6 0.447715 6.44772 0 7 0C7.55228 0 8 0.447715 8 1V6H13C13.5523 6 14 6.44772 14 7Z"
                  fill="#202022"
                />
              </svg>
            </span>
            Создать мероприятие
          </button>

            {events.length === 0 ? (
              <div className="empty-events">
                <p>Здесь будут отображаться карточки мероприятий, которые вы создадите. Настройте основные параметры через форму заявки выше и начните организовывать свои первые мероприятия.</p>
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
