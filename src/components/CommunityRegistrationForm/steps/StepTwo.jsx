import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";

import "../../events/EventRegistrationForm/registrationForm.css";
import { TextInput } from "../../events/EventRegistrationForm/InputComponents/TextInput";
import { ImageUpload } from "../../events/EventRegistrationForm/InputComponents/ImageUpload";

const schema = yup.object().shape({
   founders: yup
      .array()
      .of(
         yup.object().shape({
            lastName: yup.string().required("Фамилия обязательна"),
            firstName: yup.string().required("Имя обязательно"),
            role: yup.string().required("Роль обязательна"),
            email: yup
               .string()
               .email("Неверный email")
               .required("Email обязателен"),
            social: yup.string().url("Неверный URL").notRequired(),
         })
      )
      .min(1, "Добавьте хотя бы одного основателя"),
   sponsors: yup
      .array()
      .of(
         yup.object().shape({
            organization: yup.string().required("Организация обязательна"),
            logo: yup.mixed().required("Логотип обязателен"),
         })
      )
      .min(1, "Добавьте хотя бы одного спонсора"),
   agree: yup.bool().oneOf([true], "Нужно согласие с правилами"),
   personal: yup.bool().oneOf([true], "Нужно согласие на обработку"),
});

export default function StepTwo({ formData = {}, setFormData, onNext }) {
   const navigate = useNavigate();
   const {
      register,
      control,
      handleSubmit,
      setValue,
      formState: { errors },
      getValues,
   } = useForm({
      resolver: yupResolver(schema),
      defaultValues: {
         founders:
            formData.founders?.length > 0
               ? formData.founders
               : [
                    {
                       lastName: "",
                       firstName: "",
                       role: "",
                       email: "",
                       social: "",
                    },
                 ],
         sponsors:
            formData.sponsors?.length > 0
               ? formData.sponsors
               : [{ organization: "", logo: null }],
         agree: formData.agree || false,
         personal: formData.personal || false,
      },
   });

   const {
      fields: founderFields,
      append: addFounder,
      remove: removeFounder,
   } = useFieldArray({ control, name: "founders" });

   const {
      fields: sponsorFields,
      append: addSponsor,
      remove: removeSponsor,
   } = useFieldArray({ control, name: "sponsors" });

   const handleLogoChange = (e, index) => {
      const file = e.target.files[0];
      if (!file) return;
      setValue(`sponsors.${index}.logo`, file, { shouldValidate: true });
   };

   const submit = (data) => {
      setFormData((prev) => ({ ...prev, ...data }));
      onNext(data);
   };

   const saveDraft = () => {
      localStorage.setItem("teamDraft", JSON.stringify(getValues()));
      navigate("/profile/events");
   };

   return (
      <div className="step-wrapper">
         <form className="step-form" onSubmit={handleSubmit(submit)}>
            <h2 className="form-section-title">Команда сообщества</h2>

            <div className="form-section">
               <h3 className="form-section-subtitle">Основатели сообщества</h3>

               <div className="tickets-container">
                  {founderFields.map((item, idx) => (
                     <div key={item.id} className="ticket-item">
                        <div className="ticket-header">
                           <span>Основатель {idx + 1}</span>
                           <button
                              type="button"
                              className="remove-ticket"
                              onClick={() => removeFounder(idx)}
                           >
                              ✕
                           </button>
                        </div>

                        <div className="ticket-fields">
                           <TextInput
                              id={`founders.${idx}.lastName`}
                              label="Фамилия"
                              placeholder="Иванов"
                              register={register}
                              error={errors.founders?.[idx]?.lastName}
                              required
                           />
                           <TextInput
                              id={`founders.${idx}.firstName`}
                              label="Имя"
                              placeholder="Иван"
                              register={register}
                              error={errors.founders?.[idx]?.firstName}
                              required
                           />
                           <TextInput
                              id={`founders.${idx}.role`}
                              label="Роль основателя"
                              placeholder="Лидер сообщества"
                              register={register}
                              error={errors.founders?.[idx]?.role}
                              required
                           />
                           <TextInput
                              id={`founders.${idx}.email`}
                              label="Email для обратной связи"
                              placeholder="ivanov_ivan@gmail.com"
                              register={register}
                              error={errors.founders?.[idx]?.email}
                              required
                              type="email"
                           />
                           <TextInput
                              id={`founders.${idx}.social`}
                              label="Социальная сеть"
                              placeholder="https://www.linkedin.com/in/ivan-ivanov/"
                              tooltip="Укажите ссылку на профиль"
                              register={register}
                              error={errors.founders?.[idx]?.social}
                           />
                        </div>
                     </div>
                  ))}
               </div>

               <button
                  type="button"
                  className="btn btn-outline btn-add"
                  onClick={() =>
                     addFounder({
                        lastName: "",
                        firstName: "",
                        role: "",
                        email: "",
                        social: "",
                     })
                  }
               >
                  + Добавить основателя
               </button>

               {errors.founders && (
                  <p className="error-message">{errors.founders.message}</p>
               )}
            </div>

            <div className="form-section">
               <h3 className="form-section-subtitle">Спонсоры сообщества</h3>

               <div className="tickets-container">
                  {sponsorFields.map((item, idx) => (
                     <div key={item.id} className="ticket-item">
                        <div className="ticket-header">
                           <span>Спонсор {idx + 1}</span>
                           <button
                              type="button"
                              className="remove-ticket"
                              onClick={() => removeSponsor(idx)}
                           >
                              ✕
                           </button>
                        </div>

                        <div className="ticket-fields">
                           <TextInput
                              id={`sponsors.${idx}.organization`}
                              label="Название организации"
                              placeholder="ОАО Альфабанк"
                              register={register}
                              error={errors.sponsors?.[idx]?.organization}
                              required
                           />

                           <ImageUpload
                              id={`sponsors.${idx}.logo`}
                              label="Логотип"
                              onChange={(e) => handleLogoChange(e, idx)}
                              error={errors.sponsors?.[idx]?.logo}
                              tooltip="PNG/JPG, до 10 Mb"
                              required
                           />
                        </div>
                     </div>
                  ))}
               </div>

               <button
                  type="button"
                  className="btn btn-outline btn-add"
                  onClick={() => addSponsor({ organization: "", logo: null })}
               >
                  + Добавить спонсора
               </button>

               {errors.sponsors && (
                  <p className="error-message">{errors.sponsors.message}</p>
               )}
            </div>

            {/* <div className="form-section">
               <label className="checkbox-label">
                  <input
                     type="checkbox"
                     {...register("agree")}
                     className="checkbox-input"
                  />
                  <span className="checkbox-custom" />Я ознакомился(-лась) и
                  согласен(-на) с{" "}
                  <a href="/rules" target="_blank" rel="noopener noreferrer">
                     Правилами и условиями использования сайта
                  </a>
                  . *
               </label>
               {errors.agree && (
                  <span className="error-message">{errors.agree.message}</span>
               )} */}

            {/* <label className="checkbox-label">
                  <input
                     type="checkbox"
                     {...register("personal")}
                     className="checkbox-input"
                  />
                  <span className="checkbox-custom" />Я даю согласие на
                  обработку моих персональных данных в соответствии с{" "}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer">
                     Политикой конфиденциальности
                  </a>
                  . *
               </label>
               {errors.personal && (
                  <span className="error-message">
                     {errors.personal.message}
                  </span>
               )} */}
            {/* </div> */}

            <div className="form-buttons">
               <button
                  type="button"
                  className="btn-saveAsDraft"
                  onClick={handleSubmit(saveDraft)}
               >
                  Сохранить как черновик
               </button>
               <button type="submit" className="btn-сontinue">
                  Опубликовать
               </button>
            </div>
         </form>
      </div>
   );
}
