import React from "react";
import { TextInput } from "../../../events/EventRegistrationForm/InputComponents/TextInput";
import { ImageUpload } from "../../../events/EventRegistrationForm/InputComponents/ImageUpload";

export default function SponsorFields({
   nestIndex,
   control,
   register,
   errors,
   remove,
}) {
   return (
      <div className="sponsor-block">
         <div className="founder-header">
            <h4>Спонсор {nestIndex + 1}</h4>
            {nestIndex > 0 && (
               <button
                  type="button"
                  className="btn-remove"
                  onClick={() => remove(nestIndex)}
               >
                  ×
               </button>
            )}
         </div>
         <div className="form-row">
            <TextInput
               id={`sponsors[${nestIndex}].organization`}
               label="Название организации *"
               register={register}
               name={`sponsors[${nestIndex}].organization`}
               error={errors?.sponsors?.[nestIndex]?.organization}
            />
            <ImageUpload
               id={`sponsors[${nestIndex}].logo`}
               label="Логотип *"
               register={register}
               name={`sponsors[${nestIndex}].logo`}
               error={errors?.sponsors?.[nestIndex]?.logo}
            />
         </div>
      </div>
   );
}
