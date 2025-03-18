import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// Полная схема валидации
const schema = yup.object().shape({
  eventName: yup.string().required("Название мероприятия обязательно"),
  description: yup.string().max(1000, "Максимальная длина — 1000 символов"),
  cardBanner: yup.mixed().required("Баннер карточки обязателен"),
  pageBanner: yup.mixed().required("Баннер страницы обязателен"),
  eventType: yup.string().required("Выберите тип мероприятия"),
  eventFormat: yup.string().required("Выберите формат мероприятия"),
  category: yup.string().required("Выберите категорию"),
  tags: yup.string().required("Добавьте хотя бы один тег"),
  date: yup.date().required("Выберите дату"),
  startTime: yup.string().required("Укажите время начала"),
  endTime: yup.string().required("Укажите время окончания"),
  location: yup.string().required("Введите место проведения"),
  address: yup.string().required("Введите адрес"),
  status: yup.string().required("Выберите статус мероприятия"), // ✅ Добавлено
  participants: yup
    .number()
    .typeError("Введите число")
    .required("Укажите количество участников")
    .positive("Число должно быть положительным")
    .integer("Число должно быть целым"), // ✅ Добавлено
});

const StepOne = ({ onNext, formData, setFormData }) => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: formData || {},
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (formData) {
      Object.keys(formData).forEach((key) => {
        setValue(key, formData[key]);
      });
    }
  }, [formData, setValue]);

  const onSubmit = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    onNext();
  };

  const handleCancel = () => {
    if (window.confirm("Вы уверены, что хотите отменить регистрацию? Данные не сохранятся.")) {
      navigate("/profile");
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <h3>Общая информация</h3>

      
      <Form.Group controlId="eventName">
        <Form.Label>Название мероприятия *</Form.Label>
        <Form.Control {...register("eventName")} isInvalid={!!errors.eventName} />
        <Form.Control.Feedback type="invalid">{errors.eventName?.message}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group controlId="description">
        <Form.Label>Описание мероприятия *</Form.Label>
        <Form.Control as="textarea" {...register("description")} isInvalid={!!errors.description} />
        <Form.Control.Feedback type="invalid">{errors.description?.message}</Form.Control.Feedback>
      </Form.Group>

      
      <Row>
        <Col>
          <Form.Group controlId="cardBanner">
            <Form.Label>Баннер карточки мероприятия *</Form.Label>
            <Form.Control type="file" {...register("cardBanner")} isInvalid={!!errors.cardBanner} />
            <Form.Control.Feedback type="invalid">{errors.cardBanner?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group controlId="pageBanner">
            <Form.Label>Баннер на странице мероприятия *</Form.Label>
            <Form.Control type="file" {...register("pageBanner")} isInvalid={!!errors.pageBanner} />
            <Form.Control.Feedback type="invalid">{errors.pageBanner?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group controlId="eventType">
            <Form.Label>Тип мероприятия *</Form.Label>
            <Form.Select {...register("eventType")} isInvalid={!!errors.eventType}>
              <option value="">Выберите...</option>
              <option value="public">Публичное</option>
              <option value="private">Частное</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group controlId="eventFormat">
            <Form.Label>Формат мероприятия *</Form.Label>
            <Form.Select {...register("eventFormat")} isInvalid={!!errors.eventFormat}>
              <option value="">Выберите...</option>
              <option value="offline">Оффлайн</option>
              <option value="online">Онлайн</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group controlId="category">
            <Form.Label>Категория *</Form.Label>
            <Form.Control {...register("category")} isInvalid={!!errors.category} />
          </Form.Group>
        </Col>

        <Col>
          <Form.Group controlId="tags">
            <Form.Label>Теги *</Form.Label>
            <Form.Control {...register("tags")} isInvalid={!!errors.tags} />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group controlId="date">
            <Form.Label>Дата *</Form.Label>
            <Form.Control type="date" {...register("date")} isInvalid={!!errors.date} />
          </Form.Group>
        </Col>

        <Col>
          <Form.Group controlId="startTime">
            <Form.Label>Начало *</Form.Label>
            <Form.Control type="time" {...register("startTime")} isInvalid={!!errors.startTime} />
          </Form.Group>
        </Col>

        <Col>
          <Form.Group controlId="endTime">
            <Form.Label>Окончание *</Form.Label>
            <Form.Control type="time" {...register("endTime")} isInvalid={!!errors.endTime} />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group controlId="location">
            <Form.Label>Место проведения *</Form.Label>
            <Form.Control {...register("location")} isInvalid={!!errors.location} />
          </Form.Group>
        </Col>

        <Col>
          <Form.Group controlId="address">
            <Form.Label>Адрес *</Form.Label>
            <Form.Control {...register("address")} isInvalid={!!errors.address} />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group controlId="status">
            <Form.Label>Статус мероприятия *</Form.Label>
            <Form.Select {...register("status")} isInvalid={!!errors.status}>
              <option value="">Выберите...</option>
              <option value="planned">Запланированное</option>
              <option value="active">Активное</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group controlId="participants">
            <Form.Label>Количество участников *</Form.Label>
            <Form.Control type="number" {...register("participants")} isInvalid={!!errors.participants} />
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-between mt-4">
        <Button variant="secondary" type="button" onClick={handleCancel}>
          Отменить
        </Button>
        <Button variant="warning" type="submit">
          Сохранить и продолжить
        </Button>
      </div>
    </Form>
  );
};

export default StepOne;
