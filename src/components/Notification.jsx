import React from "react";
import "../styles/notification.css";

const Notification = ({ type, message, onClose }) => {
  return (
    <div className={`notification ${type}`}>
      <div className="notification-header">
        <button className="notification-close" onClick={onClose}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.295 7.115C18.6844 6.72564 18.6844 6.09436 18.295 5.705C17.9056 5.31564 17.2744 5.31564 16.885 5.705L12 10.59L7.115 5.705C6.72564 5.31564 6.09436 5.31564 5.705 5.705C5.31564 6.09436 5.31564 6.72564 5.705 7.115L10.59 12L5.705 16.885C5.31564 17.2744 5.31564 17.9056 5.705 18.295C6.09436 18.6844 6.72564 18.6844 7.115 18.295L12 13.41L16.885 18.295C17.2744 18.6844 17.9056 18.6844 18.295 18.295C18.6844 17.9056 18.6844 17.2744 18.295 16.885L13.41 12L18.295 7.115Z" fill="#202022"/>
        </svg>
        </button>
      </div>

      <div className="notification-body">
        <div className="notification-icon">
          {type === "success" || type === "recovery_pass" ? (
            <svg className="success" width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.2948 6.29486C20.6843 6.68431 20.6843 7.31574 20.2948 7.70519L10.4142 17.5858C9.63316 18.3669 8.36684 18.3669 7.58579 17.5858L4.20543 14.2055C3.81583 13.8159 3.81583 13.1842 4.20543 12.7946C4.59469 12.4053 5.22569 12.4049 5.61543 12.7937L9 16.17L18.8848 6.29453C19.2743 5.90539 19.9055 5.90554 20.2948 6.29486Z" fill="#202022"/>
            </svg>
          ) : (
            <svg className="error" width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 14H11V9H13M13 18H11V16H13M1.43451 20.2495C1.24153 20.5828 1.48206 21 1.86722 21H22.1328C22.5179 21 22.7585 20.5828 22.5655 20.2495L12.4327 2.74741C12.2401 2.41477 11.7599 2.41477 11.5673 2.74741L1.43451 20.2495Z" fill="white"/>
            </svg>
          )}
        </div>
        
        <p className="notification-title">
          {type === "success" ? "Проверьте почту!" :
          type === "error" ? "Ошибка!" :
          type === "recovery_pass" ? "Поздравляем!" : "Информация"}
        </p>
        <p className="notification-message">{message}</p>
      </div>
    </div>
  );
};

export default Notification;
