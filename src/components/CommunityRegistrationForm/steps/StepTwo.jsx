import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../context/NotificationContext";

import "../../events/EventRegistrationForm/registrationForm.css";
import { TextInput } from "../../events/EventRegistrationForm/InputComponents/TextInput";
import { ImageUpload } from "../../events/EventRegistrationForm/InputComponents/ImageUpload";
import AddButton from "../../events/EventRegistrationForm/common/AddButton";

const LS_KEY = "communities";

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
   const { showNotification } = useNotification();

   const navigate = useNavigate();

   const {
      register,
      control,
      handleSubmit,
      setValue,
      watch,
      formState: { errors },
      getValues,
   } = useForm({
      resolver: yupResolver(schema),
      defaultValues: {
         founders: formData.founders?.length
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
         sponsors: formData.sponsors?.length
            ? formData.sponsors
            : [{ organization: "", logo: null }],
         agree: !!formData.agree,
         personal: !!formData.personal,
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

   const handleLogoChange = (e, idx) => {
      const file = e.target.files?.[0];
      if (file)
         setValue(`sponsors.${idx}.logo`, file, { shouldValidate: true });
   };

   const submit = (data) => {
      const payload = { ...formData, ...data, status: "active" };

      setFormData(payload);
      onNext(payload);
   };

   const saveDraft = () => {
      const data = getValues(undefined, { nest: true });

      const draft = {
         ...formData,
         ...data,
         status: "draft",
         lastSaved: new Date().toISOString(),
      };

      let list = JSON.parse(localStorage.getItem(LS_KEY)) || [];
      draft.id
         ? (list = list.map((c) => (c.id === draft.id ? draft : c)))
         : list.push({ ...draft, id: Date.now() });
      localStorage.setItem(LS_KEY, JSON.stringify(list));

      setFormData(draft);
      showNotification("success", "Черновик сохранён");
      navigate("/profile/community");
   };

   // const publish = (data) => {
   //    onNext({ ...formData, ...data, status: "active" });
   // };

   return (
      <div className="step-wrapper">
         <form className="step-form" onSubmit={handleSubmit(submit)}>
            <div className="step-form-with-form">
               <h2 className="form-section-title">Команда сообщества</h2>

               <div className="form-section">
                  <span className="form-section-subtitle">
                     Основатели сообщества
                  </span>

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
                                 type="email"
                                 register={register}
                                 error={errors.founders?.[idx]?.email}
                                 required
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
                  <div className="form-col">
                     <AddButton
                        label="Добавить основателя"
                        onClick={() =>
                           addFounder({
                              lastName: "",
                              firstName: "",
                              role: "",
                              email: "",
                              social: "",
                           })
                        }
                     />
                  </div>

                  {errors.founders && (
                     <p className="error-message">{errors.founders.message}</p>
                  )}
               </div>

               <div className="upper-slump ">
                  <div className="form-section">
                     <h3 className="form-section-subtitle">
                        Спонсоры сообщества
                     </h3>

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

                              <div className="form-row">
                                 <div className="form-col">
                                    <TextInput
                                       id={`sponsors.${idx}.organization`}
                                       label="Название организации"
                                       placeholder="ОАО Альфабанк"
                                       register={register}
                                       error={
                                          errors.sponsors?.[idx]?.organization
                                       }
                                       required
                                    />
                                 </div>

                                 <div className="form-col">
                                    <ImageUpload
                                       id={`sponsors.${idx}.logo`}
                                       label="Логотип"
                                       tooltip="PNG/JPG, до 10 Mb"
                                       required
                                       variant="logo"
                                       fileName={
                                          watch(`sponsors.${idx}.logo`)?.name ||
                                          ""
                                       }
                                       onChange={(e) =>
                                          handleLogoChange(e, idx)
                                       }
                                       onRemove={(id) =>
                                          setValue(id, null, {
                                             shouldValidate: true,
                                          })
                                       }
                                       error={errors.sponsors?.[idx]?.logo}
                                    />
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>

                     <div className="form-col">
                        {" "}
                        <AddButton
                           label="Добавить спонсора"
                           onClick={() =>
                              addSponsor({ organization: "", logo: null })
                           }
                        />
                     </div>

                     {errors.sponsors && (
                        <p className="error-message">
                           {errors.sponsors.message}
                        </p>
                     )}
                  </div>
               </div>

               <div className="upper-slump ">
                  {/* Соглашения */}
                  <div className="form-section">
                     <div className="form-group">
                        <label className="checkbox-label">
                           <input
                              type="checkbox"
                              {...register("agree")}
                              className={errors.agree ? "input-error" : ""}
                           />
                           <span>
                              Я ознакомился(-лась) и согласен(-на) с{" "}
                              <a href="/terms">Правилами и условиями</a>. *
                           </span>
                        </label>
                        {errors.agree && (
                           <span className="error-message">
                              {errors.agree?.message}
                           </span>
                        )}
                     </div>

                     <div className="form-group">
                        <label className="checkbox-label">
                           <input
                              type="checkbox"
                              {...register("personal")}
                              className={errors.personal ? "input-error" : ""}
                           />
                           <span>
                              Я даю согласие на обработку моих персональных
                              данных согласно{" "}
                              <a href="/privacy">Политике конфиденциальности</a>
                              . *
                           </span>
                        </label>
                        {errors.personal && (
                           <span className="error-message">
                              {errors.personal?.message}
                           </span>
                        )}
                     </div>

                     <p className="form-hint">
                        * Поля, помеченные звездочкой, обязательны для
                        заполнения.
                     </p>
                  </div>
               </div>
            </div>

            <div className="form-buttons">
               <button
                  type="button"
                  className="btn-saveAsDraft"
                  onClick={saveDraft}
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
