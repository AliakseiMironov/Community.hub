import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/EventCard.css';

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/register-event/${event.id}`);
  };

  const handleMenuClick = (e, action) => {
    e.stopPropagation();
    setShowMenu(false);
    action();
  };

  const getMenuItems = (status) => {
    const menuItems = [
      { 
        label: 'Опубликовать', 
        action: () => {
          // Здесь будет логика публикации
          console.log('Опубликовать');
        },
        showFor: ['draft', 'hidden']
      },
      { 
        label: 'Скрыть', 
        action: () => {
          // Здесь будет логика скрытия
          console.log('Скрыть');
        },
        showFor: ['published']
      },
      { 
        label: 'Редактировать', 
        action: handleEdit,
        showFor: ['draft', 'published', 'hidden', 'completed', 'cancelled']
      },
      { 
        label: 'Удалить', 
        action: () => {
          // Здесь будет логика удаления
          console.log('Удалить');
        },
        showFor: ['draft', 'published', 'hidden', 'completed', 'cancelled']
      }
    ];

    return menuItems.filter(item => item.showFor.includes(status || 'draft'));
  };

  return (
    <div className="event-card" onClick={() => navigate(`/event/${event.id}`)}>
      <div className="event-card__banner" style={{ 
        backgroundImage: event.cardBanner ? `url(${event.cardBanner})` : 'none',
        backgroundColor: !event.cardBanner ? '#F5F5F5' : 'transparent',
        filter: ['completed', 'cancelled'].includes(event.status) ? 'grayscale(100%)' : 'none'
      }}>
        <div className="event-card__status" style={{ backgroundColor: '#FEE719' }}>
          {event.status === 'draft' && 'Черновик'}
          {event.status === 'published' && 'Опубликовано'}
          {event.status === 'hidden' && 'Скрыто'}
          {event.status === 'completed' && 'Завершено'}
          {event.status === 'cancelled' && 'Отменено'}
        </div>
      </div>

      <div className="event-card__content">
        <div className="event-card__header">
          <h3 className="event-card__title">{event.eventName}</h3>
          <div className="event-card__menu" ref={menuRef}>
            <button 
              className="event-card__menu-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.99984 13.5C9.07158 13.5 8.18134 13.1313 7.52497 12.4749C6.86859 11.8185 6.49984 10.9283 6.49984 10C6.49984 9.07174 6.86859 8.18151 7.52497 7.52513C8.18134 6.86875 9.07158 6.5 9.99984 6.5C10.9281 6.5 11.8183 6.86875 12.4747 7.52513C13.1311 8.18151 13.4998 9.07174 13.4998 10C13.4998 10.9283 13.1311 11.8185 12.4747 12.4749C11.8183 13.1313 10.9281 13.5 9.99984 13.5ZM17.4298 10.97C17.4698 10.65 17.4998 10.33 17.4998 10C17.4998 9.67 17.4698 9.34 17.4298 9L19.5398 7.37C19.7298 7.22 19.7798 6.95 19.6598 6.73L17.6598 3.27C17.5398 3.05 17.2698 2.96 17.0498 3.05L14.5598 4.05C14.0398 3.66 13.4998 3.32 12.8698 3.07L12.4998 0.420002C12.4795 0.302219 12.4182 0.195429 12.3267 0.118553C12.2351 0.0416778 12.1194 -0.000319774 11.9998 1.83347e-06H7.99984C7.74984 1.83347e-06 7.53984 0.180002 7.49984 0.420002L7.12984 3.07C6.49984 3.32 5.95984 3.66 5.43984 4.05L2.94984 3.05C2.72984 2.96 2.45984 3.05 2.33984 3.27L0.339839 6.73C0.209839 6.95 0.26984 7.22 0.45984 7.37L2.56984 9C2.52984 9.34 2.49984 9.67 2.49984 10C2.49984 10.33 2.52984 10.65 2.56984 10.97L0.45984 12.63C0.26984 12.78 0.209839 13.05 0.339839 13.27L2.33984 16.73C2.45984 16.95 2.72984 17.03 2.94984 16.95L5.43984 15.94C5.95984 16.34 6.49984 16.68 7.12984 16.93L7.49984 19.58C7.53984 19.82 7.74984 20 7.99984 20H11.9998C12.2498 20 12.4598 19.82 12.4998 19.58L12.8698 16.93C13.4998 16.67 14.0398 16.34 14.5598 15.94L17.0498 16.95C17.2698 17.03 17.5398 16.95 17.6598 16.73L19.6598 13.27C19.7798 13.05 19.7298 12.78 19.5398 12.63L17.4298 10.97Z" fill="currentColor"/>
              </svg>
            </button>
            {showMenu && (
              <div className="event-card__menu-dropdown">
                {getMenuItems(event.status).map((item, index) => (
                  <button
                    key={index}
                    className="event-card__menu-item"
                    onClick={(e) => handleMenuClick(e, item.action)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="event-card__info">
          <div className="event-card__detail">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2H4C2.89543 2 2 2.89543 2 4V12C2 13.1046 2.89543 14 4 14H12C13.1046 14 14 13.1046 14 12V4C14 2.89543 13.1046 2 12 2Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 6H14" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M6 4V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 4V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>{formatDate(event.date)}</span>
          </div>
          
          <div className="event-card__detail">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 4.5V8H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>{event.startTime} - {event.endTime}</span>
          </div>

          <div className="event-card__detail">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 6.66667C14 11.3333 8 15.3333 8 15.3333C8 15.3333 2 11.3333 2 6.66667C2 5.07537 2.63214 3.54925 3.75736 2.42403C4.88258 1.29881 6.4087 0.666672 8 0.666672C9.5913 0.666672 11.1174 1.29881 12.2426 2.42403C13.3679 3.54925 14 5.07537 14 6.66667Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 8.66667C9.10457 8.66667 10 7.77124 10 6.66667C10 5.5621 9.10457 4.66667 8 4.66667C6.89543 4.66667 6 5.5621 6 6.66667C6 7.77124 6.89543 8.66667 8 8.66667Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>{event.location}</span>
          </div>
        </div>

        <div className="event-card__footer">
          <div className="event-card__community">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5.33333 8C5.33333 8.73638 5.93095 9.33333 6.66667 9.33333H9.33333C10.069 9.33333 10.6667 8.73638 10.6667 8C10.6667 7.26362 10.069 6.66667 9.33333 6.66667H6.66667C5.93095 6.66667 5.33333 7.26362 5.33333 8Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>{event.communityName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard; 