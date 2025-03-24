import React, { createContext, useState, useContext } from "react";
import Notification from "../components/Notification";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  let timer;

  const showNotification = (type, message) => {
    setNotification({ type, message });
    clearTimeout(timer); // Очищаем предыдущий таймер, если есть
    timer = setTimeout(() => setNotification(null), 600000); // Уведомление исправить после тестов на 5 сек
  };

  return (
    <NotificationContext.Provider value={showNotification}>
      {children}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </NotificationContext.Provider>
  );
};

// Хук для использования контекста
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
