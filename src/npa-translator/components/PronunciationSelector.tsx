import { useState, useRef, useEffect } from 'react';
import { PronunciationVariation } from '../types/phonetic';
import './PronunciationSelector.css';

interface PronunciationSelectorProps {
  word: string;
  variations: PronunciationVariation[];
  selectedIndex: number;
  onSelectionChange: (index: number) => void;
  className?: string;
}

export function PronunciationSelector({
  word,
  variations,
  selectedIndex,
  onSelectionChange,
  className = ''
}: PronunciationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  if (variations.length <= 1) {
    return null; // Don't show selector if there's only one pronunciation
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (index: number) => {
    onSelectionChange(index);
    setIsOpen(false);
  };

  return (
    <div className={`pronunciation-selector ${className}`}>
      <label className="pronunciation-label">
        Pronunciation for "{word}":
      </label>
      <div className="custom-dropdown" ref={dropdownRef}>
        <button
          className="dropdown-button"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <span className="selected-npa">{variations[selectedIndex].npa}</span>
          <span className="dropdown-arrow">▼</span>
        </button>
        {isOpen && (
          <div className="dropdown-options">
            {variations.map((variation, index) => (
              <button
                key={index}
                className={`dropdown-option ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleOptionClick(index)}
                type="button"
              >
                {variation.npa}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
} 