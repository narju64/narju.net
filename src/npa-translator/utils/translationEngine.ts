import { TranslationOptions, TranslationResult } from '../types/phonetic';
import { mapIPAToNPA, convertARPABETToIPA } from './npaMapping';
import { 
  getWordPronunciations, 
  hasWord 
} from './cmudict';
import { preprocessText } from './textPreprocessor';
import { 
  segmentText, 
  processSegments, 
  reconstructText, 
  getWordVariations 
} from './wordProcessor';
import { 
  getCachedTranslation, 
  cacheTranslation 
} from './cache';
import { logFailedTranslation } from './translationLogger';

// Core translation engine class
export class TranslationEngine {
  private isInitialized = false;

  // Initialize the translation engine
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load CMUdict
      const { loadCMUdict } = await import('./cmudict');
      await loadCMUdict();
      
      // Initialize cache
      const { initializeCache } = await import('./cache');
      initializeCache();
      
      // Initialize logger
      const { initializeLogger } = await import('./translationLogger');
      initializeLogger();
      
      this.isInitialized = true;
      console.log('Translation engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize translation engine:', error);
      throw error;
    }
  }

  // Main translation function
  async translateToNPA(
    text: string, 
    options: TranslationOptions = {}
  ): Promise<TranslationResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = performance.now();
    const unknownWords: string[] = [];

    try {
      // Step 1: Preprocess text (convert numbers and symbols to pronunciation)
      const preprocessedText = preprocessText(text);

      // Step 2: Segment text into words and preserved elements
      const segments = segmentText(preprocessedText);
      const processedSegments = processSegments(segments);

      // Step 3: Translate each word and collect ARPABET and IPA
      const arpabetSegments: string[] = [];
      const ipaSegments: string[] = [];
      for (const segment of processedSegments) {
        if (segment.type === 'word') {
          const translation = await this.translateWord(
            segment.content, 
            options.pronunciation
          );
          
          if (translation.startsWith('[') && translation.endsWith(']')) {
            // Unknown word
            unknownWords.push(segment.content);
            if (options.enableLogging !== false) {
              logFailedTranslation(segment.content, 'translation_engine');
            }
            arpabetSegments.push(segment.content); // Keep original for ARPABET
            ipaSegments.push(segment.content); // Keep original for IPA
          } else {
            // Get ARPABET and IPA for translated word
            const arpabet = await this.getWordARPABET(segment.content, options.pronunciation);
            const ipa = await this.getWordIPA(segment.content, options.pronunciation);
            arpabetSegments.push(arpabet || segment.content);
            ipaSegments.push(ipa || segment.content);
          }
          
          segment.translated = translation;
        } else if (segment.type === 'bracketed') {
          // Preserve bracketed content as-is (no translation)
          arpabetSegments.push(segment.original);
          ipaSegments.push(segment.original);
          segment.translated = segment.original; // Keep as-is
        } else if (segment.type === 'whitespace') {
          arpabetSegments.push('   '); // Match the 3-space spacing
          ipaSegments.push('   '); // Match the 3-space spacing
        } else {
          arpabetSegments.push(segment.original);
          ipaSegments.push(segment.original);
        }
      }

      // Step 4: Reconstruct text
      const npaText = reconstructText(processedSegments);
      const arpabetText = arpabetSegments.join('');
      const ipaText = ipaSegments.join('');
      const processingTime = performance.now() - startTime;

      return {
        original: text,
        arpabet: arpabetText,
        ipa: ipaText,
        npa: npaText,
        unknownWords,
        processingTime
      };

    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  // Translate a single word
  async translateWord(word: string, pronunciation?: string): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const cleanWord = word.toLowerCase().trim();
    
    // Handle special case for large numbers
    if (cleanWord === 'number_too_large') {
      return '[Number too large]';
    }
    
    // Check cache first
    const cached = getCachedTranslation(cleanWord, pronunciation);
    if (cached) {
      return cached;
    }

    // Try to get pronunciation from CMUdict first (including contractions)
    let arpabetPronunciation: string | null = null;
    
    if (pronunciation) {
      // Use provided pronunciation
      arpabetPronunciation = pronunciation;
    } else {
      // Try to find word in CMUdict (including contractions)
      const wordData = getWordPronunciations(cleanWord);
      if (wordData) {
        arpabetPronunciation = wordData.pronunciations[wordData.defaultIndex];
      }
    }

    if (!arpabetPronunciation) {
      // Try word variations
      const variations = getWordVariations(cleanWord);
      for (const variation of variations) {
        const wordData = getWordPronunciations(variation);
        if (wordData) {
          arpabetPronunciation = wordData.pronunciations[wordData.defaultIndex];
          break;
        }
      }
    }

    if (!arpabetPronunciation) {
      // Try hyphenated compound word handling
      const compoundResult = this.handleCompoundWord(cleanWord);
      if (compoundResult) {
        arpabetPronunciation = compoundResult;
      }
    }

    // Always check possessive handling for possessive forms, even if found in CMUdict
    // (since CMUdict has some incorrect possessive pronunciations)
    if (cleanWord.endsWith("'s") || cleanWord.endsWith("'")) {
      const possessiveResult = this.handlePossessive(cleanWord);
      if (possessiveResult) {
        arpabetPronunciation = possessiveResult;
      } else {
        // handlePossessive returned null (malformed possessive), so mark as unknown
        arpabetPronunciation = null;
      }
    } else if (!arpabetPronunciation) {
      // Try possessive handling as smart fallback for non-possessive forms
      const possessiveResult = this.handlePossessive(cleanWord);
      if (possessiveResult) {
        arpabetPronunciation = possessiveResult;
      }
    }

    if (!arpabetPronunciation) {
      // Unknown word - wrap in brackets
      const unknownWord = `[${cleanWord}]`;
      cacheTranslation(cleanWord, unknownWord, pronunciation);
      return unknownWord;
    }

    // Convert ARPABET to IPA
    const ipaPronunciation = convertARPABETToIPA(arpabetPronunciation);
    
    // Map IPA to nPA
    const npaResult = mapIPAToNPA(ipaPronunciation);
    
    // Cache the result
    cacheTranslation(cleanWord, npaResult, pronunciation);
    
    return npaResult;
  }

  // Get available pronunciations for a word
  async getWordPronunciations(word: string): Promise<string[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const cleanWord = word.toLowerCase().trim();
    const wordData = getWordPronunciations(cleanWord);
    
    if (wordData) {
      return wordData.pronunciations;
    }
    
    return [];
  }

  // Get ARPABET for a word
  async getWordARPABET(word: string, pronunciation?: string): Promise<string | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const cleanWord = word.toLowerCase().trim();
    
    // Handle the special case for large numbers
    if (cleanWord === 'number_too_large') {
      return '[Number too large]';
    }
    
    // Try to get pronunciation from CMUdict
    let arpabetPronunciation: string | null = null;
    
    if (pronunciation) {
      // Use provided pronunciation
      arpabetPronunciation = pronunciation;
    } else {
      // Try to find word in CMUdict
      const wordData = getWordPronunciations(cleanWord);
      if (wordData) {
        arpabetPronunciation = wordData.pronunciations[wordData.defaultIndex];
      }
    }

    if (!arpabetPronunciation) {
      // Try word variations
      const variations = getWordVariations(cleanWord);
      for (const variation of variations) {
        const wordData = getWordPronunciations(variation);
        if (wordData) {
          arpabetPronunciation = wordData.pronunciations[wordData.defaultIndex];
          break;
        }
      }
    }

    if (!arpabetPronunciation) {
      // Try hyphenated compound word handling
      const compoundResult = this.handleCompoundWord(cleanWord);
      if (compoundResult) {
        arpabetPronunciation = compoundResult;
      }
    }

    // Always check possessive handling for possessive forms, even if found in CMUdict
    // (since CMUdict has some incorrect possessive pronunciations)
    if (cleanWord.endsWith("'s") || cleanWord.endsWith("'")) {
      const possessiveResult = this.handlePossessive(cleanWord);
      if (possessiveResult) {
        arpabetPronunciation = possessiveResult;
      } else {
        // handlePossessive returned null (malformed possessive), so mark as unknown
        arpabetPronunciation = null;
      }
    } else if (!arpabetPronunciation) {
      // Try possessive handling as smart fallback for non-possessive forms
      const possessiveResult = this.handlePossessive(cleanWord);
      if (possessiveResult) {
        arpabetPronunciation = possessiveResult;
      }
    }

    return arpabetPronunciation;
  }

  // Get IPA for a word
  async getWordIPA(word: string, pronunciation?: string): Promise<string | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const cleanWord = word.toLowerCase().trim();
    
    // Try to get pronunciation from CMUdict
    let arpabetPronunciation: string | null = null;
    
    if (pronunciation) {
      // Use provided pronunciation
      arpabetPronunciation = pronunciation;
    } else {
      // Try to find word in CMUdict
      const wordData = getWordPronunciations(cleanWord);
      if (wordData) {
        arpabetPronunciation = wordData.pronunciations[wordData.defaultIndex];
      }
    }

    if (!arpabetPronunciation) {
      // Try word variations
      const variations = getWordVariations(cleanWord);
      for (const variation of variations) {
        const wordData = getWordPronunciations(variation);
        if (wordData) {
          arpabetPronunciation = wordData.pronunciations[wordData.defaultIndex];
          break;
        }
      }
    }

    if (!arpabetPronunciation) {
      // Try hyphenated compound word handling
      const compoundResult = this.handleCompoundWord(cleanWord);
      if (compoundResult) {
        arpabetPronunciation = compoundResult;
      }
    }

    // Always check possessive handling for possessive forms, even if found in CMUdict
    // (since CMUdict has some incorrect possessive pronunciations)
    if (cleanWord.endsWith("'s") || cleanWord.endsWith("'")) {
      const possessiveResult = this.handlePossessive(cleanWord);
      if (possessiveResult) {
        arpabetPronunciation = possessiveResult;
      } else {
        // handlePossessive returned null (malformed possessive), so mark as unknown
        arpabetPronunciation = null;
      }
    } else if (!arpabetPronunciation) {
      // Try possessive handling as smart fallback for non-possessive forms
      const possessiveResult = this.handlePossessive(cleanWord);
      if (possessiveResult) {
        arpabetPronunciation = possessiveResult;
      }
    }

    if (!arpabetPronunciation) {
      return null;
    }

    // Convert ARPABET to IPA
    return convertARPABETToIPA(arpabetPronunciation);
  }

  // Translate word with specific pronunciation index
  async translateWordWithPronunciation(
    word: string, 
    pronunciationIndex: number
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const pronunciations = await this.getWordPronunciations(word);
    
    if (pronunciationIndex >= 0 && pronunciationIndex < pronunciations.length) {
      return this.translateWord(word, pronunciations[pronunciationIndex]);
    }
    
    // Fall back to default translation
    return this.translateWord(word);
  }

  // Bulk translate multiple words
  async translateWords(words: string[]): Promise<Map<string, string>> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const results = new Map<string, string>();
    
    // Process words in batches to avoid overwhelming the system
    const batchSize = 100;
    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize);
      const batchPromises = batch.map(async (word) => {
        const translation = await this.translateWord(word);
        return [word, translation] as [string, string];
      });
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(([word, translation]) => {
        results.set(word, translation);
      });
    }
    
    return results;
  }

  // Handle possessive forms as smart fallback
  private handlePossessive(word: string): string | null {
    console.log('Checking possessive for:', word);
    
    // Check for malformed possessives (like boy's's, boys's, etc.)
    // These patterns are grammatically invalid in English
    if (word.includes("'s'") || word.includes("''")) {
      console.log('Malformed possessive detected:', word);
      return null; // Don't process malformed possessives
    }
    
    // Additional check for plural + singular possessive (like boys's)
    if (word.endsWith("'s")) {
      const baseWord = word.slice(0, -2);
      const baseWordData = getWordPronunciations(baseWord);
      if (baseWordData) {
        const basePronunciation = baseWordData.pronunciations[baseWordData.defaultIndex];
        // If base word already ends in Z (plural), then adding 's is invalid
        if (basePronunciation.endsWith(' Z')) {
          console.log('Invalid plural + singular possessive detected:', word);
          return null;
        }
      }
    }
    
    // Check for 's ending (regular possessive)
    if (word.endsWith("'s")) {
      const baseWord = word.slice(0, -2); // Remove 's
      console.log('Found \'s ending, base word:', baseWord);
      const baseWordData = getWordPronunciations(baseWord);
      if (baseWordData) {
        const basePronunciation = baseWordData.pronunciations[baseWordData.defaultIndex];
        
        // Check if base word ends in 's' sound (S in ARPABET)
        if (basePronunciation.endsWith(' S')) {
          // Base word ends in 's', so add 'iz' sound (IH Z)
          const result = basePronunciation + ' IH Z';
          console.log('Possessive result (iz sound):', result);
          return result;
        } else {
          // Base word doesn't end in 's', so add 'z' sound (Z)
          const result = basePronunciation + ' Z';
          console.log('Possessive result (z sound):', result);
          return result;
        }
      }
    }
    
    // Check for ' ending (possessive for words already ending in 's')
    if (word.endsWith("'")) {
      const baseWord = word.slice(0, -1); // Remove '
      console.log('Found \' ending, base word:', baseWord);
      const baseWordData = getWordPronunciations(baseWord);
      if (baseWordData) {
        // Check if the base word is already plural (ends in Z sound)
        const basePronunciation = baseWordData.pronunciations[baseWordData.defaultIndex];
        if (basePronunciation.endsWith(' Z')) {
          // Base word is already plural (like 'boys'), so possessive is same as plural
          console.log('Possessive result (same as plural):', basePronunciation);
          return basePronunciation;
        } else {
          // Base word is singular ending in 's' (like 'boss'), so add 'iz' sound
          const result = basePronunciation + ' IH Z'; // IH Z is the ARPABET for 'iz' sound
          console.log('Possessive result:', result);
          return result;
        }
      }
    }
    
    console.log('No possessive pattern found');
    return null; // Not a possessive or base word not found
  }

  // Check if a word exists in the dictionary
  async hasWord(word: string): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return hasWord(word.toLowerCase().trim());
  }

  // Get translation statistics
  async getTranslationStats(): Promise<{
    cacheStats: any;
    failedTranslationStats: any;
    cmudictStats: any;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const { getCacheStats } = await import('./cache');
    const { getFailedTranslationStats } = await import('./translationLogger');
    const { getCMUdictStats } = await import('./cmudict');

    return {
      cacheStats: getCacheStats(),
      failedTranslationStats: getFailedTranslationStats(),
      cmudictStats: getCMUdictStats(),
    };
  }

  // Clear all caches and logs
  async clearAllData(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const { clearCache } = await import('./cache');
    const { clearFailedTranslations } = await import('./translationLogger');

    clearCache();
    clearFailedTranslations();
    
    console.log('All translation data cleared');
  }

  // Test translation with various examples
  async runTests(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const testCases = [
      // Basic words
      'hello',
      'world',
      'computer',
      
      // R-controlled vowels
      'car',
      'air',
      'ear',
      'or',
      'poor',
      'her',
      
      // Diphthongs
      'face',
      'price',
      'boy',
      'mouth',
      'goat',
      
      // Numbers and symbols
      '123',
      '2:30 PM',
      '$1,234.56',
      
      // Contractions
      "can't",
      "I'm",
      "you're",
      
      // Unknown words
      'xyzabc',
      'supercalifragilisticexpialidocious',
    ];

    console.log('Running translation tests...');
    
    for (const testCase of testCases) {
      try {
        const result = await this.translateWord(testCase);
        console.log(`${testCase} → ${result}`);
      } catch (error) {
        console.error(`Test failed for "${testCase}":`, error);
      }
    }
    
    console.log('Translation tests completed');
  }

  // Add this method at the end of the class
  private handleCompoundWord(word: string): string | null {
    if (!word.includes('-')) return null;
    const parts = word.split('-');
    const arpabetParts: string[] = [];
    for (const part of parts) {
      const wordData = getWordPronunciations(part);
      if (wordData) {
        arpabetParts.push(wordData.pronunciations[wordData.defaultIndex]);
      } else {
        // If any part is unknown, return null to trigger [brackets] fallback
        return null;
      }
    }
    return arpabetParts.join(' ');
  }
}

// Export singleton instance
export const translationEngine = new TranslationEngine(); 