import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Form, Button, Row, Col } from "react-bootstrap";

const StepTwo = ({ onNext, onBack, formData, setFormData }) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
  } = useForm({
    defaultValues: formData || { programBlocks: [] },
  });

  const { fields: programBlocks, append, remove } = useFieldArray({
    control,
    name: "programBlocks",
  });

  const addProgramBlock = () => {
    append({
      type: "Доклад",
      startTime: "",
      endTime: "",
      title: "",
      tags: "",
      description: "",
      speakers: [],
    });
  };

  const addSpeaker = (blockIndex) => {
    const currentBlocks = watch("programBlocks") || [];
    const updatedBlocks = [...currentBlocks];

    if (!updatedBlocks[blockIndex].speakers) {
      updatedBlocks[blockIndex].speakers = [];
    }

    updatedBlocks[blockIndex].speakers.push({
      lastName: "",
      firstName: "",
      email: "",
      social: "",
      position: "",
      about: "",
      photo: null,
    });

    setValue("programBlocks", updatedBlocks);
  };

  return (
    <Form onSubmit={handleSubmit((data) => {
      setFormData((prev) => ({
        ...prev,
        programBlocks: data.programBlocks || [],
      }));
      onNext();
    })}>
      <h3>Программа мероприятия</h3>

      {programBlocks.map((block, blockIndex) => {
        const blockType = watch(`programBlocks.${blockIndex}.type`);

        return (
          <div key={block.id} className="mb-4 p-3 border rounded">
            <h5>Блок {blockIndex + 1}</h5>

            <Form.Group>
              <Form.Label>Тип блока *</Form.Label>
              <Form.Select {...register(`programBlocks.${blockIndex}.type`)}>
                <option value="Регистрация">Регистрация</option>
                <option value="Доклад">Доклад</option>
              </Form.Select>
            </Form.Group>

            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Начало *</Form.Label>
                  <Form.Control type="time" {...register(`programBlocks.${blockIndex}.startTime`)} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Окончание *</Form.Label>
                  <Form.Control type="time" {...register(`programBlocks.${blockIndex}.endTime`)} />
                </Form.Group>
              </Col>
            </Row>

            {blockType === "Доклад" && (
              <>
                <Form.Group>
                  <Form.Label>Название доклада *</Form.Label>
                  <Form.Control {...register(`programBlocks.${blockIndex}.title`)} />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Теги *</Form.Label>
                  <Form.Control {...register(`programBlocks.${blockIndex}.tags`)} />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Описание доклада</Form.Label>
                  <Form.Control as="textarea" rows={3} {...register(`programBlocks.${blockIndex}.description`)} />
                </Form.Group>

                {/* Спикеры */}
                <h6>Спикеры</h6>
                {watch(`programBlocks.${blockIndex}.speakers`)?.map((_, speakerIndex) => (
                  <div key={speakerIndex} className="mb-3 p-2 border rounded">
                    <Form.Group>
                      <Form.Label>Фотография *</Form.Label>
                      <Form.Control type="file" {...register(`programBlocks.${blockIndex}.speakers.${speakerIndex}.photo`)} />
                    </Form.Group>

                    <Row>
                      <Col>
                        <Form.Group>
                          <Form.Label>Фамилия *</Form.Label>
                          <Form.Control {...register(`programBlocks.${blockIndex}.speakers.${speakerIndex}.lastName`)} />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group>
                          <Form.Label>Имя *</Form.Label>
                          <Form.Control {...register(`programBlocks.${blockIndex}.speakers.${speakerIndex}.firstName`)} />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group>
                      <Form.Label>E-mail *</Form.Label>
                      <Form.Control type="email" {...register(`programBlocks.${blockIndex}.speakers.${speakerIndex}.email`)} />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Соцсети</Form.Label>
                      <Form.Control type="text" {...register(`programBlocks.${blockIndex}.speakers.${speakerIndex}.social`)} />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Должность *</Form.Label>
                      <Form.Control {...register(`programBlocks.${blockIndex}.speakers.${speakerIndex}.position`)} />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>О спикере</Form.Label>
                      <Form.Control as="textarea" {...register(`programBlocks.${blockIndex}.speakers.${speakerIndex}.about`)} />
                    </Form.Group>
                  </div>
                ))}

                <Button variant="outline-primary" size="sm" onClick={() => addSpeaker(blockIndex)}>
                  + Добавить спикера
                </Button>
              </>
            )}

            <Button variant="danger" size="sm" className="mt-3" onClick={() => remove(blockIndex)}>
              Удалить блок
            </Button>
          </div>
        );
      })}

      <Button variant="outline-primary" className="mb-3" onClick={addProgramBlock}>
        + Добавить блок программы
      </Button>

      <div className="d-flex justify-content-between mt-4">
        <Button variant="secondary" onClick={onBack}>
          Отменить
        </Button>
        <Button variant="warning" type="submit">
          Сохранить и продолжить
        </Button>
      </div>
    </Form>
  );
};

export default StepTwo;
