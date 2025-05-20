import React, { useState } from "react";
import clsx from "clsx";

export const ImageUpload = ({
   id,
   label,
   error,
   preview: externalPreview,
   fileName: externalFileName,
   onChange,
   onRemove,
   onDrop,
   onDragOver,
   size = "1440*300",
   required = false,
   style = {},
   variant = "default",
}) => {
   const [fileName, setFileName] = useState(externalFileName || "");
   const [preview, setPreview] = useState(externalPreview || "");

   const isLogo = variant === "logo";
   const hasFile = !!fileName;
   const showPrev = !isLogo && preview;

   const handleLocalChange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setFileName(file.name);

      if (!isLogo) {
         const reader = new FileReader();
         reader.onload = () => setPreview(reader.result);
         reader.readAsDataURL(file);
      }

      onChange?.(e, id);

      e.target.value = "";
   };

   const renderPlaceholder = () =>
      isLogo ? (
         <span className="placeholder">Загрузить файл</span>
      ) : (
         <>
            <span>Загрузить файл или перетащите сюда изображение</span>
            <span>PNG, JPG до&nbsp;10&nbsp;Mb</span>
            {/* !!!WEIGHT!!! */}
            <span>мин. формат {size} px</span>
         </>
      );

   return (
      <div className="form-group">
         <label htmlFor={id} {...(required && { required: true })}>
            {label}
         </label>

         <div
            className={clsx(
               "file-upload-area",
               variant,
               error && "input-error"
            )}
            style={style}
            onClick={() => document.getElementById(id)?.click()}
            onDrop={(e) => onDrop?.(e, id)}
            onDragOver={onDragOver}
         >
            <input
               id={id}
               type="file"
               accept="image/png,image/jpeg"
               style={{ display: "none" }}
               onChange={handleLocalChange}
            />

            {isLogo ? (
               <div className="file-upload-content" style={{ padding: 0 }}>
                  {hasFile ? (
                     <span style={{ color: "#202022", fontWeight: 500 }}>
                        {fileName}
                     </span>
                  ) : (
                     renderPlaceholder()
                  )}
               </div>
            ) : showPrev ? (
               <div className="file-upload-preview">
                  <img src={preview} alt="" className="file-preview-image" />
                  <div className="file-preview-info">
                     <span className="file-preview-name">{fileName}</span>
                     <button
                        type="button"
                        className="file-preview-remove"
                        onClick={(e) => {
                           e.stopPropagation();
                           onRemove?.(id);
                           setFileName("");
                           setPreview("");
                        }}
                     >
                        <svg
                           width="16"
                           height="16"
                           viewBox="0 0 16 16"
                           fill="none"
                        >
                           <path
                              d="M12.67 4.27 11.73 3.33 8 7.06 4.27 3.33 3.33 4.27 7.06 8 3.33 11.73 4.27 12.67 8 8.94 11.73 12.67 12.67 11.73 8.94 8l3.73-3.73Z"
                              fill="#C7C7CC"
                           />
                        </svg>
                     </button>
                  </div>
               </div>
            ) : (
               <div className="file-upload-content">{renderPlaceholder()}</div>
            )}
         </div>

         {error && <span className="error-message">{error.message}</span>}
      </div>
   );
};
