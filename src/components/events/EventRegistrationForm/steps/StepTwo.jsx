import React, { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../../context/NotificationContext";
import CustomSelect from "../../../common/CustomInputs/CustomSelect";
import DateTimeField from "../../../common/DateTimeField/DateTimeField";
import "../../EventRegistrationForm/registrationForm.css";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const blockTypes = [
  "Регистрация",
  "Открытие мероприятия",
  "Доклад",
  "Мастер-класс",
  "Секция вопрос-ответ",
  "Нетворкинг",
  "Кофе-брейк",
  "Обед",
  "Перерыв",
  "Свободное время",
  "Награждение",
  "Закрытие мероприятия"
];

const schema = yup.object().shape({
  programBlocks: yup.array().of(
    yup.object().shape({
      type: yup.string().required("Выберите тип блока"),
      startTime: yup.string().required("Укажите время начала"),
      endTime: yup.string().required("Укажите время окончания"),
      title: yup.string().when('type', {
        is: (type) => ["Доклад", "Мастер-класс"].includes(type) || (!blockTypes.includes(type) && type !== ""),
        then: yup.string().required("Введите название")
      }),
      speakers: yup.array().when('type', {
        is: (type) => ["Доклад", "Мастер-класс"].includes(type) || (!blockTypes.includes(type) && type !== ""),
        then: yup.array().of(
          yup.object().shape({
            lastName: yup.string().required("Введите фамилию"),
            firstName: yup.string().required("Введите имя"),
            email: yup.string().email("Некорректный email").required("Введите email"),
            position: yup.string().required("Введите должность"),
          })
        )
      })
    })
  ).min(1, "Добавьте хотя бы один блок программы")
});

const StepTwo = ({ onNext, onBack, formData, setFormData }) => {
  const [activeBlockMenu, setActiveBlockMenu] = useState(null);
  const [speakerPreviews, setSpeakerPreviews] = useState({});
  const [speakerFileNames, setSpeakerFileNames] = useState({});
  const menuRef = useRef(null);
  const [selectedBlockType, setSelectedBlockType] = useState('Доклад');
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors }
  } = useForm({
    defaultValues: formData || { programBlocks: [] },
    resolver: yupResolver(schema)
  });

  const { fields: programBlocks, append, remove, move } = useFieldArray({
    control,
    name: "programBlocks",
  });

  // Обработчик клика вне меню
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveBlockMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const addProgramBlock = () => {
    append({
      type: "",
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

  const handleImageChange = (e, blockIndex, speakerIndex) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSpeakerPreviews(prev => ({
          ...prev,
          [`${blockIndex}-${speakerIndex}`]: reader.result
        }));
        setSpeakerFileNames(prev => ({
          ...prev,
          [`${blockIndex}-${speakerIndex}`]: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e, blockIndex, speakerIndex) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const input = document.getElementById(`photo-${blockIndex}-${speakerIndex}`);
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      handleImageChange({ target: { files: [file] }}, blockIndex, speakerIndex);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemoveImage = (blockIndex, speakerIndex) => {
    setSpeakerPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[`${blockIndex}-${speakerIndex}`];
      return newPreviews;
    });
    setSpeakerFileNames(prev => {
      const newNames = { ...prev };
      delete newNames[`${blockIndex}-${speakerIndex}`];
      return newNames;
    });
    const input = document.getElementById(`photo-${blockIndex}-${speakerIndex}`);
    input.value = '';
  };

  const handleBlockAction = (action, blockIndex) => {
    const blocks = getValues('programBlocks');
    
    switch (action) {
      case 'moveUp':
        if (blockIndex > 0) {
          // Сохраняем значения блоков перед перемещением
          const currentBlock = { ...blocks[blockIndex] };
          const prevBlock = { ...blocks[blockIndex - 1] };
          
          // Обновляем значения блоков
          setValue(`programBlocks.${blockIndex - 1}`, currentBlock);
          setValue(`programBlocks.${blockIndex}`, prevBlock);
          
          // Обновляем превью и имена файлов
          const newPreviews = { ...speakerPreviews };
          const newFileNames = { ...speakerFileNames };
          
          // Обновляем ключи для спикеров текущего блока
          currentBlock.speakers?.forEach((_, speakerIndex) => {
            const currentKey = `${blockIndex}-${speakerIndex}`;
            const prevKey = `${blockIndex-1}-${speakerIndex}`;
            
            if (newPreviews[currentKey]) {
              newPreviews[prevKey] = newPreviews[currentKey];
              delete newPreviews[currentKey];
            }
            
            if (newFileNames[currentKey]) {
              newFileNames[prevKey] = newFileNames[currentKey];
              delete newFileNames[currentKey];
            }
          });
          
          // Обновляем ключи для спикеров предыдущего блока
          prevBlock.speakers?.forEach((_, speakerIndex) => {
            const prevKey = `${blockIndex-1}-${speakerIndex}`;
            const currentKey = `${blockIndex}-${speakerIndex}`;
            
            if (newPreviews[prevKey]) {
              newPreviews[currentKey] = newPreviews[prevKey];
              delete newPreviews[prevKey];
            }
            
            if (newFileNames[prevKey]) {
              newFileNames[currentKey] = newFileNames[prevKey];
              delete newFileNames[prevKey];
            }
          });
          
          setSpeakerPreviews(newPreviews);
          setSpeakerFileNames(newFileNames);
        }
        break;
        
      case 'moveDown':
        if (blockIndex < blocks.length - 1) {
          // Сохраняем значения блоков перед перемещением
          const currentBlock = { ...blocks[blockIndex] };
          const nextBlock = { ...blocks[blockIndex + 1] };
          
          // Обновляем значения блоков
          setValue(`programBlocks.${blockIndex + 1}`, currentBlock);
          setValue(`programBlocks.${blockIndex}`, nextBlock);
          
          // Обновляем превью и имена файлов
          const newPreviews = { ...speakerPreviews };
          const newFileNames = { ...speakerFileNames };
          
          // Обновляем ключи для спикеров текущего блока
          currentBlock.speakers?.forEach((_, speakerIndex) => {
            const currentKey = `${blockIndex}-${speakerIndex}`;
            const nextKey = `${blockIndex+1}-${speakerIndex}`;
            
            if (newPreviews[currentKey]) {
              newPreviews[nextKey] = newPreviews[currentKey];
              delete newPreviews[currentKey];
            }
            
            if (newFileNames[currentKey]) {
              newFileNames[nextKey] = newFileNames[currentKey];
              delete newFileNames[currentKey];
            }
          });
          
          // Обновляем ключи для спикеров следующего блока
          nextBlock.speakers?.forEach((_, speakerIndex) => {
            const nextKey = `${blockIndex+1}-${speakerIndex}`;
            const currentKey = `${blockIndex}-${speakerIndex}`;
            
            if (newPreviews[nextKey]) {
              newPreviews[currentKey] = newPreviews[nextKey];
              delete newPreviews[nextKey];
            }
            
            if (newFileNames[nextKey]) {
              newFileNames[currentKey] = newFileNames[nextKey];
              delete newFileNames[nextKey];
            }
          });
          
          setSpeakerPreviews(newPreviews);
          setSpeakerFileNames(newFileNames);
        }
        break;
        
      case 'delete':
        // Сохраняем значения всех блоков после удаляемого
        const blocksAfterDelete = blocks.slice(blockIndex + 1).map(block => ({...block}));
        
        // Удаляем блок
        remove(blockIndex);
        
        // Обновляем превью и имена файлов
        const newPreviews = { ...speakerPreviews };
        const newFileNames = { ...speakerFileNames };
        
        // Удаляем файлы текущего блока
        blocks[blockIndex].speakers?.forEach((_, speakerIndex) => {
          const key = `${blockIndex}-${speakerIndex}`;
          delete newPreviews[key];
          delete newFileNames[key];
        });
        
        // Обновляем индексы для всех последующих блоков
        blocksAfterDelete.forEach((block, index) => {
          const oldBlockIndex = blockIndex + 1 + index;
          const newBlockIndex = blockIndex + index;
          
          block.speakers?.forEach((_, speakerIndex) => {
            const oldKey = `${oldBlockIndex}-${speakerIndex}`;
            const newKey = `${newBlockIndex}-${speakerIndex}`;
            
            if (newPreviews[oldKey]) {
              newPreviews[newKey] = newPreviews[oldKey];
              delete newPreviews[oldKey];
            }
            
            if (newFileNames[oldKey]) {
              newFileNames[newKey] = newFileNames[oldKey];
              delete newFileNames[oldKey];
            }
          });
        });
        
        setSpeakerPreviews(newPreviews);
        setSpeakerFileNames(newFileNames);
        break;
        
      default:
        break;
    }
    
    // Закрываем меню после выполнения действия
    setActiveBlockMenu(null);
  };

  const removeSpeaker = (blockIndex, speakerIndex) => {
    const currentBlocks = watch("programBlocks") || [];
    const updatedBlocks = [...currentBlocks];
    updatedBlocks[blockIndex].speakers.splice(speakerIndex, 1);
    setValue("programBlocks", updatedBlocks);
  };

  const shouldShowLectureFields = (type) => {
    if (!type) return false;
    // Если тип не входит в предустановленный список blockTypes (кроме "Другое") - значит это пользовательский тип
    const isCustomType = !blockTypes.includes(type) || type === "Другое";
    return ["Доклад", "Мастер-класс"].includes(type) || isCustomType;
  };

  const handleBlockTypeSelect = (type, blockIndex) => {
    if (type === 'Другое') {
      setValue(`programBlocks.${blockIndex}.type`, '');
    } else {
      setValue(`programBlocks.${blockIndex}.type`, type);
    }
    setSelectedBlockType(type);
  };

  const handleSaveDraft = async (data) => {
    const currentValues = getValues();
    const hasAnyData = currentValues.programBlocks?.some(block => 
      block.type || block.startTime || block.endTime || block.title || 
      block.speakers?.some(speaker => 
        speaker.lastName || speaker.firstName || speaker.email || speaker.position
      )
    );

    if (!hasAnyData) {
      showNotification({
        type: 'saveNoData',
        message: 'Ни одно поле в форме не заполнено. Вы уверены, что хотите прекратить заполнение?',
        actions: [
          {
            label: 'Подтвердить',
            type: 'primary',
            onClick: () => {
              navigate('/profile/events');
            }
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
        programBlocks: currentValues.programBlocks || [],
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
      showNotification({
        type: 'saveDraft',
        message: 'Черновик мероприятия успешно сохранен'
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

  const onSubmit = (data) => {
    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors)
        .map(error => error.message)
        .filter(message => message)
        .join('\n');
      
      showNotification({
        type: 'error',
        message: `Пожалуйста, исправьте следующие ошибки:\n${errorMessages}`
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      programBlocks: data.programBlocks
    }));
    onNext(data);
  };

  return (
    <div className="step-wrapper">
      <form className="step-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-section-title">
          <span className="form-section-title-text">Программа мероприятия</span>
      </div>

      {programBlocks.map((block, blockIndex) => {
        const blockType = watch(`programBlocks.${blockIndex}.type`);

        return (
            <div key={blockIndex} className="program-block">
              <div className="block-header">
                <span className="form-subsection-title">
                  Блок {blockIndex + 1} {blockType && `- ${blockType}`}
                </span>
                <div className="block-actions">
                  <button
                    type="button"
                    className="btn-menu"
                    onClick={(e) => {
                      e.stopPropagation(); // Предотвращаем всплытие события
                      setActiveBlockMenu(activeBlockMenu === blockIndex ? null : blockIndex);
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.75 5C8.75 4.82625 8.75 4.73875 8.76 4.66625C8.792 4.43755 8.89765 4.22549 9.06095 4.0622C9.22424 3.8989 9.43629 3.79326 9.665 3.76125C9.73875 3.75125 9.825 3.75125 9.99875 3.75125C10.1725 3.75125 10.2612 3.75125 10.3325 3.76125C10.5612 3.79326 10.7733 3.8989 10.9366 4.0622C11.0998 4.22549 11.2055 4.43755 11.2375 4.66625C11.2475 4.73875 11.2475 4.82625 11.2475 5C11.2475 5.17375 11.2475 5.26125 11.2375 5.33375C11.2055 5.56246 11.0998 5.77451 10.9366 5.9378C10.7733 6.1011 10.5612 6.20675 10.3325 6.23875C10.26 6.24875 10.1725 6.24875 9.99875 6.24875C9.825 6.24875 9.7375 6.24875 9.665 6.23875C9.43629 6.20675 9.22424 6.1011 9.06095 5.9378C8.89765 5.77451 8.792 5.56246 8.76 5.33375C8.75 5.26125 8.75 5.17375 8.75 5ZM8.75 10C8.75 9.82625 8.75 9.73875 8.76 9.66625C8.792 9.43754 8.89765 9.22549 9.06095 9.0622C9.22424 8.8989 9.43629 8.79325 9.665 8.76125C9.73875 8.75125 9.825 8.75125 9.99875 8.75125C10.1725 8.75125 10.2612 8.75125 10.3325 8.76125C10.5612 8.79325 10.7733 8.8989 10.9366 9.0622C11.0998 9.22549 11.2055 9.43754 11.2375 9.66625C11.2475 9.73875 11.2475 9.82625 11.2475 10C11.2475 10.1738 11.2475 10.2613 11.2375 10.3338C11.2055 10.5625 11.0998 10.7745 10.9366 10.9378C10.7733 11.1011 10.5612 11.2067 10.3325 11.2388C10.26 11.2488 10.1725 11.2488 9.99875 11.2488C9.825 11.2488 9.7375 11.2488 9.665 11.2388C9.43629 11.2067 9.22424 11.1011 9.06095 10.9378C8.89765 10.7745 8.792 10.5625 8.76 10.3338C8.75 10.2613 8.75 10.1738 8.75 10ZM8.75 15C8.75 14.8263 8.75 14.7388 8.76 14.6663C8.792 14.4375 8.89765 14.2255 9.06095 14.0622C9.22424 13.8989 9.43629 13.7933 9.665 13.7612C9.73875 13.7512 9.825 13.7513 9.99875 13.7513C10.1725 13.7513 10.2612 13.7512 10.3325 13.7612C10.5612 13.7933 10.7733 13.8989 10.9366 14.0622C11.0998 14.2255 11.2055 14.4375 11.2375 14.6663C11.2475 14.7388 11.2475 14.8263 11.2475 15C11.2475 15.1738 11.2475 15.2613 11.2375 15.335C11.2055 15.5637 11.0998 15.7758 10.9366 15.9391C10.7733 16.1023 10.5612 16.208 10.3325 16.24C10.26 16.25 10.1725 16.25 10 16.25C9.8275 16.25 9.73875 16.25 9.66625 16.24C9.43754 16.208 9.22549 16.1023 9.0622 15.9391C8.8989 15.7758 8.79325 15.5637 8.76125 15.335C8.75 15.2625 8.75 15.175 8.75 15Z" fill="#73747A"/>
                    </svg>
                  </button>
                  {activeBlockMenu === blockIndex && (
                    <div className="block-menu" ref={menuRef}>
                      <button type="button" onClick={(e) => {
                        e.stopPropagation();
                        handleBlockAction('delete', blockIndex);
                      }}>
                        Удалить блок
                      </button>
                      <button type="button" onClick={(e) => {
                        e.stopPropagation();
                        handleBlockAction('moveUp', blockIndex);
                      }}>
                        Переместить вверх
                      </button>
                      <button type="button" onClick={(e) => {
                        e.stopPropagation();
                        handleBlockAction('moveDown', blockIndex);
                      }}>
                        Переместить вниз
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
              <div className="form-col">
                <div className="form-group">
                    <label htmlFor={`block-type-${blockIndex}`} required>Тип блока</label>
                    <CustomSelect
                      options={blockTypes}
                      value={watch(`programBlocks.${blockIndex}.type`)}
                      onChange={(value) => {
                        setValue(`programBlocks.${blockIndex}.type`, value);
                      }}
                      placeholder="Выберите тип блока"
                      allowCustomInput={true}
                  />
                </div>
              </div>

              <div className="form-col">
                <div className="form-group">
                    <DateTimeField
                      timeOnly={true}
                      onStartTimeChange={(time) => setValue(`programBlocks.${blockIndex}.startTime`, time)}
                      onEndTimeChange={(time) => setValue(`programBlocks.${blockIndex}.endTime`, time)}
                      startTime={watch(`programBlocks.${blockIndex}.startTime`)}
                      endTime={watch(`programBlocks.${blockIndex}.endTime`)}
                      onChange={() => {}}
                    />
                  </div>
              </div>
            </div>

              {shouldShowLectureFields(blockType) && (
              <div className="form-section">
                <div className="form-group">
                    <label htmlFor={`title-${blockIndex}`} required>Название</label>
                  <input 
                    id={`title-${blockIndex}`}
                      placeholder="Эмоциональный интеллект в практике работы PM-а"
                    {...register(`programBlocks.${blockIndex}.title`)} 
                  />
                </div>

                  <div className="form-row">
                    <div className="form-col">
                <div className="form-group">
                        <div className="label-with-icon">
                          <label htmlFor={`description-${blockIndex}`}>Описание</label>
                          <span className="info-icon" data-tooltip="Опишите основные темы и ключевые моменты доклада, которые будут обсуждаться. Это поможет участникам лучше понять содержание и решить, насколько это им интересно">
                            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8.16602 6.49996H9.83268V4.83329H8.16602M8.99935 15.6666C5.32435 15.6666 2.33268 12.675 2.33268 8.99996C2.33268 5.32496 5.32435 2.33329 8.99935 2.33329C12.6743 2.33329 15.666 5.32496 15.666 8.99996C15.666 12.675 12.6743 15.6666 8.99935 15.6666ZM8.99935 0.666626C7.905 0.666626 6.82137 0.882174 5.81032 1.30096C4.79927 1.71975 3.88061 2.33358 3.10679 3.1074C1.54399 4.67021 0.666016 6.78982 0.666016 8.99996C0.666016 11.2101 1.54399 13.3297 3.10679 14.8925C3.88061 15.6663 4.79927 16.2802 5.81032 16.699C6.82137 17.1177 7.905 17.3333 8.99935 17.3333C11.2095 17.3333 13.3291 16.4553 14.8919 14.8925C16.4547 13.3297 17.3327 11.2101 17.3327 8.99996C17.3327 7.90561 17.1171 6.82198 16.6983 5.81093C16.2796 4.79988 15.6657 3.88122 14.8919 3.1074C14.1181 2.33358 13.1994 1.71975 12.1884 1.30096C11.1773 0.882174 10.0937 0.666626 8.99935 0.666626ZM8.16602 13.1666H9.83268V8.16663H8.16602V13.1666Z" fill="#202022" fillOpacity="0.8"/>
                            </svg>
                          </span>
                </div>
                  <textarea 
                    id={`description-${blockIndex}`}
                          maxLength={400}
                    {...register(`programBlocks.${blockIndex}.description`)} 
                  />
                        <span className="hint">
                          {(watch(`programBlocks.${blockIndex}.description`)?.length || 0)} из 400 символов
                        </span>
                      </div>
                    </div>
                </div>

                <div className="form-section">
                  {watch(`programBlocks.${blockIndex}.speakers`)?.map((_, speakerIndex) => (
                      <div key={speakerIndex} className="form-section speaker-section">
                        <div className="speaker-header">
                          <span>Спикер {speakerIndex + 1}</span>
                          <button
                            type="button"
                            className="btn-remove-speaker"
                            onClick={() => removeSpeaker(blockIndex, speakerIndex)}
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.2452 5.92913C15.5696 5.60466 15.5696 5.07859 15.2452 4.75413C14.9207 4.42966 14.3946 4.42966 14.0702 4.75413L9.99935 8.82496L5.92852 4.75413C5.60405 4.42966 5.07798 4.42966 4.75352 4.75413C4.42905 5.07859 4.42905 5.60466 4.75352 5.92913L8.82435 9.99996L4.75352 14.0708C4.42905 14.3953 4.42905 14.9213 4.75352 15.2458C5.07798 15.5703 5.60405 15.5703 5.92852 15.2458L9.99935 11.175L14.0702 15.2458C14.3946 15.5703 14.9207 15.5703 15.2452 15.2458C15.5696 14.9213 15.5696 14.3953 15.2452 14.0708L11.1743 9.99996L15.2452 5.92913Z" fill="#73747A"/>
                            </svg>
                          </button>
                        </div>

                          <div className="form-group">
                          <label htmlFor={`photo-${blockIndex}-${speakerIndex}`} required>Фотография</label>
                          <div 
                            className="file-upload-area"
                            onClick={() => !speakerPreviews[`${blockIndex}-${speakerIndex}`] && 
                              document.getElementById(`photo-${blockIndex}-${speakerIndex}`).click()}
                            onDrop={(e) => handleDrop(e, blockIndex, speakerIndex)}
                            onDragOver={handleDragOver}
                          >
                            <input 
                              type="file"
                              id={`photo-${blockIndex}-${speakerIndex}`}
                              accept="image/png,image/jpeg"
                              style={{ display: 'none' }}
                              onChange={(e) => handleImageChange(e, blockIndex, speakerIndex)}
                            />
                            {speakerPreviews[`${blockIndex}-${speakerIndex}`] ? (
                              <div className="file-upload-preview">
                                <img 
                                  src={speakerPreviews[`${blockIndex}-${speakerIndex}`]} 
                                  alt="Preview" 
                                  className="file-preview-image" 
                                />
                                <div className="file-preview-info">
                                  <span className="file-preview-name">
                                    {speakerFileNames[`${blockIndex}-${speakerIndex}`]}
                                  </span>
                                  <button 
                                    type="button" 
                                    className="file-preview-remove"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveImage(blockIndex, speakerIndex);
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
                                <span>мин. формат 280х200 px</span>
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-col">
                          <div className="form-group">
                              <label htmlFor={`lastName-${blockIndex}-${speakerIndex}`} required>Фамилия</label>
                            <input 
                              id={`lastName-${blockIndex}-${speakerIndex}`}
                                placeholder="Иванов"
                              {...register(`programBlocks.${blockIndex}.speakers.${speakerIndex}.lastName`)} 
                            />
                          </div>
                        </div>

                        <div className="form-col">
                          <div className="form-group">
                              <label htmlFor={`firstName-${blockIndex}-${speakerIndex}`} required>Имя</label>
                            <input 
                              id={`firstName-${blockIndex}-${speakerIndex}`}
                                placeholder="Иван"
                              {...register(`programBlocks.${blockIndex}.speakers.${speakerIndex}.firstName`)} 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-col">
                          <div className="form-group">
                              <label htmlFor={`email-${blockIndex}-${speakerIndex}`} required>E-mail</label>
                            <input 
                              id={`email-${blockIndex}-${speakerIndex}`}
                              type="email" 
                                placeholder="ivanov_ivan@gmail.com" 
                              {...register(`programBlocks.${blockIndex}.speakers.${speakerIndex}.email`)} 
                            />
                          </div>
                        </div>

                        <div className="form-col">
                          <div className="form-group">
                            <label htmlFor={`social-${blockIndex}-${speakerIndex}`}>Соцсети</label>
                            <input 
                              id={`social-${blockIndex}-${speakerIndex}`}
                              type="text" 
                                placeholder="https://www.linkedin.com/in/ivan-ivanov/" 
                              {...register(`programBlocks.${blockIndex}.speakers.${speakerIndex}.social`)} 
                            />
                          </div>
                        </div>
                      </div>

                        <div className="form-row">
                          <div className="form-col">
                      <div className="form-group">
                              <label htmlFor={`position-${blockIndex}-${speakerIndex}`} required>Должность</label>
                        <input 
                          id={`position-${blockIndex}-${speakerIndex}`}
                                placeholder="Менеджер в Яндекс"
                          {...register(`programBlocks.${blockIndex}.speakers.${speakerIndex}.position`)} 
                        />
                            </div>
                      </div>

                          <div className="form-col">
                      <div className="form-group">
                              <div className="label-with-icon">
                        <label htmlFor={`about-${blockIndex}-${speakerIndex}`}>О спикере</label>
                                <span className="info-icon" data-tooltip="Добавьте несколько слов о профессиональном опыте, компетенциях или интересах спикера (например, «10 лет в маркетинге», «эксперт по IT-стартапам»)">
                                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.16602 6.49996H9.83268V4.83329H8.16602M8.99935 15.6666C5.32435 15.6666 2.33268 12.675 2.33268 8.99996C2.33268 5.32496 5.32435 2.33329 8.99935 2.33329C12.6743 2.33329 15.666 5.32496 15.666 8.99996C15.666 12.675 12.6743 15.6666 8.99935 15.6666ZM8.99935 0.666626C7.905 0.666626 6.82137 0.882174 5.81032 1.30096C4.79927 1.71975 3.88061 2.33358 3.10679 3.1074C1.54399 4.67021 0.666016 6.78982 0.666016 8.99996C0.666016 11.2101 1.54399 13.3297 3.10679 14.8925C3.88061 15.6663 4.79927 16.2802 5.81032 16.699C6.82137 17.1177 7.905 17.3333 8.99935 17.3333C11.2095 17.3333 13.3291 16.4553 14.8919 14.8925C16.4547 13.3297 17.3327 11.2101 17.3327 8.99996C17.3327 7.90561 17.1171 6.82198 16.6983 5.81093C16.2796 4.79988 15.6657 3.88122 14.8919 3.1074C14.1181 2.33358 13.1994 1.71975 12.1884 1.30096C11.1773 0.882174 10.0937 0.666626 8.99935 0.666626ZM8.16602 13.1666H9.83268V8.16663H8.16602V13.1666Z" fill="#202022" fillOpacity="0.8"/>
                                  </svg>
                                </span>
                              </div>
                              <input 
                          id={`about-${blockIndex}-${speakerIndex}`}
                                type="text"
                                placeholder="Более 10 лет в маркетинге"
                                maxLength={1000}
                          {...register(`programBlocks.${blockIndex}.speakers.${speakerIndex}.about`)} 
                        />
                              <span className="hint">
                                {(watch(`programBlocks.${blockIndex}.speakers.${speakerIndex}.about`)?.length || 0)} из 250 символов
                              </span>
                            </div>
                          </div>
                        </div>
                    </div>
                  ))}

                    <button type="button" className="btn-addSpeaker" onClick={() => addSpeaker(blockIndex)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12C19 12.5523 18.5523 13 18 13H13V18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18V13H6C5.44772 13 5 12.5523 5 12C5 11.4477 5.44772 11 6 11H11V6C11 5.44772 11.4477 5 12 5C12.5523 5 13 5.44772 13 6V11H18C18.5523 11 19 11.4477 19 12Z" fill="currentColor"/>
                    </svg>
                      Добавить спикера
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

        <button type="button" className="btn-addBlok" onClick={addProgramBlock}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12C19 12.5523 18.5523 13 18 13H13V18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18V13H6C5.44772 13 5 12.5523 5 12C5 11.4477 5.44772 11 6 11H11V6C11 5.44772 11.4477 5 12 5C12.5523 5 13 5.44772 13 6V11H18C18.5523 11 19 11.4477 19 12Z" fill="currentColor"/>
          </svg>
          Добавить блок программы
      </button>
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

export default StepTwo;