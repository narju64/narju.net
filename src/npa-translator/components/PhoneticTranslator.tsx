import React, { useState, useEffect, useRef, useCallback } from 'react';

import { translationEngine } from '../utils/translationEngine';
import { TranslationResult, PronunciationVariation } from '../types/phonetic';
import { PronunciationSelector } from './PronunciationSelector';
import './PhoneticTranslator.css';

interface PhoneticTranslatorProps {
  className?: string;
}

export function PhoneticTranslator({ className = '' }: PhoneticTranslatorProps) {

  
  // State
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  
  // New state for multiple pronunciation variations
  const [wordVariations, setWordVariations] = useState<Map<string, PronunciationVariation[]>>(new Map());
  const [selectedPronunciations, setSelectedPronunciations] = useState<Map<string, number>>(new Map());
  
  // Refs
  const outputRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const autoResize = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = element.scrollHeight + 'px';
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    autoResize(e.target);
  };

  // Translate text
  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;

    try {
      const result = await translationEngine.translateToNPA(inputText, {
        wordPronunciations: selectedPronunciations
      });
      setOutputText(result.npa);
      setTranslationResult(result);
      
      // Find words with multiple pronunciations
      const newWordVariations = new Map<string, PronunciationVariation[]>();
      const newSelectedPronunciations = new Map<string, number>();
      
      // Extract words from the input text
      const words = inputText.toLowerCase().match(/\b[a-z'-]+\b/g) || [];
      
      for (const word of words) {
        const variations = await translationEngine.getWordNPAVariations(word);
        console.log(`Variations for "${word}":`, variations);
        if (variations.length > 1) {
          newWordVariations.set(word, variations);
          // Set default selection to 0 if not already set
          if (!selectedPronunciations.has(word)) {
            newSelectedPronunciations.set(word, 0);
          } else {
            newSelectedPronunciations.set(word, selectedPronunciations.get(word)!);
          }
        }
      }
      
      setWordVariations(newWordVariations);
      setSelectedPronunciations(newSelectedPronunciations);
      
      // Auto-resize output
      if (outputRef.current) {
        autoResize(outputRef.current);
      }
    } catch (error) {
      console.error('Translation failed:', error);
      setOutputText('Translation failed. Please try again.');
    }
  }, [inputText, selectedPronunciations]);

  // Handle word selection for pronunciation
  const handleWordClick = async (word: string) => {
    setSelectedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(word)) {
        newSet.delete(word);
      } else {
        newSet.add(word);
      }
      return newSet;
    });
  };

  // Handle pronunciation selection for a specific word
  const handlePronunciationChange = async (word: string, index: number) => {
    console.log(`Pronunciation changed for "${word}" to index ${index}`);
    
    const newSelectedPronunciations = new Map(selectedPronunciations);
    newSelectedPronunciations.set(word, index);
    setSelectedPronunciations(newSelectedPronunciations);
    
    // Re-translate with the new pronunciation
    try {
      console.log('Re-translating with pronunciations:', Object.fromEntries(newSelectedPronunciations));
      const result = await translationEngine.translateToNPA(inputText, {
        wordPronunciations: newSelectedPronunciations
      });
      console.log('Translation result:', result.npa);
      setOutputText(result.npa);
      setTranslationResult(result);
    } catch (error) {
      console.error('Failed to translate with pronunciation:', error);
    }
  };



  // Render text with highlighted words that have multiple pronunciations
  const renderTextWithHighlights = (text: string) => {
    if (!text.trim()) return null;

    const words = text.split(/(\s+)/); // Split by whitespace but keep the spaces
    
    return words.map((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[^\w'-]/g, '');
      
      if (wordVariations.has(cleanWord)) {
        const isSelected = selectedWords.has(cleanWord);
        return (
          <span
            key={index}
            className={`highlighted-word ${isSelected ? 'selected' : ''}`}
            onClick={() => handleWordClick(cleanWord)}
            title={`Click to ${isSelected ? 'deselect' : 'select'} pronunciation for "${cleanWord}"`}
          >
            {word}
          </span>
        );
      }
      
      return <span key={index}>{word}</span>;
    });
  };

  // Auto-translate on input (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputText.trim()) {
        handleTranslate();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [inputText, handleTranslate]);

  return (
    <div className={`phonetic-translator ${className}`}>
      <h2>nPA (narju's Phonetic Alphabet) Translator</h2>
      
      {/* Input Section */}
      <div className="translator-section">
        <label htmlFor="input-text" className="translator-label">
          English Text
        </label>
        <textarea
          id="input-text"
          ref={inputRef}
          className="translator-input"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Enter English text to translate to nPA..."

        />
        {/* English Text Preview with highlighted words */}
        {inputText && (
          <div className="translator-section">
            <label className="translator-label">
              Text Preview
            </label>
            <div className="text-preview">
              {renderTextWithHighlights(inputText)}
            </div>
          </div>
        )}
      </div>



      {/* Pronunciation Selectors for Selected Words */}
      {selectedWords.size > 0 && (
        <div className="selected-words-selectors">
          <div className="selectors-header">
            <span className="selectors-title">Selected words with multiple pronunciations:</span>
            <button
              className="translator-button secondary close-all-selectors"
              onClick={() => setSelectedWords(new Set())}
            >
              Clear All
            </button>
          </div>
          <div className="selectors-grid">
            {Array.from(selectedWords).map(word => (
              wordVariations.has(word) && (
                <div key={word} className="word-selector-container">
                  <PronunciationSelector
                    word={word}
                    variations={wordVariations.get(word)!}
                    selectedIndex={selectedPronunciations.get(word) || 0}
                    onSelectionChange={(index) => handlePronunciationChange(word, index)}
                  />
                  <button
                    className="translator-button secondary remove-word"
                    onClick={() => setSelectedWords(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(word);
                      return newSet;
                    })}
                  >
                    ×
                  </button>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* ARPABET Output Section */}
      {translationResult && (
        <div className="translator-section">
          <label htmlFor="arpabet-output" className="translator-label">
            ARPABET Translation
          </label>
          <textarea
            id="arpabet-output"
            className="translator-output"
            value={translationResult.arpabet}
            readOnly
            placeholder="ARPABET translation will appear here..."
          />
        </div>
      )}

      {/* IPA Output Section */}
      {translationResult && (
        <div className="translator-section">
          <label htmlFor="ipa-output" className="translator-label">
            IPA Translation
          </label>
          <textarea
            id="ipa-output"
            className="translator-output"
            value={translationResult.ipa}
            readOnly
            placeholder="IPA translation will appear here..."
          />
        </div>
      )}

      {/* nPA Output Section */}
      <div className="translator-section">
        <label htmlFor="output-text" className="translator-label">
          nPA Translation
        </label>
        <textarea
          id="output-text"
          ref={outputRef}
          className="translator-output npa-text"
          value={outputText}
          readOnly
          placeholder="nPA translation will appear here..."
        />
      </div>

      {/* Translation Statistics */}
      {translationResult && (
        <div className="translator-status info">
          <strong>Translation completed in {translationResult.processingTime.toFixed(2)}ms</strong>
          {translationResult.unknownWords.length > 0 && (
            <div className="unknown-words">
              <h4>Unknown words (wrapped in brackets):</h4>
              <ul>
                {translationResult.unknownWords.map((word, index) => (
                  <li key={index}>
                    <button
                      className="word-link"
                      onClick={() => handleWordClick(word)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#007bff',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        padding: 0,
                        font: 'inherit'
                      }}
                    >
                      {word}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}


    </div>
  );
} 