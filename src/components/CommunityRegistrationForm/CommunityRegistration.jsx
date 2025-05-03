import React, { useState, useEffect } from "react";
import StepOne from "./steps/StepOne";
import StepTwo from "./steps/StepTwo";

import { useNavigate, useParams } from "react-router-dom";
import "../events/EventRegistrationForm/registrationForm.css";
import { useNotification } from "../../context/NotificationContext.js";

const EventRegistration = () => {
   const { id } = useParams();
   const [step, setStep] = useState(1);
   const navigate = useNavigate();
   const { showNotification } = useNotification();

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
      status: "",
      participants: "",
      contactEmail: "",
      contactPhone: "",
      ticketPrice: "",
      registrationDeadline: "",
   });

   useEffect(() => {
      if (id) {
         const savedEvents = JSON.parse(localStorage.getItem("events")) || [];
         const eventToEdit = savedEvents.find((e) => e.id === parseInt(id));
         if (eventToEdit) {
            setFormData(eventToEdit);
         }
      }
   }, [id]);

   const handleNext = (data) => {
      setFormData((prev) => ({ ...prev, ...data }));
      if (step === 2) {
         handleSave(data);
      } else {
         setStep((prev) => prev + 1);
         showNotification({
            type: "success",
            message: "Данные успешно сохранены!",
         });
      }
   };

   const handleBack = () => {
      navigate("/profile/events");
   };

   const handleCancel = () => {
      if (window.confirm("Вы уверены, что хотите отменить регистрацию?")) {
         showNotification({
            type: "warning",
            message: "Заполнение формы отменено",
         });
         navigate("/profile/events");
      }
   };

   const handleSave = (data) => {
      const updatedFormData = { ...formData, ...data };
      let savedEvents = JSON.parse(localStorage.getItem("events")) || [];

      if (id) {
         savedEvents = savedEvents.map((e) =>
            e.id === parseInt(id) ? { ...e, ...updatedFormData } : e
         );
         showNotification({
            type: "success",
            message: "Мероприятие успешно отредактировано!",
         });
      } else {
         const newEvent = { id: Date.now(), ...updatedFormData };
         savedEvents.push(newEvent);
         showNotification({
            type: "success",
            message: "Мероприятие успешно создано!",
         });
      }

      localStorage.setItem("events", JSON.stringify(savedEvents));
      navigate("/profile/events");
   };

   const renderStep = () => {
      switch (step) {
         case 1:
            return (
               <StepOne
                  onNext={handleNext}
                  formData={formData}
                  setFormData={setFormData}
               />
            );
         case 2:
            return (
               <StepTwo
                  onNext={handleNext}
                  onBack={handleBack}
                  formData={formData}
                  setFormData={setFormData}
               />
            );

         default:
            return null;
      }
   };

   return (
      <div className="registration-container">
         <div className="registration-form">
            <nav className="registration-sidebar">
               <button onClick={handleBack} className="back-button">
                  <span className="icon-wrapper">
                     <svg
                        width="8"
                        height="12"
                        viewBox="0 0 7 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                     >
                        <path
                           d="M6.70538 11.2946C7.09466 10.9053 7.095 10.2743 6.70615 9.88462L2.83 6L6.70615 2.11538C7.095 1.72569 7.09466 1.09466 6.70538 0.705384C6.31581 0.315811 5.68419 0.315811 5.29462 0.705384L0.565685 5.43431C0.253266 5.74673 0.253266 6.25327 0.565685 6.56569L5.29462 11.2946C5.68419 11.6842 6.31581 11.6842 6.70538 11.2946Z"
                           fill="#202022"
                        />
                     </svg>
                  </span>
                  Назад
               </button>
               <ul className="registration-menu">
                  <li className={step === 1 ? "active" : ""}>
                     Общая информация
                  </li>
                  <li className={step === 2 ? "active" : ""}>Команда</li>
               </ul>
            </nav>

            <div className="registration-main">
               <div className="registration-header">
                  <h2 className="registration-title">
                     {id ? `${formData.eventName}` : "Новое сообщество"}
                  </h2>
               </div>
               <div className="steps-indicator">
                  <span className={`step ${step === 1 ? "active" : ""}`}>
                     1
                  </span>
                  <span className={`step ${step === 2 ? "active" : ""}`}>
                     2
                  </span>
               </div>

               <div className="registration-content">{renderStep()}</div>
            </div>
         </div>
      </div>
   );
};

export default EventRegistration;
