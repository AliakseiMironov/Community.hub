import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import EventList from "../components/EventList";

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    //  Загружаем мероприятия из localStorage
    const savedEvents = JSON.parse(localStorage.getItem("events")) || [];
    setEvents(savedEvents);
  }, []);

  const handleAddEvent = () => {
    navigate("/register-event");
  };

  return (
    <div className="container mt-5">
      <h2>Управление мероприятиями</h2>
      <Button onClick={handleAddEvent} className="mb-3">Создать мероприятие</Button>

      <h3>Мероприятия:</h3>
      {/* Передаем `setEvents` в `EventList`, чтобы обновлять список */}
      <EventList events={events} setEvents={setEvents} />
    </div>
  );
};

export default EventManagement;
