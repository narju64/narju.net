import { WordPronunciation } from '../types/phonetic';

// CMUdict data structure
interface CMUdictEntry {
  word: string;
  pronunciations: string[];
  defaultIndex: number;
}

// In-memory CMUdict storage
let cmudictData: Map<string, CMUdictEntry> = new Map();
let isLoaded = false;

// Load CMUdict from the bundled file
export async function loadCMUdict(): Promise<void> {
  if (isLoaded) return;

  try {
    // Load the CMUdict file
    const response = await fetch('/data/cmudict.txt');
    if (!response.ok) {
      throw new Error(`Failed to load CMUdict: ${response.statusText}`);
    }

    const text = await response.text();
    const lines = text.split('\n');

    // Parse CMUdict entries
    for (const line of lines) {
      if (!line.trim() || line.startsWith(';;;')) continue;

      const parts = line.split(/\s+/);
      if (parts.length < 2) continue;

      const word = parts[0].toLowerCase();
      const pronunciation = parts.slice(1).join(' ');

      // Handle multiple pronunciations for the same word
      if (cmudictData.has(word)) {
        const existing = cmudictData.get(word)!;
        existing.pronunciations.push(pronunciation);
      } else {
        cmudictData.set(word, {
          word,
          pronunciations: [pronunciation],
          defaultIndex: 0
        });
      }
    }

    isLoaded = true;
    console.log(`CMUdict loaded: ${cmudictData.size} words`);
  } catch (error) {
    console.error('Error loading CMUdict:', error);
    throw error;
  }
}

// Get word pronunciations from CMUdict
export function getWordPronunciations(word: string): WordPronunciation | null {
  if (!isLoaded) {
    throw new Error('CMUdict not loaded. Call loadCMUdict() first.');
  }

  const cleanWord = word.toLowerCase().trim();
  const entry = cmudictData.get(cleanWord);

  if (!entry) {
    return null;
  }

  return {
    word: entry.word,
    pronunciations: entry.pronunciations,
    defaultIndex: entry.defaultIndex
  };
}

// Get default pronunciation for a word
export function getDefaultPronunciation(word: string): string | null {
  const pronunciations = getWordPronunciations(word);
  if (!pronunciations || pronunciations.pronunciations.length === 0) {
    return null;
  }

  return pronunciations.pronunciations[pronunciations.defaultIndex];
}

// Get specific pronunciation by index
export function getPronunciationByIndex(word: string, index: number): string | null {
  const pronunciations = getWordPronunciations(word);
  if (!pronunciations || index >= pronunciations.pronunciations.length) {
    return null;
  }

  return pronunciations.pronunciations[index];
}

// Check if a word exists in CMUdict
export function hasWord(word: string): boolean {
  if (!isLoaded) {
    throw new Error('CMUdict not loaded. Call loadCMUdict() first.');
  }

  return cmudictData.has(word.toLowerCase().trim());
}

// Get all words in CMUdict (for debugging/testing)
export function getAllWords(): string[] {
  if (!isLoaded) {
    throw new Error('CMUdict not loaded. Call loadCMUdict() first.');
  }

  return Array.from(cmudictData.keys());
}

// Get CMUdict statistics
export function getCMUdictStats(): { totalWords: number; totalPronunciations: number } {
  if (!isLoaded) {
    throw new Error('CMUdict not loaded. Call loadCMUdict() first.');
  }

  let totalPronunciations = 0;
  cmudictData.forEach(entry => {
    totalPronunciations += entry.pronunciations.length;
  });

  return {
    totalWords: cmudictData.size,
    totalPronunciations
  };
}

// Add custom word to CMUdict (for future enhancements)
export function addCustomWord(word: string, pronunciation: string): void {
  if (!isLoaded) {
    throw new Error('CMUdict not loaded. Call loadCMUdict() first.');
  }

  const cleanWord = word.toLowerCase().trim();
  
  if (cmudictData.has(cleanWord)) {
    const existing = cmudictData.get(cleanWord)!;
    existing.pronunciations.push(pronunciation);
  } else {
    cmudictData.set(cleanWord, {
      word: cleanWord,
      pronunciations: [pronunciation],
      defaultIndex: 0
    });
  }
}

// Remove custom word from CMUdict
export function removeCustomWord(word: string): boolean {
  if (!isLoaded) {
    throw new Error('CMUdict not loaded. Call loadCMUdict() first.');
  }

  return cmudictData.delete(word.toLowerCase().trim());
}

// Export CMUdict data (for debugging/testing)
export function exportCMUdictData(): Map<string, CMUdictEntry> {
  if (!isLoaded) {
    throw new Error('CMUdict not loaded. Call loadCMUdict() first.');
  }

  return new Map(cmudictData);
} 