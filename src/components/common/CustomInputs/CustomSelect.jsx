import React, { useState, useRef, useEffect } from 'react';
import './CustomSelect.css'

const CustomSelect = ({ options, value, onChange, placeholder, error, allowCustomInput }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [selectedValue, setSelectedValue] = useState(value || '');
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    if (typeof option === 'object') {
      setSelectedValue(option.label);
      onChange(option.value);
    } else {
      setSelectedValue(option);
      onChange(option);
    }
    setIsOpen(false);
  };

  const handleCustomInput = (e) => {
    const value = e.target.value;
    setCustomValue(value);
    setSelectedValue(value);
    onChange(value);
  };

  const getDisplayValue = () => {
    if (!selectedValue) return placeholder;
    if (typeof selectedValue === 'object') return selectedValue.label;
    if (options.some(opt => typeof opt === 'object' && opt.value === selectedValue)) {
      return options.find(opt => opt.value === selectedValue).label;
    }
    return selectedValue;
  };

  return (
    <div className={`custom-select ${isOpen ? 'open' : ''} ${error ? 'custom-input-error' : ''} ${selectedValue ? 'has-value' : ''}`} ref={selectRef}>
      <div 
        className={`custom-select-header ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedValue ? getDisplayValue() : placeholder}</span>
        <span className="custom-select-arrow">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.94 5.72668L8 8.78002L11.06 5.72668L12 6.66668L8 10.6667L4 6.66668L4.94 5.72668Z" fill="#73747A"/>
          </svg>
        </span>
      </div>
      {isOpen && (
        <div className="custom-select-options">
          {options.map((option, index) => (
            <div
              key={index}
              className={`custom-select-option ${
                (typeof option === 'object' ? option.value === selectedValue : option === selectedValue) 
                  ? 'selected' 
                  : ''
              }`}
              onClick={() => handleSelect(option)}
            >
              {typeof option === 'object' ? option.label : option}
            </div>
          ))}
          {allowCustomInput && (
            <div className="custom-select-custom-input">
              <input
                type="text"
                value={customValue}
                onChange={handleCustomInput}
                placeholder="Свой вариант"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect; 