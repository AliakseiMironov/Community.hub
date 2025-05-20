import React from "react";

export const TextareaWithHelp = ({
   id,
   label,
   hint,
   tooltip,
   register,
   error,
   required = false,
}) => (
   <div className="form-group">
      <div className="label-with-icon">
         <label htmlFor={id} {...(required && { required: true })}>
            {label}
         </label>
         {tooltip && (
            <span className="info-icon" data-tooltip={tooltip}>
               <svg
                  width="16"
                  height="16"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
               >
                  <path
                     d="M8.16602 6.49996H9.83268V4.83329H8.16602M8.99935 15.6666C5.32435 15.6666 2.33268 12.675 2.33268 8.99996C2.33268 5.32496 5.32435 2.33329 8.99935 2.33329C12.6743 2.33329 15.666 5.32496 15.666 8.99996C15.666 12.675 12.6743 15.6666 8.99935 15.6666ZM8.99935 0.666626C7.905 0.666626 6.82137 0.882174 5.81032 1.30096C4.79927 1.71975 3.88061 2.33358 3.10679 3.1074C1.54399 4.67021 0.666016 6.78982 0.666016 8.99996C0.666016 11.2101 1.54399 13.3297 3.10679 14.8925C3.88061 15.6663 4.79927 16.2802 5.81032 16.699C6.82137 17.1177 7.905 17.3333 8.99935 17.3333C11.2095 17.3333 13.3291 16.4553 14.8919 14.8925C16.4547 13.3297 17.3327 11.2101 17.3327 8.99996C17.3327 7.90561 17.1171 6.82198 16.6983 5.81093C16.2796 4.79988 15.6657 3.88122 14.8919 3.1074C14.1181 2.33358 13.1994 1.71975 12.1884 1.30096C11.1773 0.882174 10.0937 0.666626 8.99935 0.666626ZM8.16602 13.1666H9.83268V8.16663H8.16602V13.1666Z"
                     fill="#202022"
                     fillOpacity="0.8"
                  />
               </svg>
            </span>
         )}
      </div>
      <textarea
         id={id}
         className={error ? "input-error" : ""}
         {...register(id)}
      />
      {hint && <span className="hint">{hint}</span>}

      {error && <span className="error-message">{error.message}</span>}
   </div>
);
