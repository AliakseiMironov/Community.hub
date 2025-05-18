import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../../context/NotificationContext";
import "../../EventRegistrationForm/registrationForm.css";

const schema = yup.object().shape({
  communityName: yup.string()
    .required("Введите название сообщества")
    .max(100, "Название не должно превышать 100 символов"),
  organizers: yup.array().of(
    yup.object().shape({
      firstName: yup.string()
        .required("Введите имя")
        .max(50, "Имя не должно превышать 50 символов"),
      lastName: yup.string()
        .required("Введите фамилию")
        .max(50, "Фамилия не должна превышать 50 символов"),
      email: yup.string()
        .email("Некорректный email")
        .required("Введите email")
        .test('unique-email', 'Email уже используется другим организатором', 
          function(email) {
            if (!email) return true;
            const organizers = this.parent.parent;
            return organizers.filter(org => org.email === email).length === 1;
          })
    })
  ).max(10, "Максимальное количество организаторов - 10"),
  partners: yup.array().of(
    yup.object().shape({
      name: yup.string()
        .required("Введите название организации")
        .max(100, "Название не должно превышать 100 символов"),
      logo: yup.mixed()
        .test('fileType', 'Допустимые форматы: PNG, JPG, GIF или SVG', 
          value => !value || ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'].includes(value.type))
        .test('fileSize', 'Размер файла не должен превышать 2MB', 
          value => !value || value.size <= 2 * 1024 * 1024)
    })
  ).max(5, "Максимальное количество партнеров - 5"),
  agreeTerms: yup.bool().oneOf([true], "Вы должны согласиться с условиями"),
  agreePrivacy: yup.bool().oneOf([true], "Вы должны согласиться с обработкой данных")
});

const StepFour = ({ onNext, onBack, formData, setFormData, onCancel }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const { showNotification } = useNotification();
  const [partnerPreviews, setPartnerPreviews] = useState({});
  const [partnerFileNames, setPartnerFileNames] = useState({});
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
    trigger,
    formState,
  } = useForm({
    defaultValues: formData,
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const savedEvents = JSON.parse(localStorage.getItem("events")) || [];
    const editingEvent = savedEvents.find((e) => e.id === formData.id);

    if (editingEvent) {
      setIsEditing(true);
      Object.keys(editingEvent).forEach((key) => setValue(key, editingEvent[key]));
    }
  }, [formData.id, setValue]);

  const removeItem = (field, index) => {
    const items = [...(getValues(field) || [])];
    items.splice(index, 1);
    setValue(field, items);
  };

  const addOrganizer = () => {
    setValue("organizers", [...(getValues("organizers") || []), { firstName: "", lastName: "" }]);
  };

  const addPartner = () => {
    setValue("partners", [...(getValues("partners") || []), { name: "", logo: "" }]);
  };

  const addVolunteer = () => {
    setValue("volunteers", [
      ...(getValues("volunteers") || []),
      { firstName: "", lastName: "", email: "" },
    ]);
  };

  const handleSaveDraft = async () => {
    try {
      const currentValues = getValues();
      
      // Проверяем, есть ли заполненные поля
      const hasFilledFields = 
        (currentValues.communityName) ||
        (currentValues.organizers && currentValues.organizers.some(org => 
          org.firstName || org.lastName || org.email
        )) ||
        (currentValues.partners && currentValues.partners.some(partner => 
          partner.name || partner.logo
        )) ||
        (currentValues.volunteers && currentValues.volunteers.some(vol => 
          vol.firstName || vol.lastName || vol.email
        ));

      if (!hasFilledFields) {
        showNotification('saveNoData', 'Ни одно поле в форме не заполнено. Вы уверены, что хотите прекратить заполнение?', [
          {
            label: 'Подтвердить',
            type: 'primary',
            onClick: () => navigate('/profile/events')
          },
          {
            label: 'Возобновить',
            type: 'secondary',
            onClick: () => {}
          }
        ]);
        return;
      }

      // Обновляем данные формы
      const updatedFormData = {
        ...formData,
        ...currentValues,
        lastSaved: new Date().toISOString(),
        status: 'draft'
      };

      // Сохраняем в localStorage
      const savedEvents = JSON.parse(localStorage.getItem('events')) || [];
      const eventIndex = savedEvents.findIndex(e => e.id === updatedFormData.id);

      if (eventIndex !== -1) {
        savedEvents[eventIndex] = updatedFormData;
      } else {
        savedEvents.push({
          ...updatedFormData,
          id: Date.now()
        });
      }

      localStorage.setItem('events', JSON.stringify(savedEvents));
      setFormData(updatedFormData);
      
      showNotification('saveDraft', 'Черновик мероприятия успешно сохранен и будет отображен в личном кабинете в виде карточки, где вы можете управлять им.');
      navigate('/profile/events');
    } catch (error) {
      console.error('Ошибка при сохранении черновика:', error);
      showNotification('error', 'Ошибка при сохранении черновика. Пожалуйста, попробуйте еще раз.');
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
          showNotification('error', errorMessages.join('\n'));
          return;
        }
      }

      // Проверяем наличие данных во всех шагах
      const allFormData = {
        ...formData,
        ...data,
        status: 'published',
        lastUpdated: new Date().toISOString()
      };

      // Сохраняем в localStorage
      const savedEvents = JSON.parse(localStorage.getItem('events')) || [];
      const eventIndex = savedEvents.findIndex(e => e.id === allFormData.id);

      if (eventIndex !== -1) {
        savedEvents[eventIndex] = allFormData;
      } else {
        savedEvents.push({
          ...allFormData,
          id: Date.now()
        });
      }

      localStorage.setItem('events', JSON.stringify(savedEvents));
      
      // Показываем уведомление об успешном создании
      showNotification('event_created', 'Мероприятие успешно создано');
      
      // Перенаправляем на страницу профиля
      navigate('/profile/events');
    } catch (error) {
      console.error('Ошибка при публикации мероприятия:', error);
      showNotification('error', 'Произошла ошибка при публикации мероприятия');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageChange({ target: { files: [file] } }, index);
    }
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showNotification('error', 'Размер файла не должен превышать 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPartnerPreviews(prev => ({ ...prev, [index]: reader.result }));
        setPartnerFileNames(prev => ({ ...prev, [index]: file.name }));
        setValue(`partners.${index}.logo`, file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index) => {
    setPartnerPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[index];
      return newPreviews;
    });
    setPartnerFileNames(prev => {
      const newNames = { ...prev };
      delete newNames[index];
      return newNames;
    });
    setValue(`partners.${index}.logo`, null);
  };

  return (
    <div className="step-wrapper">
      <form className="step-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-section-title">
          <span className="form-section-title-text">Команда мероприятия</span>
        </div>

        <div className="form-section">
          <span className="form-subsection-subtitle">
            Организаторы мероприятия
          </span>

          <div className="form-row">
            <div className="form-col half">
              <div className="form-group">
                <label htmlFor="communityName" required>Название сообщества</label>
                <input
                  id="communityName"
                  type="text"
                  placeholder="Введите название сообщества"
                  {...register("communityName")}
                  className={errors.communityName ? "input-error" : ""}
                />
                {errors.communityName && 
                  <span className="error-message">{errors.communityName?.message}</span>
                }
              </div>
            </div>
          </div>

          {(watch("organizers") || []).map((_, index) => (
            <div key={index} className="form-section">
              <div className="speaker-header">
                <span>Организатор {index + 1}</span>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeItem("organizers", index)}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.2452 5.92913C15.5696 5.60466 15.5696 5.07859 15.2452 4.75413C14.9207 4.42966 14.3946 4.42966 14.0702 4.75413L9.99935 8.82496L5.92852 4.75413C5.60405 4.42966 5.07798 4.42966 4.75352 4.75413C4.42905 5.07859 4.42905 5.60466 4.75352 5.92913L8.82435 9.99996L4.75352 14.0708C4.42905 14.3953 4.42905 14.9213 4.75352 15.2458C5.07798 15.5703 5.60405 15.5703 5.92852 15.2458L9.99935 11.175L14.0702 15.2458C14.3946 15.5703 14.9207 15.5703 15.2452 15.2458C15.5696 14.9213 15.5696 14.3953 15.2452 14.0708L11.1743 9.99996L15.2452 5.92913Z" fill="#73747A"/>
                  </svg>
                </button>
              </div>
              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label htmlFor={`organizer-firstName-${index}`} required>Имя</label>
                    <input
                      id={`organizer-firstName-${index}`}
                      type="text"
                      {...register(`organizers.${index}.firstName`)}
                    />
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group">
                    <label htmlFor={`organizer-lastName-${index}`} required>Фамилия</label>
                    <input
                      id={`organizer-lastName-${index}`}
                      type="text"
                      {...register(`organizers.${index}.lastName`)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="addButtons">
            <button type="button" onClick={addOrganizer} className="btn-add">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12C19 12.5523 18.5523 13 18 13H13V18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18V13H6C5.44772 13 5 12.5523 5 12C5 11.4477 5.44772 11 6 11H11V6C11 5.44772 11.4477 5 12 5C12.5523 5 13 5.44772 13 6V11H18C18.5523 11 19 11.4477 19 12Z" fill="currentColor"/>
              </svg>
              Добавить организатора
            </button>
          </div>
        </div>

        {/* Партнеры */}
        <div className="form-section">
          <span className="form-subsection-subtitle">Партнеры мероприятия</span>
          {(watch("partners") || []).map((_, index) => (
            <div key={index} className="form-section">
              <div className="speaker-header">
                <span>Партнер {index + 1}</span>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeItem("partners", index)}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.2452 5.92913C15.5696 5.60466 15.5696 5.07859 15.2452 4.75413C14.9207 4.42966 14.3946 4.42966 14.0702 4.75413L9.99935 8.82496L5.92852 4.75413C5.60405 4.42966 5.07798 4.42966 4.75352 4.75413C4.42905 5.07859 4.42905 5.60466 4.75352 5.92913L8.82435 9.99996L4.75352 14.0708C4.42905 14.3953 4.42905 14.9213 4.75352 15.2458C5.07798 15.5703 5.60405 15.5703 5.92852 15.2458L9.99935 11.175L14.0702 15.2458C14.3946 15.5703 14.9207 15.5703 15.2452 15.2458C15.5696 14.9213 15.5696 14.3953 15.2452 14.0708L11.1743 9.99996L15.2452 5.92913Z" fill="#73747A"/>
                  </svg>
                </button>
              </div>
              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label htmlFor={`partner-name-${index}`} required>Название организации</label>
                    <input
                      id={`partner-name-${index}`}
                      type="text"
                      {...register(`partners.${index}.name`)}
                      className={errors.partners?.[index]?.name ? "input-error" : ""}
                    />
                    {errors.partners?.[index]?.name && (
                      <span className="error-message">{errors.partners?.[index]?.name?.message}</span>
                    )}
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group">
                    <div className="label-with-icon">
                      <label htmlFor={`partner-logo-${index}`} required>
                        Логотип
                        </label>
                        <span className="info-icon" data-tooltip="Логотип партнера должен быть в формате PNG, JPG, GIF или SVG. Размер файла не должен превышать 2MB.">
                          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.16602 6.49996H9.83268V4.83329H8.16602M8.99935 15.6666C5.32435 15.6666 2.33268 12.675 2.33268 8.99996C2.33268 5.32496 5.32435 2.33329 8.99935 2.33329C12.6743 2.33329 15.666 5.32496 15.666 8.99996C15.666 12.675 12.6743 15.6666 8.99935 15.6666ZM8.99935 0.666626C7.905 0.666626 6.82137 0.882174 5.81032 1.30096C4.79927 1.71975 3.88061 2.33358 3.10679 3.1074C1.54399 4.67021 0.666016 6.78982 0.666016 8.99996C0.666016 11.2101 1.54399 13.3297 3.10679 14.8925C3.88061 15.6663 4.79927 16.2802 5.81032 16.699C6.82137 17.1177 7.905 17.3333 8.99935 17.3333C11.2095 17.3333 13.3291 16.4553 14.8919 14.8925C16.4547 13.3297 17.3327 11.2101 17.3327 8.99996C17.3327 7.90561 17.1171 6.82198 16.6983 5.81093C16.2796 4.79988 15.6657 3.88122 14.8919 3.1074C14.1181 2.33358 13.1994 1.71975 12.1884 1.30096C11.1773 0.882174 10.0937 0.666626 8.99935 0.666626ZM8.16602 13.1666H9.83268V8.16663H8.16602V13.1666Z" fill="#202022" fillOpacity="0.8"/>
                          </svg>
                        </span>
                    </div>
                    <div className="file-upload-area">
                      <input 
                        type="file"
                        id={`partner-logo-${index}`}
                        accept="image/png,image/jpeg,image/gif,image/svg+xml"
                        style={{ display: 'none' }}
                        onChange={(e) => handleImageChange(e, index)}
                      />
                      {partnerFileNames[`${index}`] ? (
                        <div className="file-logo-info">
                          <span className="file-logo-name">{partnerFileNames[`${index}`]}</span>
                          <button   
                            type="button" 
                            className="file-remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(index);
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.6667 4.27334L11.7267 3.33334L8.00001 7.06001L4.27334 3.33334L3.33334 4.27334L7.06001 8.00001L3.33334 11.7267L4.27334 12.6667L8.00001 8.94001L11.7267 12.6667L12.6667 11.7267L8.94001 8.00001L12.6667 4.27334Z" fill="#C7C7CC"/>
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="file-upload-placeholder"
                          onClick={() => document.getElementById(`partner-logo-${index}`).click()}
                        >
                          <span>Загрузить файл</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="addButtons">
            <button type="button" onClick={addPartner} className="btn-add">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12C19 12.5523 18.5523 13 18 13H13V18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18V13H6C5.44772 13 5 12.5523 5 12C5 11.4477 5.44772 11 6 11H11V6C11 5.44772 11.4477 5 12 5C12.5523 5 13 5.44772 13 6V11H18C18.5523 11 19 11.4477 19 12Z" fill="currentColor"/>
              </svg>
              Добавить партнера
            </button>
          </div>
        </div>

        <div className="form-section">
          <span className="form-subsection-subtitle">Волонтеры мероприятия</span>
          <div className="form-group">
            <div className="checkbox-label">
              <span className="checkbox-custom" onClick={() => setValue("needVolunteers", !watch("needVolunteers"))}>
                {watch("needVolunteers") ? (
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
              <span>Необходимы волонтеры для помощи в организации мероприятия</span>
              <span className="info-icon" data-tooltip="Волонтеры помогут в организации мероприятия">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.16602 6.49996H9.83268V4.83329H8.16602M8.99935 15.6666C5.32435 15.6666 2.33268 12.675 2.33268 8.99996C2.33268 5.32496 5.32435 2.33329 8.99935 2.33329C12.6743 2.33329 15.666 5.32496 15.666 8.99996C15.666 12.675 12.6743 15.6666 8.99935 15.6666ZM8.99935 0.666626C7.905 0.666626 6.82137 0.882174 5.81032 1.30096C4.79927 1.71975 3.88061 2.33358 3.10679 3.1074C1.54399 4.67021 0.666016 6.78982 0.666016 8.99996C0.666016 11.2101 1.54399 13.3297 3.10679 14.8925C3.88061 15.6663 4.79927 16.2802 5.81032 16.699C6.82137 17.1177 7.905 17.3333 8.99935 17.3333C11.2095 17.3333 13.3291 16.4553 14.8919 14.8925C16.4547 13.3297 17.3327 11.2101 17.3327 8.99996C17.3327 7.90561 17.1171 6.82198 16.6983 5.81093C16.2796 4.79988 15.6657 3.88122 14.8919 3.1074C14.1181 2.33358 13.1994 1.71975 12.1884 1.30096C11.1773 0.882174 10.0937 0.666626 8.99935 0.666626ZM8.16602 13.1666H9.83268V8.16663H8.16602V13.1666Z" fill="#202022" fillOpacity="0.8"/>
                </svg>
              </span>
            </div>
          </div>
          {(watch("volunteers") || []).length > 0 && (
            <div className="form-section">
              {(watch("volunteers") || []).map((_, index) => (
                <div key={index} className="form-section">
                  <div className="speaker-header">
                    <span>Волонтер {index + 1}</span>
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeItem("volunteers", index)}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.2452 5.92913C15.5696 5.60466 15.5696 5.07859 15.2452 4.75413C14.9207 4.42966 14.3946 4.42966 14.0702 4.75413L9.99935 8.82496L5.92852 4.75413C5.60405 4.42966 5.07798 4.42966 4.75352 4.75413C4.42905 5.07859 4.42905 5.60466 4.75352 5.92913L8.82435 9.99996L4.75352 14.0708C4.42905 14.3953 4.42905 14.9213 4.75352 15.2458C5.07798 15.5703 5.60405 15.5703 5.92852 15.2458L9.99935 11.175L14.0702 15.2458C14.3946 15.5703 14.9207 15.5703 15.2452 15.2458C15.5696 14.9213 15.5696 14.3953 15.2452 14.0708L11.1743 9.99996L15.2452 5.92913Z" fill="#73747A"/>
                      </svg>
                    </button>
                  </div>
                  <div className="form-row">
                    <div className="form-col">
                      <div className="form-group">
                        <label htmlFor={`volunteer-firstName-${index}`} required>Имя</label>
                        <input
                          id={`volunteer-firstName-${index}`}
                          type="text"
                          {...register(`volunteers.${index}.firstName`)}
                        />
                      </div>
                    </div>
                    <div className="form-col">
                      <div className="form-group">
                        <label htmlFor={`volunteer-lastName-${index}`} required>Фамилия</label>
                        <input
                          id={`volunteer-lastName-${index}`}
                          type="text"
                          {...register(`volunteers.${index}.lastName`)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-col half">
                      <div className="form-group">
                        <label htmlFor={`volunteer-email-${index}`} required>Email</label>
                        <input
                          id={`volunteer-email-${index}`}
                          type="email"
                          {...register(`volunteers.${index}.email`)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="addButtons">
            <button type="button" onClick={addVolunteer} className="btn-add">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12C19 12.5523 18.5523 13 18 13H13V18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18V13H6C5.44772 13 5 12.5523 5 12C5 11.4477 5.44772 11 6 11H11V6C11 5.44772 11.4477 5 12 5C12.5523 5 13 5.44772 13 6V11H18C18.5523 11 19 11.4477 19 12Z" fill="currentColor"/>
              </svg>
              Добавить волонтера
            </button>
          </div>
        </div>
      </form>

      {/* Соглашения */}
      <div className="agreements-section">
        <div className="form-group">
          <div className="checkbox-label">
            <span className="checkbox-custom" onClick={() => setValue("agreeTerms", !watch("agreeTerms"))}>
              {watch("agreeTerms") ? (
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
            <span>Я ознакомился(-лась) и согласен(-на) с <a href="/terms">Правилами и условиями</a>. <span className="required">*</span></span>
          </div>
          {errors.agreeTerms && 
            <span className="error-message">{errors.agreeTerms?.message}</span>
          }
        </div>

        <div className="form-group">
          <div className="checkbox-label">
            <span className="checkbox-custom" onClick={() => setValue("agreePrivacy", !watch("agreePrivacy"))}>
              {watch("agreePrivacy") ? (
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
            <span>Я даю согласие на обработку моих персональных данных согласно <a href="/privacy">Политике конфиденциальности</a>. <span className="required">*</span></span>
          </div>
          {errors.agreePrivacy && 
            <span className="error-message">{errors.agreePrivacy?.message}</span>
          }
        </div>

        <p className="form-hint">
          <span className="required">*</span> Поля, помеченные звездочкой, обязательны для заполнения.
        </p>
      </div>

      <div className="form-buttons">
        <button type="submit" className="btn-сontinue">
          Опубликовать
        </button>
        <button type="button" className="btn-saveAsDraft" onClick={handleSaveDraft}>
          Сохранить как черновик
        </button>
      </div>
    </div>
  );
};

export default StepFour;
