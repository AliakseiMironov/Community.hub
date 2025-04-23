import React, { useState, useRef, useEffect } from 'react';
import './TagsInput.css'

const popularTags = [
  // Языки и технологии
  "JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "PHP", "C#", "Kotlin", "Dart", "Swift",
  // Фронтенд
  "React", "Vue", "Angular", "Svelte", "HTML", "CSS", "TailwindCSS", "Next.js", "Nuxt", "Vite", "Webpack",
  // Бэкенд
  "Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot", "Laravel", "Ruby on Rails",
  // DevOps / Cloud
  "Docker", "Kubernetes", "CI/CD", "GitHub Actions", "AWS", "Azure", "Google Cloud", "Terraform", "Ansible",
  // Data / AI
  "Machine Learning", "AI", "Data Science", "Pandas", "NumPy", "TensorFlow", "PyTorch", "LLM", "ChatGPT", "OpenAI",
  // Безопасность
  "Cybersecurity", "Ethical Hacking", "CTF", "OWASP", "Pentest", "DevSecOps",
  // Инструменты и подходы
  "Git", "GitHub", "GitLab", "VSCode", "Agile", "Scrum", "TDD", "Clean Code", "Design Patterns",
  // UI/UX
  "Figma", "UX", "UI", "Accessibility", "Design Systems", "Motion Design",
  // Комьюнити / Общее
  "Hackathon", "Open Source", "Startup", "Soft Skills", "Career", "Remote Work", "Meetups", "Networking"
];

const CheckboxChecked = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.33333 12.1667L2.16667 8L3.34167 6.81667L6.33333 9.80833L12.6583 3.48333L13.8333 4.66667M13.8333 0.5H2.16667C1.24167 0.5 0.5 1.24167 0.5 2.16667V13.8333C0.5 14.2754 0.675595 14.6993 0.988155 15.0118C1.30072 15.3244 1.72464 15.5 2.16667 15.5H13.8333C14.2754 15.5 14.6993 15.3244 15.0118 15.0118C15.3244 14.6993 15.5 14.2754 15.5 13.8333V2.16667C15.5 1.72464 15.3244 1.30072 15.0118 0.988155C14.6993 0.675595 14.2754 0.5 13.8333 0.5Z" fill="#202022"/>
    </svg>
    
);

const CheckboxUnchecked = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" width="15" height="15" rx="3.5" fill="white"/>
    <rect x="0.5" y="0.5" width="15" height="15" rx="3.5" stroke="#C7C7CC"/>
  </svg>
);

const TagsInput = ({ value = [], onChange, error }) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [customTag, setCustomTag] = useState(null);
  const [recentlyAddedCustomTag, setRecentlyAddedCustomTag] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setRecentlyAddedCustomTag(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const input = e.target.value;
    setInputValue(input);
    setRecentlyAddedCustomTag(false);

    if (input.trim()) {
      // Фильтруем теги, исключая уже выбранные
      const filtered = popularTags.filter(tag => 
        tag.toLowerCase().includes(input.toLowerCase()) && 
        !value.includes(tag)
      );
      setSuggestions(filtered);
      
      if (filtered.length === 0) {
        // Проверяем, не существует ли уже такой тег
        const customTagValue = input.trim();
        if (!value.includes(customTagValue) && !recentlyAddedCustomTag) {
          setCustomTag(customTagValue);
        } else {
          setCustomTag(null);
        }
      } else {
        setCustomTag(null);
      }
    } else {
      setSuggestions([]);
      setCustomTag(null);
    }
  };

  const toggleTag = (tag) => {
    if (value.includes(tag)) {
      onChange(value.filter(t => t !== tag));
    } else {
      onChange([...value, tag]);
      if (!popularTags.includes(tag)) {
        setRecentlyAddedCustomTag(true);
      }
    }
    setInputValue('');
    setSuggestions([]);
    setCustomTag(null);
  };

  const removeTag = (tagToRemove) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      const trimmedInput = inputValue.trim();
      
      // Проверяем, не существует ли уже такой тег
      if (!value.includes(trimmedInput)) {
        if (suggestions.length === 0 && customTag) {
          toggleTag(customTag);
        } else if (suggestions.length === 1) {
          toggleTag(suggestions[0]);
        }
      }
    }
  };

  return (
    <div className="tags-input-container" ref={containerRef}>
      <div 
        className={`tags-input ${error ? 'input-error' : ''}`}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        <div className="tags-list">
          {value.length > 0 ? (
            value.map((tag, index) => (
              <div key={index} className="tag">
                <span>{tag}</span>
                <button 
                  type="button" 
                  className="tag-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(tag);
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.295 2.115C13.6844 1.72564 13.6844 1.09436 13.295 0.705C12.9056 0.315639 12.2744 0.315639 11.885 0.705L7 5.59L2.115 0.705C1.72564 0.315639 1.09436 0.315639 0.705 0.705C0.315639 1.09436 0.315639 1.72564 0.705 2.115L5.59 7L0.705 11.885C0.315639 12.2744 0.315639 12.9056 0.705 13.295C1.09436 13.6844 1.72564 13.6844 2.115 13.295L7 8.41L11.885 13.295C12.2744 13.6844 12.9056 13.6844 13.295 13.295C13.6844 12.9056 13.6844 12.2744 13.295 11.885L8.41 7L13.295 2.115Z" fill="#FFFFFF"/>
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <span className="tags-placeholder">Java</span>
          )}
        </div>
      </div>
      <div className={`tags-dropdown ${isOpen ? 'open' : ''}`}>
        <div className="tags-search">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Введите название тега"
          />
        </div>
        <div className="tags-dropdown-content">
          {(suggestions.length > 0 || (customTag && !recentlyAddedCustomTag)) && (
            <div className="suggestions-list">
              {suggestions.length > 0 && <div className="tags-section-title">Результаты поиска</div>}
              {suggestions.map((tag, index) => (
                <div
                  key={index}
                  className="tag-suggestion"
                  onClick={() => toggleTag(tag)}
                >
                  <div className="checkbox-wrapper">
                    <CheckboxUnchecked />
                  </div>
                  <span>{tag}</span>
                </div>
              ))}
              {customTag && suggestions.length === 0 && !recentlyAddedCustomTag && (
                <div
                  className="tag-suggestion custom"
                  onClick={() => toggleTag(customTag)}
                >
                  <div className="checkbox-wrapper">
                    <CheckboxUnchecked />
                  </div>
                  <span>Создать тег "{customTag}"</span>
                </div>
              )}
            </div>
          )}
          {value.length > 0 && (
            <div className="selected-tags">
              <div className="tags-section-title">Выбранные теги</div>
              {value.map((tag, index) => (
                <div 
                  key={index} 
                  className="tag-suggestion selected"
                  onClick={() => toggleTag(tag)}
                >
                  <div className="checkbox-wrapper">
                    <CheckboxChecked />
                  </div>
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagsInput;