import React, { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../../context/NotificationContext";
import CustomSelect from "../../../common/CustomInputs/CustomSelect";
import "../../EventRegistrationForm/registrationForm.css";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

// Импорт изображений шаблонов
import template1 from "../../../../images/template1.png";
import template2 from "../../../../images/template2.png";
import template3 from "../../../../images/template5.png";
import template4 from "../../../../images/template6.png";

const schema = yup.object().shape({
  status: yup.string().required("Выберите статус мероприятия"),
  maxParticipants: yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .test('participants-format', 'Количество участников должно быть числом', function(value) {
      if (!value) return true;
      return !isNaN(value) && value > 0;
    }),
  price: yup.number()
    .when('status', {
      is: 'paid',
      then: (schema) => schema
        .required("Укажите цену билета")
        .min(0, "Цена не может быть отрицательной")
        .typeError("Цена должна быть числом")
    }),
  kassaLink: yup.string()
    .when('status', {
      is: 'paid',
      then: (schema) => schema
        .required("Укажите ссылку на кассу")
        .url("Введите корректную ссылку")
    }),
  tickets: yup.array().of(
    yup.object().shape({
      name: yup.string().required("Введите название билета"),
      description: yup.string().required("Введите описание билета"),
      descriptionPoints: yup.array().of(yup.string().required("Пункт описания не может быть пустым")),
      price: yup.number()
        .when('status', {
          is: 'paid',
          then: (schema) => schema
            .required("Укажите цену билета")
            .min(0, "Цена не может быть отрицательной")
            .typeError("Цена должна быть числом")
        })
    })
  )
});

const TEMPLATES = [
  { id: 1, image: template1 },
  { id: 2, image: template2 },
  { id: 3, image: template3 },
  { id: 4, image: template4 }
];

const StepThree = ({ onNext, onBack, formData, setFormData }) => {
  const [activeTicketMenu, setActiveTicketMenu] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    getValues,
    setValue,
    trigger,
    formState
  } = useForm({
    defaultValues: formData || { 
      tickets: []
    },
    resolver: yupResolver(schema)
  });

  const { fields: tickets, append, remove } = useFieldArray({
    control,
    name: "tickets"
  });

  const watchAllFields = watch();

  // Обработка нажатия Enter в поле описания
  const handleDescriptionKeyDown = (event, ticketIndex) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const currentValues = getValues();
      const currentPoints = currentValues.tickets[ticketIndex].descriptionPoints || [];
      const newPoint = event.target.value.trim();
      
      if (newPoint) {
        setValue(`tickets.${ticketIndex}.descriptionPoints`, [...currentPoints, newPoint]);
        setValue(`tickets.${ticketIndex}.description`, '');
      }
    }
  };

  // Удаление пункта описания
  const removeDescriptionPoint = (ticketIndex, pointIndex) => {
    const currentValues = getValues();
    const currentPoints = [...currentValues.tickets[ticketIndex].descriptionPoints];
    currentPoints.splice(pointIndex, 1);
    setValue(`tickets.${ticketIndex}.descriptionPoints`, currentPoints);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveTicketMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (formData?.tickets) {
      formData.tickets.forEach((ticket, index) => {
        Object.keys(ticket).forEach(key => {
          setValue(`tickets.${index}.${key}`, ticket[key], { shouldValidate: true });
        });
      });
    }
  }, [formData, setValue]);

  // Обработчик изменения статуса
  const handleStatusChange = (value) => {
    setValue("status", value, { shouldValidate: true });
    
    // Если билетов нет, создаем первый билет
    if (tickets.length === 0) {
      const newTicket = {
        name: "",
        description: "",
        descriptionPoints: [],
        template: "",
        ...(value === "paid" ? {
          price: "",
          kassaLink: ""
        } : {})
      };
      append(newTicket);
    }
  };

  // Обработчик добавления нового билета
  const addTicket = () => {
    const status = watch("status");
    const newTicket = {
      name: "",
      description: "",
      descriptionPoints: [],
      template: "",
      ...(status === "paid" ? {
        price: "",
        kassaLink: ""
      } : {})
    };
    append(newTicket);
  };

  const handleSaveDraft = async () => {
    try {
      const currentValues = getValues();
      
      const hasFilledFields = currentValues.tickets?.some(ticket => 
        Object.values(ticket).some(value => value !== null && value !== '')
      );

      if (!hasFilledFields) {
        showNotification({
          type: 'warning',
          message: 'Ни одно поле в форме не заполнено. Вы уверены, что хотите прекратить заполнение?',
          actions: [
            {
              label: 'Подтвердить',
              onClick: () => navigate('/profile/events')
            },
            {
              label: 'Возобновить',
              onClick: () => {}
            }
          ]
        });
        return;
      }

      const updatedFormData = {
        ...formData,
        ...currentValues,
        status: "draft",
        isDraft: true,
        lastSaved: new Date().toISOString()
      };

      let savedEvents = JSON.parse(localStorage.getItem("events")) || [];
      if (formData.id) {
        savedEvents = savedEvents.map(e => e.id === formData.id ? updatedFormData : e);
      } else {
        savedEvents.push({ id: Date.now(), ...updatedFormData });
      }
      localStorage.setItem("events", JSON.stringify(savedEvents));

      setFormData(updatedFormData);
      
      showNotification('saveDraft', 'Черновик мероприятия успешно сохранен и будет отображен в личном кабинете в виде карточки, где вы можете управлять им.');
      navigate('/profile/events');
    } catch (error) {
      console.error('Ошибка при сохранении черновика:', error);
      showNotification({
        type: 'error',
        message: 'Ошибка при сохранении черновика'
      });
    }
  };

  const onSubmit = async (data) => {
    try {
      const isValid = await trigger();
      
      if (!isValid) {
        const errorMessages = [];
        Object.entries(formState.errors).forEach(([field, error]) => {
          if (error?.message) {
            errorMessages.push(error.message);
          }
        });

        if (errorMessages.length > 0) {
          showNotification({
            type: 'error',
            message: errorMessages.join('\n')
          });
          return;
        }
      }

      onNext(data);
    } catch (error) {
      console.error('Ошибка при отправке формы:', error);
      showNotification({
        type: 'error',
        message: 'Произошла ошибка при отправке формы'
      });
    }
  };

  return (
    <div className="step-wrapper">
      <form className="step-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-section-title">
          <span className="form-section-title-text">Билеты мероприятия</span>
        </div>
        <span className="form-section-subtitle">
            Community.hub реализует продажу билета через платформу bezkassira.by. 
            Разместите билет на этой платформе и добавьте ссылку в данную форму.
          </span>

        <div className="form-section">
          <div className="form-row">
            <div className="form-col">
              <div className="form-group">
                <label htmlFor="status" required>Статус мероприятия</label>
                <CustomSelect
                  options={[
                    { value: "paid", label: "Платное" },
                    { value: "free", label: "Бесплатное" }
                  ]}
                  value={watch("status")}
                  onChange={handleStatusChange}
                  placeholder="Выберите статус мероприятия"
                  error={errors.status}
                />
                {errors.status && <span className="error-message">{errors.status.message}</span>}
              </div>
            </div>

            <div className="form-col">
              <div className="form-group">
                <div className="label-with-icon">
                  <label htmlFor="maxParticipants">Количество участников</label>
                  <span className="info-icon" data-tooltip="Укажите максимальное количество участников, которые могут зарегистрироваться на мероприятие">
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.16602 6.49996H9.83268V4.83329H8.16602M8.99935 15.6666C5.32435 15.6666 2.33268 12.675 2.33268 8.99996C2.33268 5.32496 5.32435 2.33329 8.99935 2.33329C12.6743 2.33329 15.666 5.32496 15.666 8.99996C15.666 12.675 12.6743 15.6666 8.99935 15.6666ZM8.99935 0.666626C7.905 0.666626 6.82137 0.882174 5.81032 1.30096C4.79927 1.71975 3.88061 2.33358 3.10679 3.1074C1.54399 4.67021 0.666016 6.78982 0.666016 8.99996C0.666016 11.2101 1.54399 13.3297 3.10679 14.8925C3.88061 15.6663 4.79927 16.2802 5.81032 16.699C6.82137 17.1177 7.905 17.3333 8.99935 17.3333C11.2095 17.3333 13.3291 16.4553 14.8919 14.8925C16.4547 13.3297 17.3327 11.2101 17.3327 8.99996C17.3327 7.90561 17.1171 6.82198 16.6983 5.81093C16.2796 4.79988 15.6657 3.88122 14.8919 3.1074C14.1181 2.33358 13.1994 1.71975 12.1884 1.30096C11.1773 0.882174 10.0937 0.666626 8.99935 0.666626ZM8.16602 13.1666H9.83268V8.16663H8.16602V13.1666Z" fill="#202022" fillOpacity="0.8"/>
                    </svg>
                  </span>
                </div>
                <input
                  id="maxParticipants"
                  type="number"
                  placeholder="35"
                  className={errors.maxParticipants ? "input-error" : ""}
                  {...register("maxParticipants")}
                />
                {errors.maxParticipants && <span className="error-message">{errors.maxParticipants.message}</span>}
              </div>
            </div>
          </div>
        </div>

        {tickets.map((ticket, ticketIndex) => (
          <div key={ticket.id} className="ticket-block">
            <div className="block-header">
              <span className="form-subsection-title">
                Билет {ticketIndex + 1}
              </span>
              {ticketIndex > 0 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => remove(ticketIndex)}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.2452 5.92913C15.5696 5.60466 15.5696 5.07859 15.2452 4.75413C14.9207 4.42966 14.3946 4.42966 14.0702 4.75413L9.99935 8.82496L5.92852 4.75413C5.60405 4.42966 5.07798 4.42966 4.75352 4.75413C4.42905 5.07859 4.42905 5.60466 4.75352 5.92913L8.82435 9.99996L4.75352 14.0708C4.42905 14.3953 4.42905 14.9213 4.75352 15.2458C5.07798 15.5703 5.60405 15.5703 5.92852 15.2458L9.99935 11.175L14.0702 15.2458C14.3946 15.5703 14.9207 15.5703 15.2452 15.2458C15.5696 14.9213 15.5696 14.3953 15.2452 14.0708L11.1743 9.99996L15.2452 5.92913Z" fill="#73747A"/>
                  </svg>
                </button>
              )}
            </div>

            <div className="form-row">
              <div className="form-col">
                <div className="form-group">
                  <label htmlFor={`tickets.${ticketIndex}.name`} required>
                    Название билета
                  </label>
                  <input
                    id={`tickets.${ticketIndex}.name`}
                    type="text"
                    placeholder="Например: Стандарт, VIP, Ранняя регистрация"
                    className={errors.tickets?.[ticketIndex]?.name ? "input-error" : ""}
                    {...register(`tickets.${ticketIndex}.name`)}
                  />
                  {errors.tickets?.[ticketIndex]?.name && (
                    <span className="error-message">
                      {errors.tickets[ticketIndex].name.message}
                    </span>
                  )}
                </div>
              </div>

              {watch("status") === "paid" && (
                <div className="form-col">
                  <div className="form-group">
                    <label htmlFor={`tickets.${ticketIndex}.price`} required>
                      Стоимость билета
                    </label>
                    <input
                      id={`tickets.${ticketIndex}.price`}
                      type="number"
                      placeholder="0"
                      className={errors.tickets?.[ticketIndex]?.price ? "input-error" : ""}
                      {...register(`tickets.${ticketIndex}.price`)}
                    />
                    {errors.tickets?.[ticketIndex]?.price && (
                      <span className="error-message">
                        {errors.tickets[ticketIndex].price.message}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor={`tickets.${ticketIndex}.description`} required>
                Описание билета
              </label>
              <div className="description-input-wrapper">
                <input
                  id={`tickets.${ticketIndex}.description`}
                  type="text"
                  placeholder="Введите пункт описания и нажмите Enter"
                  className={errors.tickets?.[ticketIndex]?.description ? "input-error" : ""}
                  {...register(`tickets.${ticketIndex}.description`)}
                  onKeyDown={(e) => handleDescriptionKeyDown(e, ticketIndex)}
                />
                <div className="description-points">
                  {watch(`tickets.${ticketIndex}.descriptionPoints`)?.map((point, pointIndex) => (
                    <div key={pointIndex} className="description-point">
                      <span className="point-marker"></span>
                      <span className="point-text">{point}</span>
                      <button
                        type="button"
                        className="remove-point"
                        onClick={() => removeDescriptionPoint(ticketIndex, pointIndex)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor={`tickets.${ticketIndex}.template`} required>
                Шаблон билета
              </label>
              <div className="templates-grid">
                {TEMPLATES.map((template) => {
                  const isSelected = watch(`tickets.${ticketIndex}.template`) === template.id.toString();
                  return (
                    <div
                      key={template.id}
                      className={`template-item${isSelected ? ' selected' : ''}`}
                      onClick={() => setValue(`tickets.${ticketIndex}.template`, template.id.toString(), { shouldValidate: true })}
                    >
                      <img src={template.image} alt={`Шаблон ${template.id}`} className="template-image" />
                      <div className="template-header">
                        <div className="template-title">
                          {watch(`tickets.${ticketIndex}.name`) || 'Название билета'}
                        </div>
                        <div className="template-price">
                          {(watch(`tickets.${ticketIndex}.price`) || 0) + ' BYN'}
                        </div>
                        <span
                          className="template-checkbox"
                          onClick={e => {
                            e.stopPropagation();
                            setValue(`tickets.${ticketIndex}.template`, template.id.toString(), { shouldValidate: true });
                          }}
                        >
                          {isSelected ? (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6.33333 12.1667L2.16667 8L3.34167 6.81667L6.33333 9.80833L12.6583 3.48333L13.8333 4.66667M13.8333 0.5H2.16667C1.24167 0.5 0.5 1.24167 0.5 2.16667V13.8333C0.5 14.2754 0.675595 14.6993 0.988155 15.0118C1.30072 15.3244 1.72464 15.5 2.16667 15.5H13.8333C14.2754 15.5 14.6993 15.3244 15.0118 15.0118C15.3244 14.6993 15.5 14.2754 15.5 13.8333V2.16667C15.5 1.72464 15.3244 1.30072 15.0118 0.988155C14.6993 0.675595 14.2754 0.5 13.8333 0.5Z" fill="#202022"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="0.5" y="0.5" width="15" height="15" rx="3.5" fill="white"/>
                              <rect x="0.5" y="0.5" width="15" height="15" rx="3.5" stroke="#C7C7CC"/>
                            </svg>
                          )}
                        </span>
                      </div>
                      <ul className="template-description">
                        {(watch(`tickets.${ticketIndex}.descriptionPoints`) || []).map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
              {errors.tickets?.[ticketIndex]?.template && (
                <span className="error-message">
                  {errors.tickets[ticketIndex].template.message}
                </span>
              )}
            </div>

            {watch("status") === "paid" && (
              <div className="form-group">
                <label htmlFor={`tickets.${ticketIndex}.kassaLink`} required>
                  Ссылка на кассу
                </label>
                <input
                  id={`tickets.${ticketIndex}.kassaLink`}
                  type="url"
                  placeholder="https://bezkassira.by/..."
                  className={errors.tickets?.[ticketIndex]?.kassaLink ? "input-error" : ""}
                  {...register(`tickets.${ticketIndex}.kassaLink`)}
                />
                {errors.tickets?.[ticketIndex]?.kassaLink && (
                  <span className="error-message">
                    {errors.tickets[ticketIndex].kassaLink.message}
                  </span>
                )}
              </div>
            )}

            {ticketIndex === tickets.length - 1 && (
              <div className="addButtons">
                <button type="button" className="btn-add" onClick={addTicket}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12C19 12.5523 18.5523 13 18 13H13V18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18V13H6C5.44772 13 5 12.5523 5 12C5 11.4477 5.44772 11 6 11H11V6C11 5.44772 11.4477 5 12 5C12.5523 5 13 5.44772 13 6V11H18C18.5523 11 19 11.4477 19 12Z" fill="currentColor"/>
                  </svg>
                  Добавить билет
                </button>
              </div>
            )}
          </div>
        ))}
      </form>

      <div className="form-buttons">
        <button type="submit" className="btn-сontinue" onClick={handleSubmit(onSubmit)}>
          Продолжить
        </button>
        <button type="button" className="btn-saveAsDraft" onClick={handleSaveDraft}>
          Сохранить как черновик
        </button>
      </div>
    </div>
  );
};

export default StepThree; 