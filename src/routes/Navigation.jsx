import React from "react";
import {
   BrowserRouter as Router,
   Routes,
   Route,
   Navigate,
} from "react-router-dom";
import Layout from "../components/Layout/top_down_layout/Layout";
import Home from "../pages/Home/Home";
import Login from "../components/auth/forms/Login";
import Signup from "../components/auth/forms/SignupForm";
import ForgotPasswordForm from "../components/auth/forms/ForgotPasswordForm";
import RecoveryPasswordForm from "../components/auth/forms/RecoveryPasswordForm";
import ProfilePage from "../pages/Profile/ProfilePage";
import EventRegistration from "../components/events/EventRegistrationForm/EventRegistration";
import CommunityRegistration from "../components/CommunityRegistrationForm/CommunityRegistration";

import ProtectedRoute from "../components/ProtectedRoute";
import Calendar from "../pages/Calendar/Calendar";
import Community from "../pages/Community/Community";
import Blog from "../pages/Blog/Blog";
import About from "../pages/About/About";
import Contacts from "../pages/Contacts/Contacts";
import { NotificationProvider } from "../context/NotificationContext";
import EventsManagementPage from "../pages/EventsManagement/EventsManagementPage";
import CommunityManagementPage from "../pages/CommunityManagement/CommunityManagementPage";

const EmptySection = ({ text }) => (
   <div className="empty-section">
      <p>{text}</p>
   </div>
);

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
                  <Route
                     path="/profile"
                     element={
                        <ProtectedRoute>
                           <ProfilePage />
                        </ProtectedRoute>
                     }
                  >
                     <Route
                        index
                        element={<EmptySection text="Мой профиль (заглушка)" />}
                     />
                     <Route path="events" element={<EventsManagementPage />} />
                     <Route
                        path="community"
                        element={<CommunityManagementPage />}
                     />
                     <Route
                        path="notifications"
                        element={<EmptySection text="Уведомления (заглушка)" />}
                     />
                     <Route
                        path="settings"
                        element={<EmptySection text="Настройки (заглушка)" />}
                     />
                  </Route>

                  <Route
                     path="/register-event"
                     element={
                        <ProtectedRoute>
                           <EventRegistration />
                        </ProtectedRoute>
                     }
                  />
                  <Route
                     path="/register-event/:id"
                     element={
                        <ProtectedRoute>
                           <EventRegistration />
                        </ProtectedRoute>
                     }
                  />
                  <Route
                     path="/events-management"
                     element={
                        <ProtectedRoute>
                           <EventsManagementPage />
                        </ProtectedRoute>
                     }
                  />
               </Route>

               <Route
                  path="/register-community"
                  element={
                     <ProtectedRoute>
                        <CommunityRegistration />
                     </ProtectedRoute>
                  }
               />

               <Route path="*" element={<Navigate to="/" />} />
            </Routes>
         </Router>
      </NotificationProvider>
   );
};

export default Navigation;
