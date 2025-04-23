import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './DateTimeField.css'

const Calendar = ({ selectedDate, onDateSelect, onClose }) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [displayDate, setDisplayDate] = useState(new Date());
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  const months = [
    'Янв', 'Фев', 'Март', 'Апр', 'Май', 'Июнь',
    'Июль', 'Авг', 'Сент', 'Окт', 'Нояб', 'Дек'
  ];

  const monthsFull = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.calendar-month') && !event.target.closest('.calendar-year')) {
        setIsMonthDropdownOpen(false);
        setIsYearDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Получаем день недели для первого дня месяца (0 - воскресенье, 1 - понедельник, ..., 6 - суббота)
    let firstDayOfWeek = firstDay.getDay();
    // Преобразуем в формат, где 0 - понедельник, 6 - воскресенье
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const days = [];
    
    // Добавляем дни предыдущего месяца
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      const day = prevMonthDays - firstDayOfWeek + i + 1;
      days.push({
        date: new Date(year, month - 1, day),
        isCurrentMonth: false,
        isToday: isToday(new Date(year, month - 1, day)),
        isSelected: isSelected(new Date(year, month - 1, day))
      });
    }
    
    // Добавляем дни текущего месяца
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        isToday: isToday(new Date(year, month, i)),
        isSelected: isSelected(new Date(year, month, i))
      });
    }
    
    // Добавляем дни следующего месяца
    const totalDays = Math.ceil(days.length / 7) * 7; // Округляем до полных недель
    const remainingDays = totalDays - days.length;
    const nextMonth = new Date(year, month + 1, 1);
    
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i);
      days.push({
        date: nextMonthDate,
        isCurrentMonth: false,
        isToday: isToday(nextMonthDate),
        isSelected: isSelected(nextMonthDate)
      });
    }
    
    return days;
  };

  const handlePrevMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1));
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1));
  };

  const handlePrevYear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDisplayDate(new Date(displayDate.getFullYear() - 1, displayDate.getMonth()));
  };

  const handleNextYear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDisplayDate(new Date(displayDate.getFullYear() + 1, displayDate.getMonth()));
  };

  const handleMonthSelect = (monthIndex) => {
    setDisplayDate(new Date(displayDate.getFullYear(), monthIndex));
    setIsMonthDropdownOpen(false);
  };

  const handleYearSelect = (year) => {
    setDisplayDate(new Date(year, displayDate.getMonth()));
    setIsYearDropdownOpen(false);
  };

  const handleDayClick = (date, e) => {
    e.preventDefault();
    if (!date.isCurrentMonth) return;
    setCurrentDate(date.date);
    onDateSelect(date.date);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    return currentDate &&
      date.getDate() === currentDate.getDate() &&
      date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear();
  };

  const days = getDaysInMonth(displayDate);

  return (
    <div className="calendar-dropdown" onClick={(e) => e.stopPropagation()}>
      <div className="calendar-header">
        <div className="calendar-nav">
          <div className="calendar-nav-group">
            <button className="calendar-nav-btn" onClick={handlePrevMonth}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="#202022" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className={`calendar-month ${isMonthDropdownOpen ? 'open' : ''}`} onClick={(e) => {
              e.stopPropagation();
              setIsMonthDropdownOpen(!isMonthDropdownOpen);
              setIsYearDropdownOpen(false);
            }}>
              {months[displayDate.getMonth()]}
              <svg width="10" height="5" viewBox="0 0 10 5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.9987 4.49998L9.16537 0.333313H0.832031L4.9987 4.49998Z" fill="#202022"/>
              </svg>
              {isMonthDropdownOpen && (
                <div className="calendar-month-dropdown">
                  {monthsFull.map((month, index) => (
                    <div
                      key={month}
                      className={`calendar-month-option ${index === displayDate.getMonth() ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMonthSelect(index);
                      }}
                    >
                      {month}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="calendar-nav-btn" onClick={handleNextMonth}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 6L15 12L9 18" stroke="#202022" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="calendar-nav-group">
            <button className="calendar-nav-btn" onClick={handlePrevYear}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="#202022" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className={`calendar-year ${isYearDropdownOpen ? 'open' : ''}`} onClick={(e) => {
              e.stopPropagation();
              setIsYearDropdownOpen(!isYearDropdownOpen);
              setIsMonthDropdownOpen(false);
            }}>
              {displayDate.getFullYear()}
              <svg width="10" height="5" viewBox="0 0 10 5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.9987 4.49998L9.16537 0.333313H0.832031L4.9987 4.49998Z" fill="#202022"/>
              </svg>
              {isYearDropdownOpen && (
                <div className="calendar-year-dropdown">
                  {years.map((year) => (
                    <div
                      key={year}
                      className={`calendar-year-option ${year === displayDate.getFullYear() ? 'selected' : ''}`}
                      onClick={() => handleYearSelect(year)}
                    >
                      {year}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="calendar-nav-btn" onClick={handleNextYear}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 6L15 12L9 18" stroke="#202022" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="calendar-weekdays">
        {weekDays.map((day) => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-days">
        {days.map((day, index) => (
          <button
            key={index}
            className={`calendar-day 
              ${!day.isCurrentMonth ? 'other-month' : ''} 
              ${day.isToday ? 'today' : ''} 
              ${day.isSelected ? 'selected' : ''}`}
            onClick={(e) => handleDayClick(day, e)}
          >
            {day.date.getDate()}
          </button>
        ))}
      </div>

      <div className="calendar-footer">
        <button className="calendar-btn calendar-btn-cancel" onClick={onClose}>
          Закрыть
        </button>
        <button className="calendar-btn calendar-btn-ok" onClick={onClose}>
          ОК
        </button>
      </div>
    </div>
  );
};

const TimePicker = ({ selectedTime, onTimeSelect, onClose }) => {
  const [selectedHour, setSelectedHour] = useState(selectedTime ? parseInt(selectedTime.split(':')[0]) : 0);
  const [selectedMinute, setSelectedMinute] = useState(selectedTime ? parseInt(selectedTime.split(':')[1]) : 0);
  const [showHoursList, setShowHoursList] = useState(false);
  const [showMinutesList, setShowMinutesList] = useState(false);
  const timePickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timePickerRef.current && !timePickerRef.current.contains(event.target)) {
        setShowHoursList(false);
        setShowMinutesList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTimeSelect = (hour, minute) => {
    const newTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    setSelectedHour(hour);
    setSelectedMinute(minute);
    onTimeSelect(newTime);
    setShowHoursList(false);
    setShowMinutesList(false);
  };

  const handleHourClick = (e) => {
    e.stopPropagation();
    setShowHoursList(!showHoursList);
    setShowMinutesList(false);
  };

  const handleMinuteClick = (e) => {
    e.stopPropagation();
    setShowMinutesList(!showMinutesList);
    setShowHoursList(false);
  };

  const handleTimeDropdownClick = (e) => {
    if (e.target === timePickerRef.current) {
      setShowHoursList(false);
      setShowMinutesList(false);
    }
  };

  return (
    <div 
      className="time-dropdown" 
      ref={timePickerRef} 
      onClick={handleTimeDropdownClick}
    >
      <div className="time-header">
        <div 
          className={`time-column ${showHoursList ? 'active' : ''}`} 
          onClick={handleHourClick}
        >
          <div className={`time-value ${showHoursList ? 'active' : ''}`}>
            {selectedHour.toString().padStart(2, '0')}
          </div>
          <div className="time-column-label">Часы</div>
          {showHoursList && (
            <div className="time-list">
              {Array.from({ length: 24 }, (_, hour) => (
                <div
                  key={hour}
                  className={`time-option ${hour === selectedHour ? 'selected' : ''}`}
                  onClick={() => handleTimeSelect(hour, selectedMinute)}
                >
                  {hour.toString().padStart(2, '0')}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="time-separator">:</div>
        <div 
          className={`time-column ${showMinutesList ? 'active' : ''}`} 
          onClick={handleMinuteClick}
        >
          <div className={`time-value ${showMinutesList ? 'active' : ''}`}>
            {selectedMinute.toString().padStart(2, '0')}
          </div>
          <div className="time-column-label">Минуты</div>
          {showMinutesList && (
            <div className="time-list">
              {Array.from({ length: 12 }, (_, i) => {
                const minute = i * 5;
                return (
                  <div
                    key={minute}
                    className={`time-option ${minute === selectedMinute ? 'selected' : ''}`}
                    onClick={() => handleTimeSelect(selectedHour, minute)}
                  >
                    {minute.toString().padStart(2, '0')}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="time-footer">
        <button className="calendar-btn calendar-btn-cancel" onClick={onClose}>
          Закрыть
        </button>
        <button className="calendar-btn calendar-btn-ok" onClick={onClose}>
          ОК
        </button>
      </div>
    </div>
  );
};

const DateTimeField = ({ label, required, value, onChange, onStartTimeChange, onEndTimeChange, errors, timeOnly }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isStartTimePickerOpen, setIsStartTimePickerOpen] = useState(false);
  const [isEndTimePickerOpen, setIsEndTimePickerOpen] = useState(false);
  const [date, setDate] = useState(value ? new Date(value) : null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  const dateInputRef = useRef(null);
  const startTimeInputRef = useRef(null);
  const endTimeInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateInputRef.current && !dateInputRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
      if (startTimeInputRef.current && !startTimeInputRef.current.contains(event.target)) {
        setIsStartTimePickerOpen(false);
      }
      if (endTimeInputRef.current && !endTimeInputRef.current.contains(event.target)) {
        setIsEndTimePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate);
    onChange(selectedDate);
  };

  const handleStartTimeSelect = (time) => {
    setStartTime(time);
    onStartTimeChange(time);
  };

  const handleEndTimeSelect = (time) => {
    setEndTime(time);
    onEndTimeChange(time);
  };

  const formatDate = (date) => {
    if (!date) return '';
    
    const weekDays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                   'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    
    const weekDay = weekDays[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();

    return `${weekDay}, ${day} ${month}${year > currentYear ? ' ' + year : ''}`;
  };

  const handleDateClick = (e) => {
    e.preventDefault();
    setIsCalendarOpen(!isCalendarOpen);
  };

  return (
    <div className="form-group">
      {label && (
        <label>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <div className="form-row">
        {!timeOnly && (
          <div className="form-col date-col">
            <div className="form-group">
              <label htmlFor="date" required>Дата</label>
              <div className="date-input-wrapper" ref={dateInputRef}>
                <input
                  id="date"
                  type="text"
                  className={`date-input ${errors?.date ? 'input-error' : ''}`}
                  value={formatDate(date)}
                  onClick={handleDateClick}
                  readOnly
                  placeholder="Выберите дату"
                />
                <span className="calendar-icon">
                <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 10H6V12H4V10ZM18 4V18C18 19.11 17.11 20 16 20H2C1.46957 20 0.960859 19.7893 0.585786 19.4142C0.210714 19.0391 0 18.5304 0 18V4C0 2.9 0.9 2 2 2H3V0H5V2H13V0H15V2H16C16.5304 2 17.0391 2.21071 17.4142 2.58579C17.7893 2.96086 18 3.46957 18 4ZM2 6H16V4H2V6ZM16 18V8H2V18H16ZM12 12V10H14V12H12ZM8 12V10H10V12H8ZM4 14H6V16H4V14ZM12 16V14H14V16H12ZM8 16V14H10V16H8Z" fill="#202022"/>
                </svg>
                </span>
                {isCalendarOpen && (
                  <Calendar
                    selectedDate={date}
                    onDateSelect={handleDateSelect}
                    onClose={() => setIsCalendarOpen(false)}
                  />
                )}
              </div>
              {errors?.date && <div className="error-message">{errors.date}</div>}
            </div>
          </div>
        )}
        <div className="form-col time-col">
          <div className="time-inputs-container">
            <div className="form-group">
              <label htmlFor="startTime" required>Начало</label>
              <div className="time-input-wrapper" ref={startTimeInputRef}>
                <input
                  id="startTime"
                  type="text"
                  className={`time-input ${errors?.startTime ? 'input-error' : ''}`}
                  value={startTime}
                  onClick={() => setIsStartTimePickerOpen(!isStartTimePickerOpen)}
                  readOnly
                  placeholder="00:00"
                />
                <span className="time-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 18C14.4 18 18 14.4 18 10C18 5.6 14.4 2 10 2C5.6 2 2 5.6 2 10C2 14.4 5.6 18 10 18ZM10 0C15.5 0 20 4.5 20 10C20 15.5 15.5 20 10 20C4.5 20 0 15.5 0 10C0 4.5 4.5 0 10 0ZM13.3 14.2L12 15L9 9.8V5H10.5V9.4L13.3 14.2Z" fill="#202022"/>
                </svg>
                </span>
                {isStartTimePickerOpen && (
                  <TimePicker
                    selectedTime={startTime}
                    onTimeSelect={handleStartTimeSelect}
                    onClose={() => setIsStartTimePickerOpen(false)}
                  />
                )}
              </div>
              {errors?.startTime && <div className="error-message">{errors.startTime}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="endTime" required>Окончание</label>
              <div className="time-input-wrapper" ref={endTimeInputRef}>
                <input
                  id="endTime"
                  type="text"
                  className={`time-input ${errors?.endTime ? 'input-error' : ''}`}
                  value={endTime}
                  onClick={() => setIsEndTimePickerOpen(!isEndTimePickerOpen)}
                  readOnly
                  placeholder="00:00"
                />
                <span className="time-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 18C14.4 18 18 14.4 18 10C18 5.6 14.4 2 10 2C5.6 2 2 5.6 2 10C2 14.4 5.6 18 10 18ZM10 0C15.5 0 20 4.5 20 10C20 15.5 15.5 20 10 20C4.5 20 0 15.5 0 10C0 4.5 4.5 0 10 0ZM13.3 14.2L12 15L9 9.8V5H10.5V9.4L13.3 14.2Z" fill="#202022"/>
                </svg>
                </span>
                {isEndTimePickerOpen && (
                  <TimePicker
                    selectedTime={endTime}
                    onTimeSelect={handleEndTimeSelect}
                    onClose={() => setIsEndTimePickerOpen(false)}
                  />
                )}
              </div>
              {errors?.endTime && <div className="error-message">{errors.endTime}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Calendar.propTypes = {
  selectedDate: PropTypes.instanceOf(Date),
  onDateSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

TimePicker.propTypes = {
  selectedTime: PropTypes.string,
  onTimeSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

DateTimeField.propTypes = {
  label: PropTypes.string,
  required: PropTypes.bool,
  value: PropTypes.instanceOf(Date),
  onChange: PropTypes.func.isRequired,
  onStartTimeChange: PropTypes.func.isRequired,
  onEndTimeChange: PropTypes.func.isRequired,
  timeOnly: PropTypes.bool,
  errors: PropTypes.shape({
    date: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string
  })
};

export default DateTimeField; 