import React from "react";
import { TextInput } from "../../../../events/EventRegistrationForm/InputComponents/TextInput";
import { SocialInput } from "../../../../events/EventRegistrationForm/InputComponents/SocialInput";

export default function FounderFields({
   nestIndex,
   control,
   register,
   errors,
   remove,
}) {
   return (
      <div className="founder-block">
         <div className="founder-header">
            <h4>Основатель {nestIndex + 1}</h4>
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
               id={`founders[${nestIndex}].lastName`}
               label="Фамилия *"
               register={register}
               name={`founders[${nestIndex}].lastName`}
               error={errors?.founders?.[nestIndex]?.lastName}
            />
            <TextInput
               id={`founders[${nestIndex}].firstName`}
               label="Имя *"
               register={register}
               name={`founders[${nestIndex}].firstName`}
               error={errors?.founders?.[nestIndex]?.firstName}
            />
         </div>
         <div className="form-row">
            <TextInput
               id={`founders[${nestIndex}].role`}
               label="Роль основателя *"
               register={register}
               name={`founders[${nestIndex}].role`}
               error={errors?.founders?.[nestIndex]?.role}
            />
            <SocialInput
               id={`founders[${nestIndex}].social`}
               label="Социальная сеть"
               register={register}
               name={`founders[${nestIndex}].social`}
               error={errors?.founders?.[nestIndex]?.social}
            />
         </div>
         <TextInput
            id={`founders[${nestIndex}].email`}
            label="E-mail для обратной связи *"
            register={register}
            name={`founders[${nestIndex}].email`}
            error={errors?.founders?.[nestIndex]?.email}
         />
      </div>
   );
}
