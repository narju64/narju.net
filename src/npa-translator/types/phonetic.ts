// Core translation types
export interface TranslationOptions {
  pronunciation?: string;
  wordPronunciations?: Map<string, number>; // Map of word -> pronunciation index
  enableLogging?: boolean;
  cacheResults?: boolean;
}

export interface WordPronunciation {
  word: string;
  pronunciations: string[];
  defaultIndex: number;
}

export interface PronunciationVariation {
  index: number;
  arpabet: string;
  ipa: string;
  npa: string;
}

export interface TranslationResult {
  original: string;
  arpabet: string;
  ipa: string;
  npa: string;
  unknownWords: string[];
  processingTime: number;
}

// Mapping types
export interface NPAMapping {
  ipa: string;
  npa: string;
  description?: string;
}

export interface ARPABETMapping {
  arpabet: string;
  ipa: string;
  description?: string;
}

// Cache types
export interface TranslationCache {
  [key: string]: {
    npa: string;
    timestamp: number;
    pronunciation: string;
  };
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRatio: number;
}

// Error types
export interface TranslationError {
  type: 'unknown_word' | 'missing_pronunciation' | 'invalid_input' | 'processing_error';
  message: string;
  word?: string;
  context?: string;
}

// Global state types
export interface PhoneticContextType {
  isNPAMode: boolean;
  toggleNPAMode: () => void;
  translateText: (text: string, options?: TranslationOptions) => Promise<string>;
  translateWord: (word: string, pronunciation?: string) => Promise<string>;
  getWordPronunciations: (word: string) => Promise<string[]>;
}

// Number and symbol patterns
export interface NumberPattern {
  pattern: RegExp;
  replacement: string | ((...args: string[]) => string);
  description: string;
}

export interface SymbolPattern {
  symbol: string;
  pronunciation: string;
  context?: string;
}

// Logging types
export interface FailedTranslation {
  word: string;
  context?: string;
  timestamp: number;
  attempts: number;
}

// Performance monitoring
export interface PerformanceMetrics {
  translationTime: number;
  cacheHits: number;
  cacheMisses: number;
  memoryUsage: number;
} 