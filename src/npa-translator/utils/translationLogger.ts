import { FailedTranslation } from '../types/phonetic';

// Logger configuration
const LOGGER_CONFIG = {
  maxEntries: 1000, // Maximum number of failed translations to keep
  storageKey: 'npa-failed-translations',
  logToConsole: true, // Whether to also log to console
};

// Failed translations storage
let failedTranslations: FailedTranslation[] = [];
let isInitialized = false;

// Initialize logger
export function initializeLogger(): void {
  if (isInitialized) return;
  
  loadFailedTranslations();
  isInitialized = true;
}

// Log a failed translation
export function logFailedTranslation(
  word: string, 
  context?: string, 
  attempts: number = 1
): void {
  if (!isInitialized) {
    initializeLogger();
  }

  const timestamp = Date.now();
  
  // Check if word already exists in failed translations
  const existingIndex = failedTranslations.findIndex(entry => entry.word === word);
  
  if (existingIndex >= 0) {
    // Update existing entry
    const existing = failedTranslations[existingIndex];
    existing.attempts += attempts;
    existing.timestamp = timestamp;
    if (context && !existing.context?.includes(context)) {
      existing.context = existing.context ? `${existing.context}, ${context}` : context;
    }
  } else {
    // Add new entry
    const newEntry: FailedTranslation = {
      word,
      context,
      timestamp,
      attempts,
    };
    
    failedTranslations.push(newEntry);
    
    // Limit the number of entries
    if (failedTranslations.length > LOGGER_CONFIG.maxEntries) {
      failedTranslations = failedTranslations.slice(-LOGGER_CONFIG.maxEntries);
    }
  }
  
  // Save to storage
  saveFailedTranslations();
  
  // Log to console if enabled
  if (LOGGER_CONFIG.logToConsole) {
    console.warn(`Failed translation: "${word}"${context ? ` (${context})` : ''} - Attempts: ${attempts}`);
  }
}

// Get all failed translations
export function getFailedTranslations(): FailedTranslation[] {
  if (!isInitialized) {
    initializeLogger();
  }
  
  return [...failedTranslations];
}

// Get failed translations for a specific word
export function getFailedTranslationForWord(word: string): FailedTranslation | null {
  if (!isInitialized) {
    initializeLogger();
  }
  
  return failedTranslations.find(entry => entry.word === word) || null;
}

// Remove a failed translation (when word is successfully added to dictionary)
export function removeFailedTranslation(word: string): boolean {
  if (!isInitialized) {
    initializeLogger();
  }
  
  const index = failedTranslations.findIndex(entry => entry.word === word);
  if (index >= 0) {
    failedTranslations.splice(index, 1);
    saveFailedTranslations();
    return true;
  }
  
  return false;
}

// Clear all failed translations
export function clearFailedTranslations(): void {
  failedTranslations = [];
  saveFailedTranslations();
  

}

// Get failed translations statistics
export function getFailedTranslationStats(): {
  totalFailed: number;
  uniqueWords: number;
  mostAttempted: FailedTranslation[];
  recentFailures: FailedTranslation[];
} {
  if (!isInitialized) {
    initializeLogger();
  }
  
  const totalFailed = failedTranslations.reduce((sum, entry) => sum + entry.attempts, 0);
  const uniqueWords = failedTranslations.length;
  
  // Get most attempted words (top 10)
  const mostAttempted = [...failedTranslations]
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, 10);
  
  // Get recent failures (last 24 hours)
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  const recentFailures = failedTranslations
    .filter(entry => entry.timestamp > oneDayAgo)
    .sort((a, b) => b.timestamp - a.timestamp);
  
  return {
    totalFailed,
    uniqueWords,
    mostAttempted,
    recentFailures,
  };
}

// Export failed translations for analysis
export function exportFailedTranslations(): FailedTranslation[] {
  if (!isInitialized) {
    initializeLogger();
  }
  
  return [...failedTranslations];
}

// Import failed translations (for migration or testing)
export function importFailedTranslations(translations: FailedTranslation[]): void {
  failedTranslations = [...translations];
  saveFailedTranslations();
  

}

