import React from "react";
import ReactDOM from "react-dom/client"; // Изменили импорт
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
// import "../src/styles/global.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
