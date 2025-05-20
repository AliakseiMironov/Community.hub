import React from "react";

export default function CheckboxField({ id, label, register, error }) {
   return (
      <div className="checkbox-row">
         <input type="checkbox" id={id} {...register(id, { required: true })} />
         <label htmlFor={id}>{label}</label>
         {error && <span className="error-message">Это поле обязательно</span>}
      </div>
   );
}
