import React, { useState, useEffect, useRef, useCallback } from 'react';

import { translationEngine } from '../utils/translationEngine';
import { TranslationResult, PronunciationVariation } from '../types/phonetic';
import { PronunciationSelector } from './PronunciationSelector';
import { PronunciationEditor } from './PronunciationEditor';
import { addWordToDictionary } from '../utils/dictionaryLogger';
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
  
  // State for pronunciation editor
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingWord, setEditingWord] = useState('');
  
  // State for pending dictionary changes
  const [pendingWords, setPendingWords] = useState<string[]>([]);
  
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
    // Check if this is an unknown word
    if (translationResult && translationResult.unknownWords.includes(word)) {
      // Open pronunciation editor for unknown words
      setEditingWord(word);
      setEditorOpen(true);
    } else {
      // Toggle selection for words with multiple pronunciations
      setSelectedWords(prev => {
        const newSet = new Set(prev);
        if (newSet.has(word)) {
          newSet.delete(word);
        } else {
          newSet.add(word);
        }
        return newSet;
      });
    }
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

  // Fetch pending words from DictionaryChanges.txt
  const fetchPendingWords = useCallback(async () => {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return; // Only fetch in development
    }
    
    try {
      const response = await fetch('/DictionaryChanges.txt');
      if (!response.ok) {
        setPendingWords([]);
        return;
      }
      
      const content = await response.text();
      const lines = content.split('\n').filter(line => line.trim());
      
      const words = lines
        .map(line => {
          const parts = line.split('|');
          if (parts[0] === 'ADD' && parts[1]) {
            return parts[1]; // Return the word
          }
          return null;
        })
        .filter((word): word is string => word !== null);
      
      setPendingWords(words);
    } catch (error) {
      console.warn('Could not fetch pending words:', error);
      setPendingWords([]);
    }
  }, []);

  // Fetch pending words on component mount and after adding new words
  useEffect(() => {
    fetchPendingWords();
  }, [fetchPendingWords]);

  // Handle pronunciation editor submission
  const handlePronunciationSubmit = async (word: string, arpabet: string, npa: string) => {
    try {
      await addWordToDictionary(word, arpabet, npa);
      console.log(`Pronunciation for "${word}" has been logged for review.`);
      // Refresh pending words after adding
      fetchPendingWords();
    } catch (error) {
      console.error('Failed to log dictionary change:', error);
    }
  };

  // Handle applying dictionary changes
  const handleApplyDictionaryChanges = async () => {
    try {
      const response = await fetch('/api/apply-dictionary-changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Dictionary changes applied successfully:', result.output);
        alert('Dictionary changes applied successfully!');
        // Clear pending words and re-translate
        setPendingWords([]);
        if (inputText.trim()) {
          handleTranslate();
        }
      } else {
        console.error('Failed to apply dictionary changes:', result.error);
        alert(`Failed to apply dictionary changes: ${result.error}`);
      }
    } catch (error) {
      console.error('Error applying dictionary changes:', error);
      alert('Error applying dictionary changes. Check console for details.');
    }
  };

  // Render text with highlighted words that have multiple pronunciations
  const renderTextWithHighlights = (text: string) => {
    if (!text.trim()) return null;

    const words = text.split(/(\s+)/); // Split by whitespace but keep the spaces
    
    return words.map((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[^\w'-]/g, '');
      
      // Check if word has multiple pronunciations
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
      
      // Check if word is unknown (in translation result)
      if (translationResult && translationResult.unknownWords.includes(cleanWord)) {
        const isSelected = selectedWords.has(cleanWord);
        return (
          <span
            key={index}
            className={`unknown-word ${isSelected ? 'selected' : ''}`}
            onClick={() => handleWordClick(cleanWord)}
            title={`Click to ${isSelected ? 'deselect' : 'select'} unknown word "${cleanWord}"`}
          >
            [{word}]
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

      {/* Apply Dictionary Changes Button (Development Only) */}
      {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
        <div className="translator-section">
          <div className="apply-changes-container">
            <button
              className="translator-button primary apply-changes"
              onClick={handleApplyDictionaryChanges}
              title="Apply pending dictionary changes to CMUdict"
            >
              Apply Dictionary Changes
            </button>
            
            {/* Pending Dictionary Changes */}
            {pendingWords.length > 0 && (
              <div className="pending-words">
                <span className="pending-label">Pending: </span>
                <span className="pending-list">
                  {pendingWords.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pronunciation Editor */}
      <PronunciationEditor
        word={editingWord}
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSubmit={handlePronunciationSubmit}
      />

    </div>
  );
} 