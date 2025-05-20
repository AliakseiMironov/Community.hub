import React, { useEffect, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import CustomSelect from "../../common/CustomInputs/CustomSelect";
import TagsInput from "../../common/TagsInput/TagsInput";
import DateTimeField from "../../common/DateTimeField/DateTimeField";
import { useNotification } from "../../../context/NotificationContext";
import "../../events/EventRegistrationForm/registrationForm.css";
import { ImageUpload } from "../../events/EventRegistrationForm/InputComponents/ImageUpload";
import { TextInput } from "../../events/EventRegistrationForm/InputComponents/TextInput";
import {
   TextareaWithHelp,
   TextareaWithHint,
} from "../../events/EventRegistrationForm/InputComponents/TextareaWithHelp";
import { SelectionInput } from "../../events/EventRegistrationForm/InputComponents/SelectionInput";
import { SocialInput } from "../../events/EventRegistrationForm/InputComponents/SocialInput";
import {
   FacebookIcon,
   InstagramIcon,
   LinkedinIcon,
   TelegramIcon,
} from "../../events/EventRegistrationForm/InputComponents/SocialIcons";

const schema = yup.object().shape({
   communityEventName: yup
      .string()
      .required("Введите название сообщества")
      .max(100, "Название не должно превышать 100 символов"),

   communityDescription: yup
      .string()
      .required("Описание сообщества обязательно")
      .min(10, "Минимальная длина — 10 символов")
      .max(1000, "Максимальная длина — 1000 символов"),

   communityEventType: yup.string().notRequired(),

   tags: yup.array().of(yup.string()).notRequired(),

   logotipBanner: yup.mixed().notRequired(),
   cardBanner: yup.mixed().notRequired(),

   communityLocation: yup.string().notRequired(),

   contactEmail: yup
      .string()
      .transform((value, original) =>
         original.trim() === "" ? undefined : value
      )
      .email("Некорректный email")
      .notRequired(),
});

const categoryOptions = [
   "Бизнес-завтрак",
   "Митап",
   "Семинар",
   "Лекция",
   "Конференция",
   "Воркшоп",
   "Панельная дискуссия",
   "Нетворкинг",
   "Мастер-класс",
   "Хакатон",
   "Питч-сессия",
   "Круглый стол",
   "Тренинг",
];

const StepOne = ({ onNext, formData, setFormData }) => {
   const [cardPreview, setCardPreview] = useState(null);
   const [pagePreview, setPagePreview] = useState(null);
   const [cardFileName, setCardFileName] = useState("");
   const [pageFileName, setPageFileName] = useState("");
   const [logotipPreview, setLogotipPreview] = useState(null);
   const [logotipFileName, setLogotipFileName] = useState("");

   const navigate = useNavigate();
   const { showNotification } = useNotification();
   const {
      register,
      handleSubmit,
      setValue,
      setError,
      clearErrors,
      formState: { errors },
      watch,
      getValues,
   } = useForm({
      defaultValues: formData || {},
      resolver: yupResolver(schema),
   });

   // Проверяет размеры загруженного изображения
   const validateImageDimensions = (file, minWidth, minHeight, fieldName) => {
      console.log("Начало проверки размеров изображения:", {
         fieldName,
         minWidth,
         minHeight,
      });
      return new Promise((resolve) => {
         const img = new Image();
         const objectUrl = URL.createObjectURL(file);
         img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            console.log("Размеры изображения:", {
               width: img.width,
               height: img.height,
               required: `${minWidth}x${minHeight}`,
            });
            if (img.width < minWidth || img.height < minHeight) {
               const error = `Изображение должно быть не менее ${minWidth}x${minHeight} пикселей`;
               console.error("Ошибка размеров:", error);
               setError(fieldName, {
                  type: "manual",
                  message: error,
               });
               resolve(false);
            } else {
               console.log("Размеры изображения валидны");
               clearErrors(fieldName);
               resolve(true);
            }
         };
         img.onerror = () => {
            console.error(
               "Ошибка при загрузке изображения для проверки размеров"
            );
            resolve(false);
         };
         img.src = objectUrl;
      });
   };

   // Обрабатывает изменение изображения
   const handleImageChange = async (e, fieldName, setPreview) => {
      const file = e.target.files[0];
      console.log("Начало обработки файла:", {
         fieldName,
         fileName: file?.name,
         fileSize: file?.size,
      });

      if (!file) {
         console.log("Файл не выбран");
         return;
      }

      // Сохраняем имя файла
      if (fieldName === "logotipBanner") {
         setLogotipFileName(file.name);
      } else if (fieldName === "cardBanner") {
         setCardFileName(file.name);
      } else {
         setPageFileName(file.name);
      }

      // Проверка типа файла
      console.log("Тип файла:", file.type);
      if (!["image/jpeg", "image/png"].includes(file.type)) {
         const error = "Допустимы только файлы PNG и JPG";
         console.error("Ошибка типа файла:", error);
         setError(fieldName, {
            type: "manual",
            message: error,
         });
         return;
      }

      // Проверка размера файла
      const fileSizeMB = file.size / (1024 * 1024);
      console.log("Размер файла (MB):", fileSizeMB);
      if (file.size > 10 * 1024 * 1024) {
         // 10MB
         const error = "Размер файла не должен превышать 10MB";
         console.error("Ошибка размера файла:", error);
         setError(fieldName, {
            type: "manual",
            message: error,
         });
         return;
      }

      const minDimensions =
         fieldName === "cardBanner"
            ? { width: 420, height: 256 }
            : { width: 1300, height: 320 };

      try {
         console.log("Начало валидации размеров");
         const isValidDimensions = await validateImageDimensions(
            file,
            minDimensions.width,
            minDimensions.height,
            fieldName
         );

         if (isValidDimensions) {
            console.log("Начало конвертации в base64");
            const reader = new FileReader();
            reader.onload = () => {
               console.log("Файл успешно конвертирован в base64");
               const base64 = reader.result;
               setPreview(base64);
               setValue(fieldName, base64, { shouldValidate: true });
               clearErrors(fieldName);
               console.log("Превью установлено");
            };
            reader.onerror = (error) => {
               console.error("Ошибка при чтении файла:", error);
               setError(fieldName, {
                  type: "manual",
                  message: "Ошибка при чтении файла",
               });
            };
            reader.readAsDataURL(file);
         }
      } catch (error) {
         console.error("Ошибка при обработке изображения:", error);
         setError(fieldName, {
            type: "manual",
            message: "Ошибка при обработке изображения",
         });
      }
   };

   // Удаляет выбранное изображение
   const handleRemoveImage = (fieldName) => {
      if (fieldName === "cardBanner") {
         setCardPreview(null);
         setCardFileName("");
         setValue(fieldName, null);
      } else {
         setPagePreview(null);
         setPageFileName("");
         setValue(fieldName, null);
      }
   };

   useEffect(() => {
      if (formData) {
         Object.keys(formData).forEach((key) => {
            setValue(key, formData[key]);
         });
      }
   }, [formData, setValue]);

   useEffect(() => {
      if (formData) {
         if (formData.cardBanner) {
            setCardPreview(formData.cardBanner);
         }
         if (formData.pageBanner) {
            setPagePreview(formData.pageBanner);
         }
      }
   }, [formData]);

   // Обрабатывает перетаскивание файла
   const handleDrop = useCallback(
      async (e, fieldName) => {
         e.preventDefault();
         e.stopPropagation();

         const file = e.dataTransfer.files[0];
         console.log("Файл перетащен:", { fieldName, fileName: file?.name });
         if (file) {
            const setPreview =
               fieldName === "cardBanner" ? setCardPreview : setPagePreview;
            await handleImageChange(
               { target: { files: [file] } },
               fieldName,
               setPreview
            );
         }
      },
      [handleImageChange]
   );

   // Предотвращает стандартное поведение при перетаскивании
   const handleDragOver = useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
   }, []);

   const handleSaveDraft = async () => {
      const currentValues = getValues();
      const hasAnyData =
         currentValues.eventName ||
         currentValues.description ||
         currentValues.category ||
         currentValues.eventType ||
         currentValues.eventFormat ||
         (currentValues.tags && currentValues.tags.length > 0) ||
         currentValues.date ||
         currentValues.startTime ||
         currentValues.endTime ||
         currentValues.location ||
         currentValues.address ||
         currentValues.maxParticipants ||
         currentValues.cardBanner ||
         currentValues.pageBanner;

      if (!hasAnyData) {
         showNotification({
            type: "saveNoData",
            message:
               "Ни одно поле в форме не заполнено. Вы уверены, что хотите прекратить заполнение?",
            actions: [
               {
                  label: "Подтвердить",
                  type: "primary",
                  onClick: () => navigate("/profile/events"),
               },
               {
                  label: "Возобновить",
                  type: "secondary",
                  onClick: () => {},
               },
            ],
         });
         return;
      }

      try {
         const updatedFormData = {
            ...formData,
            ...currentValues,
            status: "draft",
            isDraft: true,
            lastSaved: new Date().toISOString(),
         };

         // Сохраняем в localStorage
         let savedEvents = JSON.parse(localStorage.getItem("events")) || [];
         if (formData.id) {
            savedEvents = savedEvents.map((e) =>
               e.id === formData.id ? updatedFormData : e
            );
         } else {
            const newEvent = { id: Date.now(), ...updatedFormData };
            savedEvents.push(newEvent);
         }
         localStorage.setItem("events", JSON.stringify(savedEvents));

         setFormData(updatedFormData);
         showNotification({
            type: "saveDraft",
            message:
               "Черновик мероприятия с внесенными данными успешно сохранен и будет отображен в личном кабинете в виде карточки, где вы можете управлять им.",
         });
         navigate("/profile/events");
      } catch (error) {
         console.error("Ошибка при сохранении черновика:", error);
         showNotification({
            type: "error",
            message:
               "Ошибка при сохранении черновика. Пожалуйста, попробуйте еще раз.",
         });
      }
   };

   const onSubmit = (data) => {
      if (Object.keys(errors).length > 0) {
         const errorMessages = Object.values(errors)
            .map((error) => error.message)
            .filter((message) => message)
            .join("\n");

         showNotification({
            type: "error",
            message: errorMessages,
         });
         console.log("fjvbekjvbkvbkbvke");

         return;
      }

      setFormData((prev) => ({
         ...prev,
         ...data,
      }));
      onNext(data);
   };

   const communityTypeOptions = [
      { value: "public", label: "Открытое" },
      { value: "private", label: "Закрытое" },
   ];

   const socialLinks = [
      {
         id: "linkedin",
         label: "LinkedIn",
         placeholder: "https://www.linkedin.com/in/ivan-ivanov/",
         icon: <LinkedinIcon />,
      },
      {
         id: "telegram",
         label: "Telegram",
         placeholder: "https://www.linkedin.com/in/ivan-ivanov/",
         icon: <TelegramIcon />,
      },
      {
         id: "facebook",
         label: "Facebook",
         placeholder: "https://www.linkedin.com/in/ivan-ivanov/",
         icon: <FacebookIcon />,
      },
      {
         id: "instagram",
         label: "Instagram",
         placeholder: "https://www.linkedin.com/in/ivan-ivanov/",
         icon: <InstagramIcon />,
      },
   ];

   const onValid = (data) => {
      console.log("валидно, переходим дальше", data);
      onNext(data);
   };

   const onInvalid = (formErrors) => {
      console.log("ошибки валидации:", formErrors);
      showNotification({
         type: "error",
         message: Object.values(formErrors)
            .map((e) => e.message)
            .join("\n"),
      });
   };

   return (
      <div className="step-wrapper">
         <form
            className="step-form"
            onSubmit={handleSubmit(onValid, onInvalid)}
         >
            <div className="form-section">
               <span className="form-section-title">Общая информация</span>
            </div>

            <div className="form-group">
               <ImageUpload
                  id="logotipBanner"
                  label="Логотип сообщества"
                  preview={logotipPreview}
                  fileName={logotipFileName}
                  error={errors.logotipBanner}
                  onChange={(e, id) =>
                     handleImageChange(e, id, setLogotipPreview)
                  }
                  onRemove={handleRemoveImage}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  // required
                  style={{ height: "170px" }}
               />

               <TextInput
                  id="communityEventName"
                  label="Название сообщества"
                  placeholder="Иванов"
                  register={register}
                  error={errors.communityEventName}
                  // required
               />
            </div>

            <TextareaWithHelp
               id="communityDescription"
               label="Описание сообщества"
               tooltip="Кратко опишите цели, концепцию, тематику и целевую аудиторию мероприятия."
               hint="0 из 1000 символов"
               register={register}
               error={errors.communityDescription}
               // required
            />

            <ImageUpload
               id="cardBanner"
               label="Баннер на странице сообщества"
               preview={cardPreview}
               fileName={cardFileName}
               error={errors.cardBanner}
               onChange={(e, id) => handleImageChange(e, id, setCardPreview)}
               onRemove={handleRemoveImage}
               onDrop={handleDrop}
               onDragOver={handleDragOver}
               // required
            />
            <div className="form-row">
               <div className="form-col">
                  <div className="form-group">
                     <TextInput
                        id="communityLocation"
                        label="Месторасположение сообщества"
                        placeholder="Минск"
                        register={register}
                        error={errors.communityLocation}
                        tooltip="Укажите город, которое будет являться местоположением вашего сообщества"
                        // required
                     />
                  </div>
               </div>
               <div className="form-col">
                  <div className="form-group">
                     <SelectionInput
                        id="communityEventType"
                        label="Формат сообщества"
                        options={communityTypeOptions}
                        value={watch("communityEventType")}
                        onChange={(value) =>
                           setValue("communityEventType", value, {
                              shouldValidate: true,
                           })
                        }
                        placeholder="Выберите формат сообщества"
                        error={errors.communityEventType}
                        tooltip="Выберите формат сообщества: онлайн, оффлайн или гибридный"
                        // required
                     />
                  </div>
               </div>
            </div>

            <div className="form-col">
               <div className="form-group">
                  <div className="label-with-icon">
                     <label
                        htmlFor="tags"
                        // required
                     >
                        Теги
                     </label>
                     <span
                        className="info-icon"
                        data-tooltip="Введите ключевые слова, которые отражают тематику вашего мероприятия. (например, Java, маркетинг, soft skills)"
                     >
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
                  </div>
               </div>
               <TagsInput
                  value={watch("tags") || []}
                  onChange={(tags) =>
                     setValue("tags", tags, { shouldValidate: true })
                  }
                  error={errors.tags}
               />
               {errors.tags && (
                  <span className="error-message">{errors.tags.message}</span>
               )}
            </div>
            <TextInput
               id="contactEmail"
               label="Контактный e-mail сообщества"
               placeholder="ivanov_ivan@gmail.com"
               register={register}
               error={errors.contactEmail}
               tooltip="Укажите контактный e-mail сообщества"
               // required
            />

            <div className="form-group">
               <label htmlFor={socialLinks[0].id}>Соцсети сообщества</label>
               {socialLinks.map(({ id, label, icon, placeholder }) => (
                  <SocialInput
                     key={id}
                     id={id}
                     label={label}
                     icon={icon}
                     placeholder={placeholder}
                     value={watch(id) || ""}
                     onChange={(id, val) =>
                        setValue(id, val, { shouldValidate: true })
                     }
                  />
               ))}
            </div>

            <div className="form-buttons">
               <button type="submit" className="btn-сontinue">
                  Продолжить
               </button>
               <button type="button" className="btn-saveAsDraft">
                  Сохранить как черновик
               </button>
            </div>
         </form>
      </div>
   );
};

export default StepOne;
