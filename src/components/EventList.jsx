import React from "react";
import { Link } from "react-router-dom";

const EventList = ({ events, setEvents }) => {
  if (!events || events.length === 0) {
    return <p>Нет мероприятий</p>;
  }

  const handleDelete = (id) => {
    if (window.confirm("Вы уверены, что хотите удалить мероприятие?")) {
      const updatedEvents = events.filter(event => event.id !== id);
      
      // Обновляем состояние и localStorage после удаления
      setEvents(updatedEvents);
      localStorage.setItem("events", JSON.stringify(updatedEvents));
    }
  };

  return (
    <ul>
      {events.map((event) => (
        <li key={event.id}>
          <span>{event.eventName}</span>

          <Link to={`/register-event/${event.id}`}>
            <button>Редактировать</button>
          </Link>

          <button onClick={() => handleDelete(event.id)}>Удалить</button>
        </li>
      ))}
    </ul>
  );
};

export default EventList;
