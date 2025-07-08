
import { PhoneticTranslator } from './components/PhoneticTranslator';
import './components/PhoneticTranslator.css';

export function PhoneticAlphabetPage() {
  return (
    <div className="phonetic-alphabet-page">
      <div className="container">
        {/* Header */}
        <header className="page-header">
          <div className="header-content">
            <h1>nPA Translator</h1>
            <p>Translate English text into narju's Phonetic Alphabet</p>
          </div>
        </header>

        {/* Main content */}
        <main className="page-content">
          <PhoneticTranslator />
        </main>

        {/* Footer with information */}
        <footer className="page-footer">
          <div className="footer-content">
            <h3>About nPA</h3>
            <p>
              nPA (narju's Phonetic Alphabet) is a custom phonetic system designed to capture 
              pronunciation exactly as words sound, using a unique character for each distinct 
              phonetic sound. It's like IPA but easier to read and use.
            </p>
            
            <h4>Features</h4>
            <ul>
              <li>47 distinct phonetic sounds mapped to single characters</li>
              <li>Priority-ordered mapping (r-controlled vowels → diphthongs → individual sounds)</li>
              <li>Number and symbol pronunciation conversion</li>
              <li>Multiple pronunciation support</li>
              <li>Unknown word handling with bracket notation</li>
              <li>Site-wide translation toggle</li>
            </ul>

            <h4>Applications</h4>
            <ul>
              <li>English language learning and pronunciation training</li>
              <li>Poetry and rap lyric analysis</li>
              <li>Phonetic pattern visualization</li>
              <li>Creative writing and spoken word</li>
              <li>Future conlang development</li>
            </ul>
          </div>
        </footer>
      </div>
    </div>
  );
} 