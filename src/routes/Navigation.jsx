import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/SignupForm";
import ForgotPasswordForm from "../pages/ForgotPasswordForm";
import RecoveryPasswordForm from "../pages/RecoveryPasswordForm";
import ProfilePage from "../pages/ProfilePage";
import EventRegistration from "../pages/EventRegistration";
import ProtectedRoute from "../components/ProtectedRoute";
import Calendar from "../pages/Calendar";
import Community from "../pages/Community";
import Blog from "../pages/Blog";
import About from "../pages/About";
import Contacts from "../pages/Contacts";
import { NotificationProvider } from "../context/NotificationContext";
import EventsManagementPage from "../pages/EventsManagementPage";

const EmptySection = ({ text }) => <div className="empty-section"><p>{text}</p></div>;

const Navigation = () => {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Страницы без Header */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<ForgotPasswordForm />} />
          <Route path="/recovery" element={<RecoveryPasswordForm />} />

          {/* Страницы с Header (обернуты в Layout) */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/community" element={<Community />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/about" element={<About />} />
            <Route path="/contacts" element={<Contacts />} />

            {/* Личный кабинет с вложенными маршрутами */}
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}>
              <Route index element={<EmptySection text="Мой профиль (заглушка)" />} />
              <Route path="events" element={<EventsManagementPage />} />
              <Route path="community" element={<EmptySection text="Управление сообществом (заглушка)" />} />
              <Route path="notifications" element={<EmptySection text="Уведомления (заглушка)" />} />
              <Route path="settings" element={<EmptySection text="Настройки (заглушка)" />} />
            </Route>

            <Route path="/register-event" element={<ProtectedRoute><EventRegistration /></ProtectedRoute>} />
            <Route path="/register-event/:id" element={<ProtectedRoute><EventRegistration /></ProtectedRoute>} />
            <Route path="/events-management" element={<ProtectedRoute><EventsManagementPage /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
};

export default Navigation;