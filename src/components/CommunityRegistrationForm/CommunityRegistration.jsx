import React, { useState, useEffect } from "react";
import StepOne from "./steps/StepOne";
import StepTwo from "./steps/StepTwo";
import { useNavigate, useParams } from "react-router-dom";
import "../events/EventRegistrationForm/registrationForm.css";
import { useNotification } from "../../context/NotificationContext";

const CommunityRegistration = () => {
   const { id } = useParams();
   const [step, setStep] = useState(1);
   const [formData, setFD] = useState({
      /* --- поля сообщества --- */
      communityEventName: "",
      communityDescription: "",
      communityLocation: "",
      communityEventType: "",
      tags: [],
      logotipBanner: null,
      cardBanner: null,
      /* --- команда --- */
      founders: [],
      sponsors: [],
      agree: false,
      personal: false,
   });

   const nav = useNavigate();
   const { showNotification } = useNotification();

   /* ───────── загрузка черновика / режима редактирования ───────── */
   useEffect(() => {
      if (!id) return;
      const list = JSON.parse(localStorage.getItem("communities")) || [];
      const row = list.find((c) => c.id === +id);
      if (row) setFD(row);
   }, [id]);

   /* ───────── переходы между шагами ───────── */
   const next = (data) => {
      setFD((prev) => ({ ...prev, ...data }));
      if (step === 2) {
         save({ ...formData, ...data });
      } else {
         setStep((s) => s + 1);
      }
   };

   const back = () => nav("/profile/community");

   /* ───────── финальное сохранение / обновление ───────── */
   const save = (payload) => {
      let list = JSON.parse(localStorage.getItem("communities")) || [];

      if (id) {
         list = list.map((c) => (c.id === +id ? { ...c, ...payload } : c));
         showNotification({
            type: "success",
            message: "Сообщество обновлено!",
         });
      } else {
         list.push({ id: Date.now(), ...payload });
         showNotification({ type: "success", message: "Сообщество создано!" });
      }

      localStorage.setItem("communities", JSON.stringify(list));
      nav("/profile/community");
   };

   /* ───────── отрисовка ───────── */
   const renderStep = () =>
      step === 1 ? (
         <StepOne onNext={next} formData={formData} setFormData={setFD} />
      ) : (
         <StepTwo
            onNext={next}
            onBack={back}
            formData={formData}
            setFormData={setFD}
         />
      );

   return (
      <div className="registration-container">
         <div className="registration-form">
            {/* боковое меню и заголовок */}
            <nav className="registration-sidebar">
               <button onClick={back} className="back-button">
                  …
               </button>
               <ul className="registration-menu">
                  <li className={step === 1 ? "active" : ""}>
                     Общая информация
                  </li>
                  <li className={step === 2 ? "active" : ""}>Команда</li>
               </ul>
            </nav>

            <div className="registration-main">
               <h2 className="registration-title">
                  {id
                     ? formData.communityEventName || "Без названия"
                     : "Новое сообщество"}
               </h2>

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
export default CommunityRegistration;
