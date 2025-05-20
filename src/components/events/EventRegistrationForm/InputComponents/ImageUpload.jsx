import React from "react";

export const ImageUpload = ({
   id,
   label,
   error,
   preview,
   fileName,
   onChange,
   onRemove,
   onDrop,
   onDragOver,
   required = false,
   style = {},
}) => (
   <div className="form-group">
      <label htmlFor={id} {...(required && { required: true })}>
         {label}
      </label>
      <div
         className={`file-upload-area ${error ? "input-error" : ""}`}
         style={style}
         onClick={() => !preview && document.getElementById(id).click()}
         onDrop={(e) => onDrop(e, id)}
         onDragOver={onDragOver}
      >
         <input
            id={id}
            type="file"
            accept="image/png,image/jpeg"
            style={{ display: "none" }}
            onChange={(e) => onChange(e, id)}
         />
         {preview ? (
            <div className="file-upload-preview">
               <img
                  src={preview}
                  alt="Preview"
                  className="file-preview-image"
               />
               <div className="file-preview-info">
                  <span className="file-preview-name">{fileName}</span>
                  <button
                     type="button"
                     className="file-preview-remove"
                     onClick={(e) => {
                        e.stopPropagation();
                        onRemove(id);
                     }}
                  >
                     <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                     >
                        <path
                           d="M12.6667 4.27334L11.7267 3.33334L8.00001 7.06001L4.27334 3.33334L3.33334 4.27334L7.06001 8.00001L3.33334 11.7267L4.27334 12.6667L8.00001 8.94001L11.7267 12.6667L12.6667 11.7267L8.94001 8.00001L12.6667 4.27334Z"
                           fill="#C7C7CC"
                        />
                     </svg>
                  </button>
               </div>
            </div>
         ) : (
            <div className="file-upload-content">
               <span>Загрузить файл или перетащите сюда изображение</span>
               <span>PNG, JPG до 10Mb</span>
               <span>мин. формат 420x256 px</span>
            </div>
         )}
      </div>
      {error && <span className="error-message">{error.message}</span>}
   </div>
);
