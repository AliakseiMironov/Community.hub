import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../../context/NotificationContext";
import "../../EventRegistrationForm/registrationForm.css";
import { Controller } from "react-hook-form";

// Схема валидации для билетов
const schema = yup.object().shape({
  tickets: yup.array().of(
    yup.object().shape({
      name: yup.string()
        .required('Название билета обязательно')
        .max(100, 'Название не должно превышать 100 символов'),
      price: yup.number()
        .typeError('Цена должна быть числом')
        .required('Цена обязательна')
        .min(0, 'Цена не может быть отрицательной')
        .test('is-decimal', 'Цена должна иметь не более 2 знаков после запятой',
          value => !value || /^\d+(\.\d{1,2})?$/.test(value.toString())),
      quantity: yup.number()
        .typeError('Количество должно быть числом')
        .required('Количество обязательно')
        .min(1, 'Минимальное количество - 1')
        .integer('Количество должно быть целым числом')
        .max(10000, 'Максимальное количество - 10000'),
      description: yup.string()
        .max(500, 'Описание не должно превышать 500 символов')
    })
  )
  .min(1, 'Добавьте хотя бы один тип билета')
  .max(10, 'Максимальное количество типов билетов - 10'),
  pageLink: yup.string()
    .url('Введите корректный URL')
    .required('Ссылка на страницу обязательна')
    .matches(/^https?:\/\//, 'URL должен начинаться с http:// или https://')
});

const StepThree = ({ onBack, formData, setFormData, onNext }) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [tickets, setTickets] = useState(formData.tickets || []);

  const { 
    control, 
    handleSubmit, 
    formState: { errors }, 
    watch,
    getValues
  } = useForm({
    defaultValues: {
      tickets: formData.tickets || [],
      pageLink: formData.pageLink || ''
    },
    resolver: yupResolver(schema)
  });

  const addTicket = () => {
    setTickets([...tickets, { ticketType: "", price: "", description: "", template: "" }]);
  };

  const removeTicket = (index) => {
    const updatedTickets = [...tickets];
    updatedTickets.splice(index, 1);
    setTickets(updatedTickets);
  };

  const handleSaveDraft = async () => {
    const currentValues = getValues();
    const hasAnyData = currentValues.tickets?.some(ticket => 
      ticket.name || ticket.price || ticket.quantity
    ) || currentValues.pageLink;

    if (!hasAnyData) {
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

    try {
      const updatedFormData = {
        ...formData,
        tickets: currentValues.tickets,
        pageLink: currentValues.pageLink,
        lastSaved: new Date().toISOString()
      };
      setFormData(updatedFormData);
      localStorage.setItem('eventFormData', JSON.stringify(updatedFormData));
      showNotification({
        type: 'success',
        message: 'Черновик успешно сохранен'
      });
      navigate('/profile/events');
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Ошибка при сохранении черновика'
      });
    }
  };

  const onSubmit = (data) => {
    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors)
        .map(error => error.message)
        .filter(message => message)
        .join('\n');
      
      showNotification({
        type: 'error',
        message: errorMessages
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      tickets: data.tickets,
      pageLink: data.pageLink
    }));
    onNext(data);
  };

  return (
    <div className="step-wrapper">
      <form className="step-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-section">
          <h3 className="form-section-title">Место проведения</h3>
        </div>
        
        <div className="form-section">
          <h3 className="form-section-title">
            Билеты
            <span className="info-icon" data-tooltip="Описание билета">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.16602 6.49996H9.83268V4.83329H8.16602M8.99935 15.6666C5.32435 15.6666 2.33268 12.675 2.33268 8.99996C2.33268 5.32496 5.32435 2.33329 8.99935 2.33329C12.6743 2.33329 15.666 5.32496 15.666 8.99996C15.666 12.675 12.6743 15.6666 8.99935 15.6666ZM8.99935 0.666626C7.905 0.666626 6.82137 0.882174 5.81032 1.30096C4.79927 1.71975 3.88061 2.33358 3.10679 3.1074C1.54399 4.67021 0.666016 6.78982 0.666016 8.99996C0.666016 11.2101 1.54399 13.3297 3.10679 14.8925C3.88061 15.6663 4.79927 16.2802 5.81032 16.699C6.82137 17.1177 7.905 17.3333 8.99935 17.3333C11.2095 17.3333 13.3291 16.4553 14.8919 14.8925C16.4547 13.3297 17.3327 11.2101 17.3327 8.99996C17.3327 7.90561 17.1171 6.82198 16.6983 5.81093C16.2796 4.79988 15.6657 3.88122 14.8919 3.1074C14.1181 2.33358 13.1994 1.71975 12.1884 1.30096C11.1773 0.882174 10.0937 0.666626 8.99935 0.666626ZM8.16602 13.1666H9.83268V8.16663H8.16602V13.1666Z" fill="#202022" fillOpacity="0.8"/>
              </svg>
            </span>
          </h3>

          <div className="tickets-container">
            {tickets.map((ticket, index) => (
              <div key={ticket.id} className="ticket-item">
                <div className="ticket-header">
                  <h3>Билет {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeTicket(index)}
                    className="remove-ticket"
                  >
                    Удалить
                  </button>
                </div>
                <div className="ticket-fields">
                  <div className="form-group">
                    <label>Название</label>
                    <Controller
                      name={`tickets.${index}.name`}
                      control={control}
                      render={({ field }) => (
                        <input {...field} className="form-control" />
                      )}
                    />
                    {errors.tickets?.[index]?.name && (
                      <span className="error-message">{errors.tickets[index].name.message}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Цена</label>
                    <Controller
                      name={`tickets.${index}.price`}
                      control={control}
                      render={({ field }) => (
                        <input {...field} type="number" className="form-control" />
                      )}
                    />
                    {errors.tickets?.[index]?.price && (
                      <span className="error-message">{errors.tickets[index].price.message}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Количество</label>
                    <Controller
                      name={`tickets.${index}.quantity`}
                      control={control}
                      render={({ field }) => (
                        <input {...field} type="number" className="form-control" />
                      )}
                    />
                    {errors.tickets?.[index]?.quantity && (
                      <span className="error-message">{errors.tickets[index].quantity.message}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Описание</label>
                    <Controller
                      name={`tickets.${index}.description`}
                      control={control}
                      render={({ field }) => (
                        <textarea {...field} className="form-control" />
                      )}
                    />
                    {errors.tickets?.[index]?.description && (
                      <span className="error-message">{errors.tickets[index].description.message}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            type="button" 
            onClick={addTicket} 
            className="btn btn-outline"
          >
            + Добавить еще билет
          </button>

          <div className="form-group">
            <label>Ссылка на страницу мероприятия</label>
            <Controller
              name="pageLink"
              control={control}
              render={({ field }) => (
                <input {...field} className="form-control" />
              )}
            />
            {errors.pageLink && (
              <span className="error-message">{errors.pageLink.message}</span>
            )}
          </div>
        </div>
      </form>
      <div className="form-buttons">
        <button type="submit" className="btn-сontinue" onClick={handleSubmit(onSubmit)}>
          Продолжить
        </button>
        <button type="button" className="btn-saveAsDraft" onClick={handleSubmit(handleSaveDraft)}>
          Сохранить как черновик
        </button>
      </div>
    </div>
  );
};

export default StepThree; 