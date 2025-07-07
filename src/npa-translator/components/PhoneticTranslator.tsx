import React, { useState, useEffect, useRef } from 'react';
import { usePhoneticContext } from '../context/PhoneticContext';
import { translationEngine } from '../utils/translationEngine';
import { TranslationResult } from '../types/phonetic';
import './PhoneticTranslator.css';

interface PhoneticTranslatorProps {
  className?: string;
}

export function PhoneticTranslator({ className = '' }: PhoneticTranslatorProps) {
  const { getWordPronunciations } = usePhoneticContext();
  
  // State
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordPronunciations, setWordPronunciations] = useState<string[]>([]);
  const [selectedPronunciation, setSelectedPronunciation] = useState<number>(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showCharacterGuide, setShowCharacterGuide] = useState(false);
  
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
  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    try {
      const result = await translationEngine.translateToNPA(inputText);
      setOutputText(result.npa);
      setTranslationResult(result);
      
      // Auto-resize output
      if (outputRef.current) {
        autoResize(outputRef.current);
      }
    } catch (error) {
      console.error('Translation failed:', error);
      setOutputText('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Handle word selection for pronunciation
  const handleWordClick = async (word: string) => {
    setSelectedWord(word);
    try {
      const pronunciations = await getWordPronunciations(word);
      setWordPronunciations(pronunciations);
      setSelectedPronunciation(0);
    } catch (error) {
      console.error('Failed to get pronunciations:', error);
      setWordPronunciations([]);
    }
  };

  // Handle pronunciation selection
  const handlePronunciationChange = async (index: number) => {
    if (!selectedWord) return;
    
    setSelectedPronunciation(index);
    try {
      await translationEngine.translateWordWithPronunciation(selectedWord, index);
      
      // Update the output text with the new pronunciation
      if (translationResult) {
        const updatedResult = await translationEngine.translateToNPA(inputText);
        setOutputText(updatedResult.npa);
        setTranslationResult(updatedResult);
      }
    } catch (error) {
      console.error('Failed to translate with pronunciation:', error);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!outputText) return;
    
    try {
      await navigator.clipboard.writeText(outputText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  // Clear all
  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setTranslationResult(null);
    setSelectedWord(null);
    setWordPronunciations([]);
    setSelectedPronunciation(0);
    
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    if (outputRef.current) {
      outputRef.current.style.height = 'auto';
    }
  };

  // Auto-translate on input (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputText.trim()) {
        handleTranslate();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [inputText]);

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
          disabled={isTranslating}
        />
      </div>

      {/* Controls */}
      <div className="translator-controls">
        <button
          className="translator-button"
          onClick={handleTranslate}
          disabled={!inputText.trim() || isTranslating}
        >
          {isTranslating ? 'Translating...' : 'Translate'}
        </button>
        
        <button
          className="translator-button secondary"
          onClick={handleClear}
          disabled={!inputText && !outputText}
        >
          Clear All
        </button>
        
        <button
          className={`copy-button ${copySuccess ? 'copied' : ''}`}
          onClick={handleCopy}
          disabled={!outputText}
        >
          {copySuccess ? 'Copied!' : 'Copy nPA'}
        </button>
        
        <button
          className="translator-button secondary"
          onClick={() => setShowCharacterGuide(!showCharacterGuide)}
        >
          {showCharacterGuide ? 'Hide' : 'Show'} Character Guide
        </button>
      </div>

      {/* Pronunciation Selector */}
      {selectedWord && wordPronunciations.length > 1 && (
        <div className="pronunciation-selector">
          <label htmlFor="pronunciation-select">
            Pronunciation for "{selectedWord}":
          </label>
          <select
            id="pronunciation-select"
            value={selectedPronunciation}
            onChange={(e) => handlePronunciationChange(parseInt(e.target.value))}
          >
            {wordPronunciations.map((pronunciation, index) => (
              <option key={index} value={index}>
                {pronunciation} ({index + 1})
              </option>
            ))}
          </select>
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

      {/* Character Guide */}
      {showCharacterGuide && (
        <div className="npa-character-guide">
          <h3>nPA Character Guide</h3>
          <div className="npa-character-grid">
            {/* R-controlled Vowels */}
            <div className="npa-character-category">
              <h4>R-controlled Vowels</h4>
              <div className="npa-character-list">
                <div className="npa-character-item">
                  <div className="npa-character">R</div>
                  <div className="npa-ipa">ɑr</div>
                  <div className="npa-example">car</div>
                </div>
                <div className="npa-character-item">
                  <div className="npa-character">X</div>
                  <div className="npa-ipa">ɛr</div>
                  <div className="npa-example">air</div>
                </div>
                <div className="npa-character-item">
                  <div className="npa-character">G</div>
                  <div className="npa-ipa">ɪr</div>
                  <div className="npa-example">ear</div>
                </div>
                <div className="npa-character-item">
                  <div className="npa-character">Q</div>
                  <div className="npa-ipa">ɔr/ʊr</div>
                  <div className="npa-example">or/poor</div>
                </div>
                <div className="npa-character-item">
                  <div className="npa-character">H</div>
                  <div className="npa-ipa">ɜr</div>
                  <div className="npa-example">her</div>
                </div>
              </div>
            </div>

            {/* Diphthongs */}
            <div className="npa-character-category">
              <h4>Diphthongs</h4>
              <div className="npa-character-list">
                <div className="npa-character-item">
                  <div className="npa-character">A</div>
                  <div className="npa-ipa">eɪ</div>
                  <div className="npa-example">face</div>
                </div>
                <div className="npa-character-item">
                  <div className="npa-character">I</div>
                  <div className="npa-ipa">aɪ</div>
                  <div className="npa-example">price</div>
                </div>
                <div className="npa-character-item">
                  <div className="npa-character">Y</div>
                  <div className="npa-ipa">ɔɪ</div>
                  <div className="npa-example">boy</div>
                </div>
                <div className="npa-character-item">
                  <div className="npa-character">W</div>
                  <div className="npa-ipa">aʊ</div>
                  <div className="npa-example">mouth</div>
                </div>
                <div className="npa-character-item">
                  <div className="npa-character">O</div>
                  <div className="npa-ipa">oʊ</div>
                  <div className="npa-example">goat</div>
                </div>
              </div>
            </div>

            {/* Vowels */}
            <div className="npa-character-category">
              <h4>Vowels</h4>
              <div className="npa-character-list">
                <div className="npa-character-item">
                  <div className="npa-character">E</div>
                  <div className="npa-ipa">i</div>
                  <div className="npa-example">see</div>
                </div>
                <div className="npa-character-item">
                  <div className="npa-character">i</div>
                  <div className="npa-ipa">ɪ</div>
                  <div className="npa-example">sit</div>
                </div>
                <div className="npa-character-item">
                  <div className="npa-character">e</div>
                  <div className="npa-ipa">e/ɛ</div>
                  <div className="npa-example">bed/bet</div>
                </div>
                <div className="npa-character-item">
                  <div className="npa-character">a</div>
                  <div className="npa-ipa">æ</div>
                  <div className="npa-example">cat</div>
                </div>
                <div className="npa-character-item">
                  <div className="npa-character">o</div>
                  <div className="npa-ipa">ɑ/ɒ</div>
                  <div className="npa-example">father/lot</div>
                </div>
                <div className="npa-character-item">
                  <div className="npa-character">C</div>
                  <div className="npa-ipa">ɔ</div>
                  <div className="npa-example">thought</div>
                </div>
                <div className="npa-character-item">
                  <div className="npa-character">U</div>
                  <div className="npa-ipa">ʊ</div>
                  <div className="npa-example">put</div>
                </div>
                <div className="npa-character-item">
                  <div className="npa-character">u</div>
                  <div className="npa-ipa">u</div>
                  <div className="npa-example">too</div>
                </div>
                <div className="npa-character-item">
                  <div className="npa-character">V</div>
                  <div className="npa-ipa">ʌ/ə</div>
                  <div className="npa-example">cut/about</div>
                </div>
              </div>
            </div>

            {/* Consonants */}
            <div className="npa-character-category">
              <h4>Consonants</h4>
              <div className="npa-character-list">
                <div className="npa-character-item">
                  <div className="npa-character">T</div>
                  <div className="npa-ipa">θ</div>
                  <div className="npa-example">thin</div>
                </div>
                <div className="npa-character-item">
                  <div className="npa-character">D</div>
                  <div className="npa-ipa">ð</div>
                  <div className="npa-example">this</div>
                </div>
                <div className="npa-character-item">
                  <div className="npa-character">S</div>
                  <div className="npa-ipa">ʃ</div>
                  <div className="npa-example">ship</div>
                </div>
                <div className="npa-character-item">
                  <div className="npa-character">J</div>
                  <div className="npa-ipa">ʒ</div>
                  <div className="npa-example">vision</div>
                </div>
                <div className="npa-character-item">
                  <div className="npa-character">c</div>
                  <div className="npa-ipa">tʃ</div>
                  <div className="npa-example">chair</div>
                </div>
                <div className="npa-character-item">
                  <div className="npa-character">j</div>
                  <div className="npa-ipa">dʒ</div>
                  <div className="npa-example">jam</div>
                </div>
                <div className="npa-character-item">
                  <div className="npa-character">N</div>
                  <div className="npa-ipa">ŋ</div>
                  <div className="npa-example">sing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 