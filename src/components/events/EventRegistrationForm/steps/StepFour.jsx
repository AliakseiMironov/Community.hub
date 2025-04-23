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
        .test('fileType', 'Допустимые форматы: PNG, JPG', 
          value => !value || ['image/jpeg', 'image/png'].includes(value.type))
        .test('fileSize', 'Размер файла не должен превышать 2MB', 
          value => !value || value.size <= 2 * 1024 * 1024)
    })
  ).max(5, "Максимальное количество партнеров - 5"),
  agreeTerms: yup.bool().oneOf([true], "Вы должны согласиться с условиями"),
  agreePrivacy: yup.bool().oneOf([true], "Вы должны согласиться с обработкой данных")
});

const StepFour = ({ onBack, formData, setFormData, onCancel }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const { showNotification } = useNotification();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
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
    const currentValues = getValues();
    const hasAnyData = currentValues.communityName || 
                      (currentValues.organizers && currentValues.organizers.length > 0) ||
                      (currentValues.partners && currentValues.partners.length > 0) ||
                      (currentValues.volunteers && currentValues.volunteers.length > 0);

    if (!hasAnyData) {
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

    try {
      const updatedFormData = {
        ...formData,
        ...currentValues,
        status: "draft",
        isDraft: true,
        lastSaved: new Date().toISOString()
      };

      // Сохраняем в localStorage
      let savedEvents = JSON.parse(localStorage.getItem("events")) || [];
      if (formData.id) {
        savedEvents = savedEvents.map(e => e.id === formData.id ? updatedFormData : e);
      } else {
        const newEvent = { id: Date.now(), ...updatedFormData };
        savedEvents.push(newEvent);
      }
      localStorage.setItem("events", JSON.stringify(savedEvents));

      setFormData(updatedFormData);
      showNotification('saveDraft', 'Черновик мероприятия с внесенными данными успешно сохранен и будет отображен в личном кабинете в виде карточки, где вы можете управлять им.');
      navigate('/profile/events');
    } catch (error) {
      console.error('Ошибка при сохранении черновика:', error);
      showNotification('error', 'Ошибка при сохранении черновика. Пожалуйста, попробуйте еще раз.');
    }
  };

  const onSubmit = (data) => {
    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors)
        .map(error => error.message)
        .filter(message => message)
        .join('\n');
      
      showNotification('error', errorMessages);
      return;
    }

    try {
      const updatedFormData = {
        ...formData,
        ...data,
        status: "published",
        isDraft: false,
        publishedAt: new Date().toISOString()
      };

      // Очищаем старые данные перед сохранением
      const savedEvents = JSON.parse(localStorage.getItem("events")) || [];
      const filteredEvents = savedEvents.filter(event => {
        const eventDate = new Date(event.publishedAt || event.createdAt || 0);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return eventDate > oneMonthAgo;
      });

      // Сохраняем новые данные
      if (formData.id) {
        const eventIndex = filteredEvents.findIndex(e => e.id === formData.id);
        if (eventIndex !== -1) {
          filteredEvents[eventIndex] = updatedFormData;
        } else {
          filteredEvents.push(updatedFormData);
        }
      } else {
        const newEvent = { 
          id: Date.now(), 
          ...updatedFormData,
          createdAt: new Date().toISOString()
        };
        filteredEvents.push(newEvent);
      }

      localStorage.setItem("events", JSON.stringify(filteredEvents));
      setFormData(updatedFormData);
      
      showNotification('success', 'Мероприятие успешно опубликовано');
      navigate('/profile/events');
    } catch (error) {
      console.error('Ошибка при публикации мероприятия:', error);
      showNotification('error', 'Ошибка при публикации мероприятия. Пожалуйста, попробуйте еще раз.');
    }
  };

  return (
    <div className="step-wrapper">
      <form className="step-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-section">
          <h3 className="form-section-title">Регистрация</h3>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">
            Команда
            <span className="info-icon" data-tooltip="Логотип">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.16602 6.49996H9.83268V4.83329H8.16602M8.99935 15.6666C5.32435 15.6666 2.33268 12.675 2.33268 8.99996C2.33268 5.32496 5.32435 2.33329 8.99935 2.33329C12.6743 2.33329 15.666 5.32496 15.666 8.99996C15.666 12.675 12.6743 15.6666 8.99935 15.6666ZM8.99935 0.666626C7.905 0.666626 6.82137 0.882174 5.81032 1.30096C4.79927 1.71975 3.88061 2.33358 3.10679 3.1074C1.54399 4.67021 0.666016 6.78982 0.666016 8.99996C0.666016 11.2101 1.54399 13.3297 3.10679 14.8925C3.88061 15.6663 4.79927 16.2802 5.81032 16.699C6.82137 17.1177 7.905 17.3333 8.99935 17.3333C11.2095 17.3333 13.3291 16.4553 14.8919 14.8925C16.4547 13.3297 17.3327 11.2101 17.3327 8.99996C17.3327 7.90561 17.1171 6.82198 16.6983 5.81093C16.2796 4.79988 15.6657 3.88122 14.8919 3.1074C14.1181 2.33358 13.1994 1.71975 12.1884 1.30096C11.1773 0.882174 10.0937 0.666626 8.99935 0.666626ZM8.16602 13.1666H9.83268V8.16663H8.16602V13.1666Z" fill="#202022" fillOpacity="0.8"/>
              </svg>
            </span>
          </h3>

          <div className="form-group">
            <label htmlFor="communityName">Название сообщества *</label>
            <input
              id="communityName"
              type="text"
              {...register("communityName")}
              className={errors.communityName ? "input-error" : ""}
            />
            {errors.communityName && 
              <span className="error-message">{errors.communityName?.message}</span>
            }
          </div>

          {/* Организаторы */}
          <div className="form-section">
            <h4 className="form-subsection-title">Организаторы</h4>
            {(watch("organizers") || []).map((_, index) => (
              <div key={index} className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label htmlFor={`organizer-lastName-${index}`}>Фамилия</label>
                    <input
                      id={`organizer-lastName-${index}`}
                      type="text"
                      {...register(`organizers.${index}.lastName`)}
                    />
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group">
                    <label htmlFor={`organizer-firstName-${index}`}>Имя</label>
                    <input
                      id={`organizer-firstName-${index}`}
                      type="text"
                      {...register(`organizers.${index}.firstName`)}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem("organizers", index)}
                  className="btn btn-outline"
                >
                  Удалить
                </button>
              </div>
            ))}
            <button type="button" onClick={addOrganizer} className="btn btn-outline">
              + Добавить организатора
            </button>
          </div>

          {/* Партнеры */}
          <div className="form-section">
            <h4 className="form-subsection-title">Партнеры</h4>
            {(watch("partners") || []).map((_, index) => (
              <div key={index} className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label htmlFor={`partner-name-${index}`}>Название организации *</label>
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
                    <label htmlFor={`partner-logo-${index}`}>Логотип</label>
                    <input
                      id={`partner-logo-${index}`}
                      type="file"
                      {...register(`partners.${index}.logo`)}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem("partners", index)}
                  className="btn btn-outline"
                >
                  Удалить
                </button>
              </div>
            ))}
            <button type="button" onClick={addPartner} className="btn btn-outline">
              + Добавить партнера
            </button>
          </div>

          {/* Соглашения */}
          <div className="form-section">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  {...register("agreeTerms")}
                  className={errors.agreeTerms ? "input-error" : ""}
                />
                <span>Я ознакомился(-лась) и согласен(-на) с <a href="/terms">Правилами и условиями</a>. *</span>
              </label>
              {errors.agreeTerms && 
                <span className="error-message">{errors.agreeTerms?.message}</span>
              }
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  {...register("agreePrivacy")}
                  className={errors.agreePrivacy ? "input-error" : ""}
                />
                <span>Я даю согласие на обработку моих персональных данных согласно <a href="/privacy">Политике конфиденциальности</a>. *</span>
              </label>
              {errors.agreePrivacy && 
                <span className="error-message">{errors.agreePrivacy?.message}</span>
              }
            </div>

            <p className="form-hint">
              * Поля, помеченные звездочкой, обязательны для заполнения.
            </p>
          </div>
        </div>
      </form>
      <div className="form-buttons">
        <button type="submit" className="btn-сontinue" onClick={handleSubmit(onSubmit)}>
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
