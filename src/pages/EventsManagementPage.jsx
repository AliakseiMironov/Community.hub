import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import '../styles/profilePage.css';
// стили для страницы управления мероприятиями берутся из profilePage.css т.к. events-management передается в profilePage.jsx в качестве Outlet
const EventsManagementPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => {
    // Загрузка мероприятий из localStorage
    const savedEvents = JSON.parse(localStorage.getItem('events')) || [];
    setEvents(savedEvents);
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Вы уверены, что хотите удалить мероприятие?")) {
      const updatedEvents = events.filter(event => event.id !== id);
      setEvents(updatedEvents);
      localStorage.setItem("events", JSON.stringify(updatedEvents));
    }
  };

  const toggleFilter = (filter) => {
    setActiveFilters(prev => {
      if (prev.includes(filter)) {
        return prev.filter(f => f !== filter);
      } else {
        return [...prev, filter];
      }
    });
  };

  const filteredEvents = events.filter(event => {
    if (activeFilters.length === 0) return true;
    return activeFilters.some(filter => event.labels?.includes(filter));
  });

  return (
    <div className="events-management">
      <button 
        className="create-event-btn"
        onClick={() => navigate('/register-event')}
      >
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
          <p>
            Здесь будут отображаться карточки мероприятий, которые вы создадите. 
            Настройте основные параметры через форму заявки выше и начните 
            организовывать свои первые мероприятия.
          </p>
        </div>
      ) : (
        <div className="events-container">
          <div className="events-filters">
            <button 
              className={`filter-btn ${activeFilters.includes('draft') ? 'active' : ''}`}
              onClick={() => toggleFilter('draft')}
            >
              Черновик
            </button>
            <button 
              className={`filter-btn ${activeFilters.includes('published') ? 'active' : ''}`}
              onClick={() => toggleFilter('published')}
            >
              Опубликовано
            </button>
            <button 
              className={`filter-btn ${activeFilters.includes('hidden') ? 'active' : ''}`}
              onClick={() => toggleFilter('hidden')}
            >
              Скрыто
            </button>
            <button 
              className={`filter-btn ${activeFilters.includes('completed') ? 'active' : ''}`}
              onClick={() => toggleFilter('completed')}
            >
              Завершено
            </button>
            <button 
              className={`filter-btn ${activeFilters.includes('cancelled') ? 'active' : ''}`}
              onClick={() => toggleFilter('cancelled')}
            >
              Отменено
            </button>
          </div>
          <div className="events-list">
            {filteredEvents.map(event => (
              <div key={event.id} className="event-item">
                <EventCard event={event} />
                <div className="event-actions">
                  <button 
                    className="edit-button"
                    onClick={() => navigate(`/register-event/${event.id}`)}
                  >
                    Редактировать
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDelete(event.id)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsManagementPage; 