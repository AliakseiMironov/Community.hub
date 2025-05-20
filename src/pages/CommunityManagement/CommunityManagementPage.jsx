import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../EventsManagement/EventsManagementPage.css";
import CommunityCard from "../../components/CommunityRegistrationForm/CommunityCard/CommunityCard";

const LS_KEY = "communities";

export default function CommunityManagementPage() {
   const navigate = useNavigate();
   const [communities, setCommunities] = useState([]);
   const [filters, setFilters] = useState([]);

   const sync = useCallback(() => {
      setCommunities(JSON.parse(localStorage.getItem(LS_KEY)) || []);
   }, []);

   useEffect(() => {
      sync();
      const h = (e) => e.key === LS_KEY && sync();
      window.addEventListener("storage", h);
      return () => window.removeEventListener("storage", h);
   }, [sync]);

   const save = (list) => {
      localStorage.setItem(LS_KEY, JSON.stringify(list));
      setCommunities(list);
   };

   const handleUpdate = (c) =>
      save(communities.map((x) => (x.id === c.id ? c : x)));
   const handleDelete = (id) => {
      if (!window.confirm("Удалить сообщество?")) return;
      save(communities.filter((c) => c.id !== id));
   };

   const toggle = (s) =>
      setFilters((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

   const shown =
      filters.length === 0
         ? communities
         : communities.filter((c) => filters.includes(c.status));

   return (
      <div className="events-management">
         <button
            className="create-event-btn"
            onClick={() => navigate("/register-community")}
         >
            <span className="icon-wrapper">
               <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                     d="M14 7C14 7.55 13.55 8 13 8H8V13C8 13.55 7.55 14 7 14C6.45 14 6 13.55 6 13V8H1C0.45 8 0 7.55 0 7C0 6.45 0.45 6 1 6H6V1C6 0.45 6.45 0 7 0C7.55 0 8 0.45 8 1V6H13C13.55 6 14 6.45 14 7Z"
                     fill="#202022"
                  />
               </svg>
            </span>
            Создать сообщество
         </button>

         {communities.length === 0 ? (
            <div className="empty-events">
               <p>
                  Здесь будут карточки сообществ, которые вы создадите.
                  Заполните форму «Создать сообщество» — и первый черновик
                  появится в списке.
               </p>
            </div>
         ) : (
            <div className="events-container">
               <div className="events-filters">
                  {["draft", "active", "hidden"].map((s) => (
                     <button
                        key={s}
                        className={`filter-btn ${filters.includes(s) ? "active" : ""}`}
                        onClick={() => toggle(s)}
                     >
                        {
                           {
                              draft: "Черновик",
                              active: "Активно",
                              hidden: "Скрыто",
                           }[s]
                        }
                     </button>
                  ))}
                  <button
                     className={`filter-btn ${filters.length === 0 ? "active" : ""}`}
                     onClick={() => setFilters([])}
                  >
                     Все
                  </button>
               </div>

               <div className="events-list">
                  {shown.map((c) => (
                     <div key={c.id} className="event-item">
                        <CommunityCard
                           community={c}
                           onUpdate={handleUpdate}
                           onDelete={handleDelete}
                        />
                     </div>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
}
