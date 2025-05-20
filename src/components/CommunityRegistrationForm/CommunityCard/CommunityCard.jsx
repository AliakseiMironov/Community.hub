import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CommunityCard.css";

const GearIcon = () => (
   <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
         d="M11.9998 15.5C11.0716 15.5 10.1813 15.1313 9.52497 14.4749C8.86859 13.8185 8.49984 12.9283 8.49984 12C8.49984 11.0717 8.86859 10.1815 9.52497 9.52513C10.1813 8.86875 11.0716 8.5 11.9998 8.5C12.9281 8.5 13.8183 8.86875 14.4747 9.52513C15.1311 10.1815 15.4998 11.0717 15.4998 12C15.4998 12.9283 15.1311 13.8185 14.4747 14.4749C13.8183 15.1313 12.9281 15.5 11.9998 15.5ZM19.4298 12.97C19.4698 12.65 19.4998 12.33 19.4998 12C19.4998 11.67 19.4698 11.34 19.4298 11L21.5398 9.37C21.7298 9.22 21.7798 8.95 21.6598 8.73L19.6598 5.27C19.5398 5.05 19.2698 4.96 19.0498 5.05L16.5598 6.05C16.0398 5.66 15.4998 5.32 14.8698 5.07L14.4998 2.42C14.4795 2.30222 14.4182 2.19543 14.3267 2.11855C14.2351 2.04168 14.1194 1.99968 13.9998 2H9.99984C9.74984 2 9.53984 2.18 9.49984 2.42L9.12984 5.07C8.49984 5.32 7.95984 5.66 7.43984 6.05L4.94984 5.05C4.72984 4.96 4.45984 5.05 4.33984 5.27L2.33984 8.73C2.20984 8.95 2.26984 9.22 2.45984 9.37L4.56984 11C4.52984 11.34 4.49984 11.67 4.49984 12C4.49984 12.33 4.52984 12.65 4.56984 12.97L2.45984 14.63C2.26984 14.78 2.20984 15.05 2.33984 15.27L4.33984 18.73C4.45984 18.95 4.72984 19.03 4.94984 18.95L7.43984 17.94C7.95984 18.34 8.49984 18.68 9.12984 18.93L9.49984 21.58C9.53984 21.82 9.74984 22 9.99984 22H13.9998C14.2498 22 14.4598 21.82 14.4998 21.58L14.8698 18.93C15.4998 18.67 16.0398 18.34 16.5598 17.94L19.0498 18.95C19.2698 19.03 19.5398 18.95 19.6598 18.73L21.6598 15.27C21.7798 15.05 21.7298 14.78 21.5398 14.63L19.4298 12.97Z"
         fill="#202022"
      />
   </svg>
);

const LockOpen = () => (
   <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
      <path
         d="M16 0C13.24 0 11 2.24 11 5V7H2C1.46957 7 0.960859 7.21071 0.585786 7.58579C0.210714 7.96086 0 8.46957 0 9V19C0 19.5304 0.210714 20.0391 0.585786 20.4142C0.960859 20.7893 1.46957 21 2 21H14C15.11 21 16 20.11 16 19V9C16 8.46957 15.7893 7.96086 15.4142 7.58579C15.0391 7.21071 14.5304 7 14 7H13V5C13 3.34 14.34 2 16 2C17.66 2 19 3.34 19 5V7H21V5C21 2.24 18.76 0 16 0ZM8 12C8.53043 12 9.03914 12.2107 9.41421 12.5858C9.78929 12.9609 10 13.4696 10 14C10 15.11 9.11 16 8 16C7.46957 16 6.96086 15.7893 6.58579 15.4142C6.21071 15.0391 6 14.5304 6 14C6 13.4696 6.21071 12.9609 6.58579 12.5858C6.96086 12.2107 7.46957 12 8 12Z"
         fill="#000"
      />
   </svg>
);