// Get failed translations as CSV for export
export function getFailedTranslationsCSV(): string {
  if (!isInitialized) {
    initializeLogger();
  }
  
  const headers = ['Word', 'Context', 'Timestamp', 'Attempts', 'Date'];
  const rows = failedTranslations.map(entry => [
    entry.word,
    entry.context || '',
    entry.timestamp.toString(),
    entry.attempts.toString(),
    new Date(entry.timestamp).toISOString(),
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  return csvContent;
}

// Get failed translations as a formatted text document
export function getFailedTranslationsDocument(): string {
  if (!isInitialized) {
    initializeLogger();
  }
  
  const stats = getFailedTranslationStats();
  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();
  
  let document = `nPA Translator - Failed Translations Report\n`;
  document += `Generated on ${date} at ${time}\n`;
  document += `==========================================\n\n`;
  
  // Summary statistics
  document += `SUMMARY:\n`;
  document += `- Total failed attempts: ${stats.totalFailed}\n`;
  document += `- Unique words: ${stats.uniqueWords}\n`;
  document += `- Recent failures (24h): ${stats.recentFailures.length}\n\n`;
  
  // Most attempted words
  if (stats.mostAttempted.length > 0) {
    document += `MOST ATTEMPTED WORDS:\n`;
    stats.mostAttempted.forEach((entry, index) => {
      document += `${index + 1}. "${entry.word}" - ${entry.attempts} attempts`;
      if (entry.context) {
        document += ` (${entry.context})`;
      }
      document += `\n`;
    });
    document += `\n`;
  }
  
  // All failed translations (sorted by attempts, then alphabetically)
  const sortedTranslations = [...failedTranslations].sort((a, b) => {
    if (b.attempts !== a.attempts) {
      return b.attempts - a.attempts;
    }
    return a.word.localeCompare(b.word);
  });
  
  document += `ALL FAILED TRANSLATIONS:\n`;
  document += `========================\n\n`;
  
  sortedTranslations.forEach((entry, index) => {
    document += `${index + 1}. "${entry.word}"\n`;
    document += `   Attempts: ${entry.attempts}\n`;
    document += `   Date: ${new Date(entry.timestamp).toLocaleDateString()}\n`;
    if (entry.context) {
      document += `   Context: ${entry.context}\n`;
    }
    document += `\n`;
  });
  
  return document;
}

// Export failed translations as a text file
export function exportFailedTranslationsDocument(): void {
  const documentContent = getFailedTranslationsDocument();
  const blob = new Blob([documentContent], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `npa-failed-translations-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Save failed translations to localStorage
function saveFailedTranslations(): void {
  if (typeof localStorage === 'undefined') return;
  
  try {
    localStorage.setItem(LOGGER_CONFIG.storageKey, JSON.stringify(failedTranslations));
  } catch (error) {
    console.warn('Failed to save failed translations to localStorage:', error);
  }
}

// Load failed translations from localStorage
function loadFailedTranslations(): void {
  if (typeof localStorage === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(LOGGER_CONFIG.storageKey);
    if (stored) {
      failedTranslations = JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load failed translations from localStorage:', error);
    failedTranslations = [];
  }
}

// Batch log multiple failed translations
export function logBatchFailedTranslations(
  words: string[], 
  context?: string
): void {
  words.forEach(word => {
    logFailedTranslation(word, context);
  });
}

// Get words that have failed multiple times
export function getFrequentlyFailedWords(minAttempts: number = 3): FailedTranslation[] {
  if (!isInitialized) {
    initializeLogger();
  }
  
  return failedTranslations.filter(entry => entry.attempts >= minAttempts);
}

// Clean up old failed translations (older than specified days)
export function cleanupOldFailedTranslations(daysOld: number = 30): number {
  if (!isInitialized) {
    initializeLogger();
  }
  
  const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
  const initialCount = failedTranslations.length;
  
  failedTranslations = failedTranslations.filter(entry => entry.timestamp > cutoffTime);
  
  const removedCount = initialCount - failedTranslations.length;
  
  if (removedCount > 0) {
    saveFailedTranslations();
    

  }
  
  return removedCount;
} 