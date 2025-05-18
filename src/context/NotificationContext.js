import React, { createContext, useState, useContext } from "react";
import Notification from "../components/common/Notification/Notification";

const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  let timer;

  const showNotification = (typeOrConfig, message, actions) => {
    let config;

    if (typeof typeOrConfig === "object") {
      config = typeOrConfig;
    } else {
      config = {
        type: typeOrConfig,
        message,
        actions,
      };
    }

    setNotification(config);
    if (config.type !== "saveNoData") {
      clearTimeout(timer);
      timer = setTimeout(() => setNotification(null), 600000);
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          actions={notification.actions}
          onClose={() => setNotification(null)}
        />
      )}
    </NotificationContext.Provider>
  );
};

// Хук для использования контекста
const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

export { NotificationProvider, useNotification };
