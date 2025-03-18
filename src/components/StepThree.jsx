import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Form, Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const schema = yup.object().shape({
  communityName: yup.string().required("Введите название сообщества"),
  partners: yup.array().of(
    yup.object().shape({
      name: yup.string().required("Введите название организации"),
    })
  ),
  volunteers: yup.array().of(
    yup.object().shape({
      firstName: yup.string().required("Введите имя"),
      lastName: yup.string().required("Введите фамилию"),
      email: yup.string().email("Некорректный email").required("Введите email"),
    })
  ),
  agreeTerms: yup.bool().oneOf([true], "Вы должны согласиться с условиями"),
  agreePrivacy: yup.bool().oneOf([true], "Вы должны согласиться с обработкой данных"),
});

const StepThree = ({ onBack, formData, setFormData, onCancel }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
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

  const onSubmit = (data) => {
    const savedEvents = JSON.parse(localStorage.getItem("events")) || [];
    let updatedEvents;

    if (isEditing) {
      updatedEvents = savedEvents.map((e) => (e.id === formData.id ? { ...e, ...data } : e));
    } else {
      const newEvent = { id: Date.now(), ...formData, ...data };
      updatedEvents = [...savedEvents, newEvent];
    }

    localStorage.setItem("events", JSON.stringify(updatedEvents));
    navigate("/profile");
  };

  return (
    <Container>
      <h3>Команда мероприятия</h3>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group>
          <Form.Label>Название сообщества *</Form.Label>
          <Form.Control {...register("communityName")} isInvalid={!!errors.communityName} />
          <Form.Control.Feedback type="invalid">{errors.communityName?.message}</Form.Control.Feedback>
        </Form.Group>

        {(watch("organizers") || []).map((_, index) => (
          <div key={index} className="mb-3">
            <Form.Group>
              <Form.Label>Фамилия</Form.Label>
              <Form.Control {...register(`organizers.${index}.lastName`)} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Имя</Form.Label>
              <Form.Control {...register(`organizers.${index}.firstName`)} />
            </Form.Group>
            <Button variant="danger" size="sm" onClick={() => removeItem("organizers", index)}>
              Удалить
            </Button>
          </div>
        ))}
        <Button variant="outline-primary" type="button" onClick={addOrganizer}>
          + Добавить организатора
        </Button>

        {/* Партнеры */}
        {(watch("partners") || []).map((_, index) => (
          <div key={index} className="mb-3">
            <Form.Group>
              <Form.Label>Название организации *</Form.Label>
              <Form.Control {...register(`partners.${index}.name`)} isInvalid={!!errors.partners?.[index]?.name} />
              <Form.Control.Feedback type="invalid">{errors.partners?.[index]?.name?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>Логотип</Form.Label>
              <Form.Control type="file" {...register(`partners.${index}.logo`)} />
            </Form.Group>
            <Button variant="danger" size="sm" onClick={() => removeItem("partners", index)}>
              Удалить
            </Button>
          </div>
        ))}
        <Button variant="outline-primary" type="button" onClick={addPartner}>
          + Добавить партнера
        </Button>

        <Form.Group className="mt-3">
          <Form.Check
            type="checkbox"
            label={<span>Я ознакомился(-лась) и согласен(-на) с <a href="/terms">Правилами и условиями</a>. *</span>}
            {...register("agreeTerms")}
            isInvalid={!!errors.agreeTerms}
          />
          <Form.Control.Feedback type="invalid">{errors.agreeTerms?.message}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group>
          <Form.Check
            type="checkbox"
            label={<span>Я даю согласие на обработку моих персональных данных согласно <a href="/privacy">Политике конфиденциальности</a>. *</span>}
            {...register("agreePrivacy")}
            isInvalid={!!errors.agreePrivacy}
          />
          <Form.Control.Feedback type="invalid">{errors.agreePrivacy?.message}</Form.Control.Feedback>
        </Form.Group>

        <p className="text-danger mt-2">
          * Поля, помеченные звездочкой, обязательны для заполнения.
        </p>

        <div className="d-flex justify-content-between mt-4">
          <Button variant="secondary" type="button" onClick={onBack}>
            Назад
          </Button>
          <Button variant="outline-danger" type="button" onClick={onCancel}>
            Отменить
          </Button>
          <Button variant="success" type="submit">
            {isEditing ? "Сохранить изменения" : "Завершить регистрацию"}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default StepThree;
