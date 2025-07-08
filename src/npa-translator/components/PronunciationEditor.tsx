import { useState, useEffect } from 'react';
import { npaToArpabet } from '../utils/npaMapping';
import './PronunciationEditor.css';

interface PronunciationEditorProps {
  word: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (word: string, arpabet: string, npa: string) => void;
}

export function PronunciationEditor({ word, isOpen, onClose, onSubmit }: PronunciationEditorProps) {
  const [npaInput, setNpaInput] = useState('');
  const [arpabetOutput, setArpabetOutput] = useState('');
  const [error, setError] = useState('');

  // Convert nPA to ARPABET when input changes
  useEffect(() => {
    if (npaInput.trim()) {
      try {
        const arpabet = npaToArpabet(npaInput);
        setArpabetOutput(arpabet);
        setError('');
      } catch (err) {
        setError('Invalid nPA characters detected');
        setArpabetOutput('');
      }
    } else {
      setArpabetOutput('');
      setError('');
    }
  }, [npaInput]);

  const handleSubmit = () => {
    if (!npaInput.trim()) {
      setError('Please enter a pronunciation');
      return;
    }
    if (error) {
      return;
    }
    
    onSubmit(word, arpabetOutput, npaInput);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pronunciation-editor-overlay">
      <div className="pronunciation-editor-modal">
        <div className="editor-header">
          <h3>Add Pronunciation for "{word}"</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="editor-content">
          <div className="input-section">
            <label htmlFor="npa-input" className="editor-label">
              Enter nPA Pronunciation
            </label>
            <input
              id="npa-input"
              type="text"
              value={npaInput}
              onChange={(e) => setNpaInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="e.g., nRJu for 'narju'"
              className="npa-input"
              autoFocus
            />
            {error && <div className="error-message">{error}</div>}
          </div>



          <div className="npa-character-guide">
            <h4>nPA Character Reference</h4>
            <div className="character-grid">
              <div className="character-category">
                <h5>Consonants</h5>
                <div className="character-list">
                  <span><span className="npa-char">p</span> - p (<span className="ipa-char">p</span>)</span>
                  <span><span className="npa-char">b</span> - b (<span className="ipa-char">b</span>)</span>
                  <span><span className="npa-char">t</span> - t (<span className="ipa-char">t</span>)</span>
                  <span><span className="npa-char">d</span> - d (<span className="ipa-char">d</span>)</span>
                  <span><span className="npa-char">k</span> - k (<span className="ipa-char">k</span>)</span>
                  <span><span className="npa-char">g</span> - g (<span className="ipa-char">g</span>)</span>
                  <span><span className="npa-char">f</span> - f (<span className="ipa-char">f</span>)</span>
                  <span><span className="npa-char">v</span> - v (<span className="ipa-char">v</span>)</span>
                  <span><span className="npa-char">s</span> - s (<span className="ipa-char">s</span>)</span>
                  <span><span className="npa-char">z</span> - z (<span className="ipa-char">z</span>)</span>
                  <span><span className="npa-char">h</span> - h (<span className="ipa-char">h</span>)</span>
                  <span><span className="npa-char">m</span> - m (<span className="ipa-char">m</span>)</span>
                  <span><span className="npa-char">n</span> - n (<span className="ipa-char">n</span>)</span>
                  <span><span className="npa-char">l</span> - l (<span className="ipa-char">l</span>)</span>
                  <span><span className="npa-char">r</span> - r (<span className="ipa-char">r</span>)</span>
                  <span><span className="npa-char">y</span> - y (<span className="ipa-char">j</span>)</span>
                  <span><span className="npa-char">w</span> - w (<span className="ipa-char">w</span>)</span>
                </div>
              </div>
              <div className="character-category">
                <h5>Special Consonants</h5>
                <div className="character-list">
                  <span><span className="npa-char">T</span> - T (<span className="ipa-char">θ</span>)</span>
                  <span><span className="npa-char">D</span> - D (<span className="ipa-char">ð</span>)</span>
                  <span><span className="npa-char">S</span> - S (<span className="ipa-char">ʃ</span>)</span>
                  <span><span className="npa-char">J</span> - J (<span className="ipa-char">ʒ</span>)</span>
                  <span><span className="npa-char">c</span> - c (<span className="ipa-char">tʃ</span>)</span>
                  <span><span className="npa-char">j</span> - j (<span className="ipa-char">dʒ</span>)</span>
                  <span><span className="npa-char">N</span> - N (<span className="ipa-char">ŋ</span>)</span>
                </div>
              </div>
              <div className="character-category">
                <h5>Vowels</h5>
                <div className="character-list">
                  <span><span className="npa-char">E</span> - E (<span className="ipa-char">i</span>)</span>
                  <span><span className="npa-char">i</span> - i (<span className="ipa-char">ɪ</span>)</span>
                  <span><span className="npa-char">e</span> - e (<span className="ipa-char">e</span>)</span>
                  <span><span className="npa-char">a</span> - a (<span className="ipa-char">æ</span>)</span>
                  <span><span className="npa-char">o</span> - o (<span className="ipa-char">ɑ</span>)</span>
                  <span><span className="npa-char">C</span> - C (<span className="ipa-char">ɔ</span>)</span>
                  <span><span className="npa-char">U</span> - U (<span className="ipa-char">ʊ</span>)</span>
                  <span><span className="npa-char">u</span> - u (<span className="ipa-char">u</span>)</span>
                  <span><span className="npa-char">V</span> - V (<span className="ipa-char">ʌ</span>)</span>
                </div>
              </div>
              <div className="character-category">
                <h5>Diphthongs</h5>
                <div className="character-list">
                  <span><span className="npa-char">A</span> - A (<span className="ipa-char">eɪ</span>)</span>
                  <span><span className="npa-char">I</span> - I (<span className="ipa-char">aɪ</span>)</span>
                  <span><span className="npa-char">Y</span> - Y (<span className="ipa-char">ɔɪ</span>)</span>
                  <span><span className="npa-char">W</span> - W (<span className="ipa-char">aʊ</span>)</span>
                  <span><span className="npa-char">O</span> - O (<span className="ipa-char">oʊ</span>)</span>
                </div>
              </div>
              <div className="character-category">
                <h5>R-controlled</h5>
                <div className="character-list">
                  <span><span className="npa-char">R</span> - R (<span className="ipa-char">ɑr</span>)</span>
                  <span><span className="npa-char">X</span> - X (<span className="ipa-char">ɛr</span>)</span>
                  <span><span className="npa-char">G</span> - G (<span className="ipa-char">ɪr</span>)</span>
                  <span><span className="npa-char">Q</span> - Q (<span className="ipa-char">ɔr</span>)</span>
                  <span><span className="npa-char">H</span> - H (<span className="ipa-char">ɜr</span>)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="editor-footer">
          <button 
            className="cancel-button" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="submit-button" 
            onClick={handleSubmit}
            disabled={!npaInput.trim() || !!error}
          >
            Add to Dictionary
          </button>
        </div>
      </div>
    </div>
  );
} 