// Word processing utilities for text segmentation and handling

// Split text into words while preserving punctuation
export function segmentText(text: string): string[] {
  // Split on whitespace and preserve periods, commas, and spaces
  const segments = text.split(/(\s+|[.,])/);
  return segments.filter(segment => segment.length > 0);
}

// Clean word for dictionary lookup
export function cleanWord(word: string): string {
  // Keep letters, apostrophes, hyphens, and accented characters
  return word.toLowerCase().trim().replace(/[^\p{L}\s'-]/gu, '');
}

// Check if a segment is a word (not punctuation or whitespace)
export function isWord(segment: string): boolean {
  // Allow letters, apostrophes, hyphens, and accented characters
  return /^[\p{L}'-]+$/u.test(segment);
}

// Check if a segment is punctuation
export function isPunctuation(segment: string): boolean {
  return /^[.,!?;:]$/.test(segment);
}

// Check if a segment is whitespace
export function isWhitespace(segment: string): boolean {
  return /^\s+$/.test(segment);
}

// Check if a segment should be preserved (periods, commas, spaces)
export function shouldPreserve(segment: string): boolean {
  return /^[.,\s]+$/.test(segment);
}

// Check if a segment is bracketed content that should be preserved as-is
export function isBracketedContent(segment: string): boolean {
  // Check if it's a complete bracketed segment
  if (segment.startsWith('[') && segment.endsWith(']')) {
    return true;
  }
  // Check if it contains bracketed content (like "[Number too large]")
  if (segment.includes('[') && segment.includes(']')) {
    return true;
  }
  return false;
}

// Process text segments and identify words vs. preserved elements
export function processSegments(segments: string[]): Array<{
  type: 'word' | 'punctuation' | 'whitespace' | 'bracketed';
  content: string;
  original: string;
  translated?: string;
}> {
  return segments.map(segment => {
    if (isBracketedContent(segment)) {
      return {
        type: 'bracketed' as const,
        content: segment,
        original: segment
      };
    } else if (isWord(segment)) {
      return {
        type: 'word' as const,
        content: cleanWord(segment),
        original: segment
      };
    } else if (isPunctuation(segment)) {
      return {
        type: 'punctuation' as const,
        content: segment,
        original: segment
      };
    } else if (isWhitespace(segment)) {
      return {
        type: 'whitespace' as const,
        content: ' ',
        original: segment
      };
    } else {
      // Handle mixed content (words with punctuation)
      return {
        type: 'word' as const,
        content: cleanWord(segment),
        original: segment
      };
    }
  });
}

// Reconstruct text from processed segments
export function reconstructText(processedSegments: Array<{
  type: 'word' | 'punctuation' | 'whitespace' | 'bracketed';
  content: string;
  original: string;
  translated?: string;
}>): string {
  return processedSegments.map(segment => {
    if (segment.translated) {
      return segment.translated;
    }
    // Replace single spaces with multiple spaces for better word separation in nPA
    if (segment.type === 'whitespace') {
      return '   '; // Three spaces instead of one
    }
    // Preserve bracketed content as-is
    if (segment.type === 'bracketed') {
      return segment.original;
    }
    return segment.original;
  }).join('');
}



// Handle plural forms and common word variations
export function getWordVariations(word: string): string[] {
  // For phonetic translation, we want to be precise about pronunciation
  // Only return the original word to avoid incorrect fallbacks
  return [word];
}

// Validate word format
export function isValidWord(word: string): boolean {
  // Check if word contains only letters and common word characters (including accented characters)
  return /^[\p{L}'-]+$/u.test(word);
}

// Normalize word for consistent processing
export function normalizeWord(word: string): string {
  return word.toLowerCase().trim();
}

// Extract words from text while preserving structure
export function extractWords(text: string): Array<{
  word: string;
  position: number;
  original: string;
}> {
  const words: Array<{
    word: string;
    position: number;
    original: string;
  }> = [];
  
  const segments = segmentText(text);
  let position = 0;
  
  for (const segment of segments) {
    if (isWord(segment)) {
      words.push({
        word: cleanWord(segment),
        position,
        original: segment
      });
    }
    position += segment.length;
  }
  
  return words;
} 