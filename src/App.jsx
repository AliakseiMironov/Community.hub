import React from "react";
import Navigation from "./routes/Navigation"; // Импортируем файл навигации
import "bootstrap/dist/css/bootstrap.min.css";
import { NotificationProvider } from './context/NotificationContext';

const App = () => {
  return (
    <NotificationProvider>
      <Navigation />
    </NotificationProvider>
  );
};

export default App;
