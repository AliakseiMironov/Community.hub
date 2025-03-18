import React, { useState, useEffect } from "react";
import StepOne from "../components/StepOne";
import StepTwo from "../components/StepTwo";
import StepThree from "../components/StepThree";
import { Container, ProgressBar } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

const EventRegistration = () => {
  const { id } = useParams(); // Получаем id мероприятия, если есть
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // Начальные данные формы
  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    cardBanner: null,
    pageBanner: null,
    eventType: "",
    eventFormat: "",
    category: "",
    theme: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    address: "",
    status: "planned",
    participants: "",
    contactEmail: "",
    contactPhone: "",
    ticketPrice: "",
    registrationDeadline: "",
  });

  // Если редактируем мероприятие, загружаем его данные
  useEffect(() => {
    if (id) {
      const savedEvents = JSON.parse(localStorage.getItem("events")) || [];
      const eventToEdit = savedEvents.find((e) => e.id === parseInt(id));
      if (eventToEdit) {
        setFormData(eventToEdit);
      }
    }
  }, [id]);

  // Переход к следующему шагу
  const handleNext = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep((prev) => prev + 1);
  };

  // Возврат к предыдущему шагу
  const handleBack = () => {
    setStep((prev) => (prev > 1 ? prev - 1 : prev));
  };

  // Отмена регистрации (возврат в профиль)
  const handleCancel = () => {
    if (window.confirm("Вы уверены, что хотите отменить регистрацию?")) {
      navigate("/profile");
    }
  };

  // Сохранение данных мероприятия
  const handleSave = (data) => {
    let savedEvents = JSON.parse(localStorage.getItem("events")) || [];

    if (id) {
      // Если редактируем существующее мероприятие, обновляем его
      savedEvents = savedEvents.map((e) =>
        e.id === parseInt(id) ? { ...e, ...data } : e
      );
    } else {
      // Если создаем новое мероприятие
      const newEvent = { id: Date.now(), ...data };
      savedEvents.push(newEvent);
    }

    localStorage.setItem("events", JSON.stringify(savedEvents));
    navigate("/profile");
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center">
        {id ? "Редактирование мероприятия" : "Регистрация мероприятия"}
      </h2>
      <ProgressBar now={(step / 3) * 100} className="mb-4" />

      {step === 1 && (
        <StepOne onNext={handleNext} formData={formData} setFormData={setFormData} />
      )}
      {step === 2 && (
        <StepTwo
          onNext={handleNext}
          onBack={handleBack}
          formData={formData}
          setFormData={setFormData}
        />
      )}
      {step === 3 && (
        <StepThree
          onBack={handleBack}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </Container>
  );
};

export default EventRegistration;
