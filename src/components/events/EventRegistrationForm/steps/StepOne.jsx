import React, { useEffect, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import CustomSelect from "../../../common/CustomInputs/CustomSelect";
import TagsInput from "../../../common/TagsInput/TagsInput";
import DateTimeField from '../../../common/DateTimeField/DateTimeField';
import "../../EventRegistrationForm/registrationForm.css";
import { useNotification } from "../../../../context/NotificationContext";
import { storageAPI } from '../../../../utils/storage';

const schema = yup.object().shape({
  eventName: yup.string()
    .required("Введите название мероприятия")
    .max(100, "Название не должно превышать 100 символов"),
  description: yup.string()
    .required("Описание мероприятия обязательно")
    .min(10, "Минимальная длина — 10 символов")
    .max(1000, "Максимальная длина — 1000 символов"),
  category: yup.string().required("Выберите категорию мероприятия"),
  eventType: yup.string().required("Выберите тип мероприятия"),
  eventFormat: yup.string().required("Выберите формат мероприятия"),
  tags: yup.array().min(1, "Добавьте хотя бы один тег").required("Добавьте хотя бы один тег"),
  date: yup.date().required("Выберите дату").typeError("Выберите дату"),
  startTime: yup.string().required("Укажите время начала"),
  endTime: yup.string()
    .required("Укажите время окончания")
    .test('is-after-start', 'Время окончания должно быть позже времени начала', 
      function(endTime) {
        const startTime = this.parent.startTime;
        if (!startTime || !endTime) return true;
        return new Date(`2000/01/01 ${endTime}`) > new Date(`2000/01/01 ${startTime}`);
    }),
  location: yup.string().required("Укажите место проведения"),
  address: yup.string()
    .test('address-format', 'Адрес слишком короткий', function(value) {
      if (!value) return true;
      return value.length >= 10;
    }),
  cardBanner: yup.mixed().required("Загрузите баннер карточки мероприятия"),
  pageBanner: yup.mixed().required("Загрузите баннер страницы мероприятия")
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
  "Тренинг"
];

const StepOne = ({ onNext, formData, setFormData }) => {
  const [cardPreview, setCardPreview] = useState(null);
  const [pagePreview, setPagePreview] = useState(null);
  const [cardFileName, setCardFileName] = useState("");
  const [pageFileName, setPageFileName] = useState("");
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState,
    watch,
    getValues,
    trigger,
  } = useForm({
    defaultValues: formData || {},
    resolver: yupResolver(schema)
  });

  // Проверяет размеры загруженного изображения
  const validateImageDimensions = (file, minWidth, minHeight, fieldName) => {
    console.log('Начало проверки размеров изображения:', { fieldName, minWidth, minHeight });
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        console.log('Размеры изображения:', { width: img.width, height: img.height, required: `${minWidth}x${minHeight}` });
        if (img.width < minWidth || img.height < minHeight) {
          const error = `Изображение должно быть не менее ${minWidth}x${minHeight} пикселей`;
          console.error('Ошибка размеров:', error);
          setError(fieldName, {
            type: 'manual',
            message: error
          });
          resolve(false);
        } else {
          console.log('Размеры изображения валидны');
          clearErrors(fieldName);
          resolve(true);
        }
      };
      img.onerror = () => {
        console.error('Ошибка при загрузке изображения для проверки размеров');
        resolve(false);
      };
      img.src = objectUrl;
    });
  };

  // Обрабатывает изменение изображения
  const handleImageChange = async (e, fieldName, setPreview) => {
    const file = e.target.files[0];
    console.log('Начало обработки файла:', { fieldName, fileName: file?.name, fileSize: file?.size });
    
    if (!file) {
      console.log('Файл не выбран');
      return;
    }

    // Сохраняем имя файла
    if (fieldName === 'cardBanner') {
      setCardFileName(file.name);
    } else {
      setPageFileName(file.name);
    }

    // Проверка типа файла
    console.log('Тип файла:', file.type);
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      const error = 'Допустимы только файлы PNG и JPG';
      console.error('Ошибка типа файла:', error);
      setError(fieldName, {
        type: 'manual',
        message: error
      });
      return;
    }

    // Проверка размера файла
    const fileSizeMB = file.size / (1024 * 1024);
    console.log('Размер файла (MB):', fileSizeMB);
    if (file.size > 10 * 1024 * 1024) { // 10MB
      const error = 'Размер файла не должен превышать 10MB';
      console.error('Ошибка размера файла:', error);
      setError(fieldName, {
        type: 'manual',
        message: error
      });
      return;
    }

    const minDimensions = fieldName === 'cardBanner' 
      ? { width: 420, height: 256 }
      : { width: 1300, height: 320 };

    try {
      console.log('Начало валидации размеров');
      const isValidDimensions = await validateImageDimensions(
        file, 
        minDimensions.width, 
        minDimensions.height,
        fieldName
      );

      if (isValidDimensions) {
        console.log('Начало конвертации в base64');
        const reader = new FileReader();
        reader.onload = () => {
          console.log('Файл успешно конвертирован в base64');
          const base64 = reader.result;
          setPreview(base64);
          setValue(fieldName, base64, { shouldValidate: true });
          clearErrors(fieldName);
          console.log('Превью установлено');
        };
        reader.onerror = (error) => {
          console.error('Ошибка при чтении файла:', error);
          setError(fieldName, {
            type: 'manual',
            message: 'Ошибка при чтении файла'
          });
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Ошибка при обработке изображения:', error);
      setError(fieldName, {
        type: 'manual',
        message: 'Ошибка при обработке изображения'
      });
    }
  };

  // Удаляет выбранное изображение
  const handleRemoveImage = (fieldName) => {
    if (fieldName === 'cardBanner') {
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
      // Устанавливаем значения для всех полей
      Object.keys(formData).forEach((key) => {
        setValue(key, formData[key], { shouldValidate: false });
      });

      // Устанавливаем превью для баннеров
      if (formData.cardBanner) {
        setCardPreview(formData.cardBanner);
      }
      if (formData.pageBanner) {
        setPagePreview(formData.pageBanner);
      }

      // Устанавливаем значения для кастомных полей
      if (formData.eventType) {
        setValue('eventType', formData.eventType, { shouldValidate: true });
      }
      if (formData.eventFormat) {
        setValue('eventFormat', formData.eventFormat, { shouldValidate: true });
      }
      if (formData.category) {
        setValue('category', formData.category, { shouldValidate: true });
      }
      if (formData.tags) {
        setValue('tags', formData.tags, { shouldValidate: true });
      }
      if (formData.date) {
        setValue('date', formData.date, { shouldValidate: true });
      }
      if (formData.startTime) {
        setValue('startTime', formData.startTime, { shouldValidate: true });
      }
      if (formData.endTime) {
        setValue('endTime', formData.endTime, { shouldValidate: true });
      }
    }
  }, [formData, setValue]);

  // Обрабатывает перетаскивание файла
  const handleDrop = useCallback(async (e, fieldName) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    console.log('Файл перетащен:', { fieldName, fileName: file?.name });
    if (file) {
      const setPreview = fieldName === 'cardBanner' ? setCardPreview : setPagePreview;
      await handleImageChange({ target: { files: [file] } }, fieldName, setPreview);
    }
  }, [handleImageChange]);

  // Предотвращает стандартное поведение при перетаскивании
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleSaveDraft = async () => {
    try {
      const currentValues = getValues();
      
      // Проверяем, есть ли заполненные поля
      const hasFilledFields = Object.values(currentValues).some(value => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'object' && value !== null) {
          return Object.values(value).some(v => v !== null && v !== '');
        }
        return value !== null && value !== '';
      });

      if (!hasFilledFields) {
        showNotification({
          type: 'saveNoData',
          message: 'Ни одно поле в форме не заполнено. Вы уверены, что хотите прекратить заполнение?',
          actions: [
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
        const newEvent = { id: Date.now(), ...updatedFormData };
        savedEvents.push(newEvent);
      }
      localStorage.setItem("events", JSON.stringify(savedEvents));

      setFormData(updatedFormData);
      showNotification({
        type: 'saveDraft',
        message: 'Черновик мероприятия с внесенными данными успешно сохранен и будет отображен в личном кабинете в виде карточки, где вы можете управлять им.'
      });
      navigate('/profile/events');
    } catch (error) {
      console.error('Ошибка при сохранении черновика:', error);
      showNotification({
        type: 'error',
        message: 'Ошибка при сохранении черновика. Пожалуйста, попробуйте еще раз.'
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
          showNotification('error', errorMessages.join('\n'));
          return;
        }
      }

      // Если ошибок нет, переходим к следующему шагу
      onNext(data);
    } catch (error) {
      console.error('Ошибка при отправке формы:', error);
      showNotification('error', 'Произошла ошибка при отправке формы');
    }
  };

  const eventTypeOptions = [
    { value: "public", label: "Публичное" },
    { value: "private", label: "Частное" }
  ];

  const eventFormatOptions = [
    { value: "offline", label: "Оффлайн" },
    { value: "online", label: "Онлайн" }
  ];

  return (
    <div className="step-wrapper">
      <form className="step-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-section">
          <span className="form-section-title">Общая информация</span>
        </div>
        
        <div className="form-group">
          <label htmlFor="eventName" required>
            Название мероприятия
          </label>
          <input
            id="eventName"
            type="text"
            placeholder="Офлайн митап для проектных менеджеров от PM.Meetup и Lean Coffee Minsk"
            className={formState.errors.eventName ? "input-error" : ""}
            {...register("eventName")}
          />
          {formState.errors.eventName && <span className="error-message">{formState.errors.eventName.message}</span>}
        </div>
        <div className="form-group">
          <div className="label-with-icon">
            <label htmlFor="description" required>
              Описание мероприятия
            </label>
            <span className="info-icon" data-tooltip="Кратко опишите основные цели и задачи вашего мероприятия, его тематику, концепцию, отличительные черты и целевую аудиторию.">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.16602 6.49996H9.83268V4.83329H8.16602M8.99935 15.6666C5.32435 15.6666 2.33268 12.675 2.33268 8.99996C2.33268 5.32496 5.32435 2.33329 8.99935 2.33329C12.6743 2.33329 15.666 5.32496 15.666 8.99996C15.666 12.675 12.6743 15.6666 8.99935 15.6666ZM8.99935 0.666626C7.905 0.666626 6.82137 0.882174 5.81032 1.30096C4.79927 1.71975 3.88061 2.33358 3.10679 3.1074C1.54399 4.67021 0.666016 6.78982 0.666016 8.99996C0.666016 11.2101 1.54399 13.3297 3.10679 14.8925C3.88061 15.6663 4.79927 16.2802 5.81032 16.699C6.82137 17.1177 7.905 17.3333 8.99935 17.3333C11.2095 17.3333 13.3291 16.4553 14.8919 14.8925C16.4547 13.3297 17.3327 11.2101 17.3327 8.99996C17.3327 7.90561 17.1171 6.82198 16.6983 5.81093C16.2796 4.79988 15.6657 3.88122 14.8919 3.1074C14.1181 2.33358 13.1994 1.71975 12.1884 1.30096C11.1773 0.882174 10.0937 0.666626 8.99935 0.666626ZM8.16602 13.1666H9.83268V8.16663H8.16602V13.1666Z" fill="#202022" fillOpacity="0.8"/>
              </svg>
            </span>
          </div>
          <textarea
            id="description"
            className={formState.errors.description ? "input-error" : ""}
            {...register("description")}
          />
          <span className="hint">0 из 1000 символов</span>
          {formState.errors.description && <span className="error-message">{formState.errors.description.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="cardBanner" required>
            Баннер карточки мероприятия
          </label>
          <div 
            className={`file-upload-area ${formState.errors.cardBanner ? "input-error" : ""}`}
            onClick={() => !cardPreview && document.getElementById('cardBanner').click()}
            onDrop={(e) => handleDrop(e, 'cardBanner')}
            onDragOver={handleDragOver}
          >
            <input
              id="cardBanner"
              type="file"
              accept="image/png,image/jpeg"
              style={{ display: 'none' }}
              onChange={(e) => handleImageChange(e, 'cardBanner', setCardPreview)}
            />
            {cardPreview ? (
              <div className="file-upload-preview">
                <img src={cardPreview} alt="Preview" className="file-preview-image" />
                <div className="file-preview-info">
                  <span className="file-preview-name">{cardFileName}</span>
                  <button 
                    type="button" 
                    className="file-preview-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage('cardBanner');
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.6667 4.27334L11.7267 3.33334L8.00001 7.06001L4.27334 3.33334L3.33334 4.27334L7.06001 8.00001L3.33334 11.7267L4.27334 12.6667L8.00001 8.94001L11.7267 12.6667L12.6667 11.7267L8.94001 8.00001L12.6667 4.27334Z" fill="#C7C7CC"/>
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
          {formState.errors.cardBanner && <span className="error-message">{formState.errors.cardBanner.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="pageBanner" required>
            Баннер на странице мероприятия
          </label>
          <div 
            className={`file-upload-area ${formState.errors.pageBanner ? "input-error" : ""}`}
            onClick={() => !pagePreview && document.getElementById('pageBanner').click()}
            onDrop={(e) => handleDrop(e, 'pageBanner')}
            onDragOver={handleDragOver}
          >
            <input
              id="pageBanner"
              type="file"
              accept="image/png,image/jpeg"
              style={{ display: 'none' }}
              onChange={(e) => handleImageChange(e, 'pageBanner', setPagePreview)}
            />
            {pagePreview ? (
              <div className="file-upload-preview">
                <img src={pagePreview} alt="Preview" className="file-preview-image" />
                <div className="file-preview-info">
                  <span className="file-preview-name">{pageFileName}</span>
                  <button 
                    type="button" 
                    className="file-preview-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage('pageBanner');
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.6667 4.27334L11.7267 3.33334L8.00001 7.06001L4.27334 3.33334L3.33334 4.27334L7.06001 8.00001L3.33334 11.7267L4.27334 12.6667L8.00001 8.94001L11.7267 12.6667L12.6667 11.7267L8.94001 8.00001L12.6667 4.27334Z" fill="#C7C7CC"/>
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="file-upload-content">
                <span>Загрузить файл или перетащите сюда изображение</span>
                <span>PNG, JPG до 10Mb</span>
                <span>мин. формат 1300x320 px</span>
              </div>
            )}
          </div>
          {formState.errors.pageBanner && <span className="error-message">{formState.errors.pageBanner.message}</span>}
        </div>

        <div className="form-row">
          <div className="form-col">
            <div className="form-group">
              <label htmlFor="eventType" required>Тип мероприятия</label>
              <CustomSelect
                options={eventTypeOptions}
                value={watch("eventType")}
                onChange={(value) => setValue("eventType", value, { shouldValidate: true })}
                placeholder="Выберите тип мероприятия"
                error={formState.errors.eventType}
              />
              {formState.errors.eventType && <span className="error-message">{formState.errors.eventType.message}</span>}
            </div>
          </div>

          <div className="form-col">
            <div className="form-group">
              <label htmlFor="eventFormat" required>Формат мероприятия</label>
              <CustomSelect
                options={eventFormatOptions}
                value={watch("eventFormat")}
                onChange={(value) => setValue("eventFormat", value, { shouldValidate: true })}
                placeholder="Выберите формат мероприятия"
                error={formState.errors.eventFormat}
              />
              {formState.errors.eventFormat && <span className="error-message">{formState.errors.eventFormat.message}</span>}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-col">
            <div className="form-group">
              <label htmlFor="category" required>Категория мероприятия</label>
              <CustomSelect
                options={categoryOptions}
                value={watch("category")}
                onChange={(value) => setValue("category", value, { shouldValidate: true })}
                placeholder="Выберите категорию мероприятия"
                error={formState.errors.category}
                allowCustomInput={true}
              />
              {formState.errors.category && <span className="error-message">{formState.errors.category.message}</span>}
            </div>
          </div>

          <div className="form-col">
            <div className="form-group">
              <div className="label-with-icon">
                <label htmlFor="tags" required>Теги</label>
                <span className="info-icon" data-tooltip="Введите ключевые слова, которые отражают тематику вашего мероприятия. (например, Java, маркетинг, soft skills)">
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.16602 6.49996H9.83268V4.83329H8.16602M8.99935 15.6666C5.32435 15.6666 2.33268 12.675 2.33268 8.99996C2.33268 5.32496 5.32435 2.33329 8.99935 2.33329C12.6743 2.33329 15.666 5.32496 15.666 8.99996C15.666 12.675 12.6743 15.6666 8.99935 15.6666ZM8.99935 0.666626C7.905 0.666626 6.82137 0.882174 5.81032 1.30096C4.79927 1.71975 3.88061 2.33358 3.10679 3.1074C1.54399 4.67021 0.666016 6.78982 0.666016 8.99996C0.666016 11.2101 1.54399 13.3297 3.10679 14.8925C3.88061 15.6663 4.79927 16.2802 5.81032 16.699C6.82137 17.1177 7.905 17.3333 8.99935 17.3333C11.2095 17.3333 13.3291 16.4553 14.8919 14.8925C16.4547 13.3297 17.3327 11.2101 17.3327 8.99996C17.3327 7.90561 17.1171 6.82198 16.6983 5.81093C16.2796 4.79988 15.6657 3.88122 14.8919 3.1074C14.1181 2.33358 13.1994 1.71975 12.1884 1.30096C11.1773 0.882174 10.0937 0.666626 8.99935 0.666626ZM8.16602 13.1666H9.83268V8.16663H8.16602V13.1666Z" fill="#202022" fillOpacity="0.8"/>
                  </svg>
                </span>
              </div>
            </div>
            <TagsInput
              value={watch("tags") || []}
              onChange={(tags) => setValue("tags", tags, { shouldValidate: true })}
              error={formState.errors.tags}
            />
            {formState.errors.tags && <span className="error-message">{formState.errors.tags.message}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-col">
            <DateTimeField
              value={watch("date")}
              onChange={(date) => {
                setValue("date", date, { shouldValidate: true });
              }}
              onStartTimeChange={(time) => {
                setValue("startTime", time, { shouldValidate: true });
              }}
              onEndTimeChange={(time) => {
                setValue("endTime", time, { shouldValidate: true });
              }}
              errors={{
                date: formState.errors.date?.message,
                startTime: formState.errors.startTime?.message,
                endTime: formState.errors.endTime?.message
              }}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-col">
            <div className="form-group">
              <label htmlFor="location" required>Место проведения</label>
              <input
                id="location"
                type="text"
                placeholder="InnoDom"
                className={formState.errors.location ? "input-error" : ""}
                {...register("location")}
              />
              {formState.errors.location && <span className="error-message">{formState.errors.location.message}</span>}
            </div>
          </div>

          <div className="form-col">
            <div className="form-group">
              <label htmlFor="address">Адрес</label>
              <input
                id="address"
                type="text"
                placeholder="Минск, ул. Беломорская д.17"
                className={formState.errors.address ? "input-error" : ""}
                {...register("address")}
              />
              {formState.errors.address && <span className="error-message">{formState.errors.address.message}</span>}
            </div>
          </div>
        </div>
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

export default StepOne;