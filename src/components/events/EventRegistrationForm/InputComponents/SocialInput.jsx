import React from "react";

export const SocialInput = ({
   icon,
   label,
   id,
   placeholder,
   value,
   onChange,
}) => (
   <div className="social-input-row">
      <label htmlFor={id} className="social-label">
         <span className="social-icon">{icon}</span>
         <span className="label-text">{label}</span>
      </label>
      <input
         id={id}
         type="url"
         placeholder={placeholder}
         value={value}
         onChange={(e) => onChange(id, e.target.value)}
      />
   </div>
);