const LockClosed = () => (
   <svg width="16" height="21" viewBox="0 0 16 21" fill="none">
      <path
         d="M8 16C8.53043 16 9.03914 15.7893 9.41421 15.4142C9.78929 15.0391 10 14.5304 10 14C10 13.4696 9.78929 12.9609 9.41421 12.5858C9.03914 12.2107 8.53043 12 8 12C7.46957 12 6.96086 12.2107 6.58579 12.5858C6.21071 12.9609 6 13.4696 6 14C6 14.5304 6.21071 15.0391 6.58579 15.4142C6.96086 15.7893 7.46957 16 8 16ZM14 7C14.5304 7 15.0391 7.21071 15.4142 7.58579C15.7893 7.96086 16 8.46957 16 9V19C16 19.5304 15.7893 20.0391 15.4142 20.4142C15.0391 20.7893 14.5304 21 14 21H2C1.46957 21 0.960859 20.7893 0.585786 20.4142C0.210714 20.0391 0 19.5304 0 19V9C0 8.46957 0.210714 7.96086 0.585786 7.58579C0.960859 7.21071 1.46957 7 2 7H3V5C3 3.67392 3.52678 2.40215 4.46447 1.46447C5.40215 0.526784 6.67392 0 8 0C8.65661 0 9.30679 0.129329 9.91342 0.380602C10.52 0.631876 11.0712 1.00017 11.5355 1.46447C11.9998 1.92876 12.3681 2.47995 12.6194 3.08658C12.8707 3.69321 13 4.34339 13 5V7H14ZM8 2C7.20435 2 6.44129 2.31607 5.87868 2.87868C5.31607 3.44129 5 4.20435 5 5V7H11V5C11 4.20435 10.6839 3.44129 10.1213 2.87868C9.55871 2.31607 8.79565 2 8 2Z"
         fill="#000"
      />
   </svg>
);

const statusRU = { draft: "Черновик", active: "Активно", hidden: "Скрыто" };

export default function CommunityCard({ community, onUpdate, onDelete }) {
   const nav = useNavigate();
   const [open, setOpen] = useState(false);
   const menuRef = useRef(null);

   useEffect(() => {
      const h = (e) => !menuRef.current?.contains(e.target) && setOpen(false);
      document.addEventListener("mousedown", h);
      return () => document.removeEventListener("mousedown", h);
   }, []);

   /* замочек по типу сообщества */
   const Lock =
      community.communityEventType === "public" ? LockOpen : LockClosed;

   /* быстрые переходы статуса */
   const publish = () => onUpdate?.({ ...community, status: "active" });
   const hide = () => onUpdate?.({ ...community, status: "hidden" });
   const toDraft = () => onUpdate?.({ ...community, status: "draft" });

   return (
      <div className="ccard" onClick={() => nav(`/community/${community.id}`)}>
         {/* бейдж + замок */}
         <div className="ccard-badge">
            <span className="status">
               {statusRU[community.status] || "Черновик"}
            </span>
            <span className="lock">
               <Lock />
            </span>
         </div>
         {/* шестерёнка */}
         <button
            className="gear"
            onClick={(e) => {
               e.stopPropagation();
               setOpen((p) => !p);
            }}
         >
            <GearIcon />
         </button>
         {open && (
            <div
               className="menu"
               ref={menuRef}
               onClick={(e) => e.stopPropagation()}
            >
               {community.status === "draft" && (
                  <button onClick={publish}>Опубликовать</button>
               )}
               {community.status === "active" && (
                  <button onClick={hide}>Скрыть</button>
               )}
               {community.status === "hidden" && (
                  <button onClick={publish}>Опубликовать</button>
               )}
               {community.status !== "draft" && (
                  <button onClick={toDraft}>Вернуть в черновики</button>
               )}
               <button
                  onClick={() => nav(`/register-community/${community.id}`)}
               >
                  Редактировать
               </button>
               <button onClick={() => onDelete?.(community.id)}>Удалить</button>
            </div>
         )}
         <div className="logo">
            {community.logotipBanner ? (
               <img src={community.logotipBanner} alt="логотип" />
            ) : (
               <span className="ph">
                  {community.communityEventName?.[0] || "C"}
               </span>
            )}
         </div>
         <h3>{community.communityEventName}</h3>
         <p>
            {community.communityDescription?.trim()
               ? community.communityDescription
               : "Нет описания"}
         </p>{" "}
      </div>
   );
}
