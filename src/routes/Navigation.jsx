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
import { NotificationProvider } from "../context/NotificationContext";

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
          
          {/* Личный кабинет с вложенными маршрутами */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}>
            <Route index element={<EmptySection />} />
            <Route path="events" element={<EmptySection />} />
            <Route path="community" element={<EmptySection />} />
            <Route path="notifications" element={<EmptySection />} />
            <Route path="settings" element={<EmptySection  />} />
          </Route>

          <Route path="/register-event" element={<ProtectedRoute><EventRegistration /></ProtectedRoute>} />
          <Route path="/register-event/:id" element={<ProtectedRoute><EventRegistration /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
    </NotificationProvider>
  );
};

export default Navigation;