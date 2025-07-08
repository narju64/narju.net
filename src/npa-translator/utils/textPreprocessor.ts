import { NumberPattern, SymbolPattern } from '../types/phonetic';

// Number patterns for pronunciation conversion
const NUMBER_PATTERNS: NumberPattern[] = [
  // Large numbers (1,000,000+)
  {
    pattern: /(\d{1,3}(?:,\d{3})*)/g,
    replacement: (match: string) => {
      const num = parseInt(match.replace(/,/g, ''));
      if (num >= 1000000) {
        return convertLargeNumberToWords(num);
      }
      return match; // Let other patterns handle smaller numbers
    },
    description: 'Large numbers'
  },

  // Time formats (e.g., 5:20, 2:30 PM, 14:30)
  {
    pattern: /(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/g,
    replacement: (_match: string, hour: string, minute: string, period: string) => {
      const hourNum = parseInt(hour);
      const minuteNum = parseInt(minute);
      
      let result;
      if (minuteNum === 0) {
        // Handle o'clock times (e.g., 5:00 -> five o'clock)
        result = convertNumberToWords(hourNum) + ' o clock';
      } else {
        // Handle regular times (e.g., 5:20 -> five twenty)
        result = convertNumberToWords(hourNum) + ' ' + convertNumberToWords(minuteNum);
      }
      
      if (period) {
        if (period.toUpperCase() === 'PM') {
          result += ' P M';
        } else {
          result += ' Ay M';
        }
      }
      
      return result;
    },
    description: 'Time formats'
  },

  // Phone numbers
  {
    pattern: /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
    replacement: (_match: string, prefix: string, area: string, first: string, second: string) => {
      let result = '';
      if (prefix && prefix.includes('+')) result += 'plus ';
      if (prefix && prefix.includes('1')) result += 'one ';
      return result + `${area} ${first} ${second}`.split('').join(' ');
    },
    description: 'Phone numbers'
  },

  // Decimal numbers
  {
    pattern: /(\d+)\.(\d+)/g,
    replacement: (_match: string, whole: string, decimal: string) => {
      const wholeWords = convertNumberToWords(parseInt(whole));
      const decimalDigits = decimal.split('').join(' ');
      return `${wholeWords} point ${decimalDigits}`;
    },
    description: 'Decimal numbers'
  },



  // Date formats (mm/dd/yy or mm/dd/yyyy) - MUST come before fractions to avoid conflicts
  {
    pattern: /\b(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})\b/g,
    replacement: (_match: string, month: string, day: string, year: string) => {
      const monthNum = parseInt(month);
      const dayNum = parseInt(day);
      const yearNum = parseInt(year);
      
      // Convert month and day to words
      const monthWords = convertNumberToWords(monthNum);
      const dayWords = convertNumberToWords(dayNum);
      
      // Handle year conversion
      let yearWords = '';
      if (year.length === 2) {
        // yy format: pronounce as individual number
        yearWords = convertNumberToWords(yearNum);
      } else {
        // yyyy format: split into two parts
        const firstPart = Math.floor(yearNum / 100);
        const secondPart = yearNum % 100;
        
        if (firstPart === 20 && secondPart >= 0 && secondPart <= 9) {
          // Exception: 2000-2009 pronounced as "two thousand X"
          yearWords = 'two thousand ' + convertNumberToWords(secondPart);
        } else {
          // Regular yyyy: split into two parts
          const firstWords = convertNumberToWords(firstPart);
          const secondWords = convertNumberToWords(secondPart);
          // Ensure proper spacing and prevent any interference
          // Add explicit separators to prevent phonetic translation issues
          yearWords = firstWords + ' ' + secondWords;
        }
      }
      
      // Add extra spaces to prevent interference from other patterns
      // Ensure year parts are properly separated
      return ` ${monthWords} ${dayWords} ${yearWords} `;
    },
    description: 'Date formats (mm/dd/yy or mm/dd/yyyy)'
  },

  // Fractions
  {
    pattern: /(\d+)\/(\d+)/g,
    replacement: (_match: string, numerator: string, denominator: string) => {
      const num = parseInt(numerator);
      const den = parseInt(denominator);
      return convertFractionToWords(num, den);
    },
    description: 'Fractions'
  },

  // Context-aware asterisk (*) - convert "2*3" to "two times three" - MUST come before simple numbers
  {
    pattern: /(\d+)\*(\d+)/g,
    replacement: (_match: string, num1: string, num2: string) => {
      const first = convertNumberToWords(parseInt(num1));
      const second = convertNumberToWords(parseInt(num2));
      return `${first} times ${second}`;
    },
    description: 'Asterisk between numbers (times)'
  },

  // Context-aware hash (#) - must come before isolated hash
  {
    pattern: /#(\d+)/g,
    replacement: (_match: string, number: string) => {
      const num = convertNumberToWords(parseInt(number));
      return `number ${num}`;
    },
    description: 'Hash before numbers (number)'
  },

  // Context-aware hash before words (hashtag) - must come before isolated hash
  {
    pattern: /#([a-zA-Z]+)/g,
    replacement: (_match: string, word: string) => {
      return `hashtag ${word}`;
    },
    description: 'Hash before words (hashtag)'
  },

  // Ordinal numbers
  {
    pattern: /(\d+)(st|nd|rd|th)/g,
    replacement: (_match: string, number: string, _suffix: string) => {
      return convertToOrdinal(parseInt(number));
    },
    description: 'Ordinal numbers'
  },

  // Negative number minus number (e.g., -2-3 -> negative two minus three)
  {
    pattern: /(^|\s)-(\d+)-(\d+)/g,
    replacement: (_match: string, pre: string, num1: string, num2: string) => {
      const first = convertNumberToWords(parseInt(num1));
      const second = convertNumberToWords(parseInt(num2));
      return `${pre}negative ${first} minus ${second}`;
    },
    description: 'Negative number minus number'
  },

  // Negative numbers (e.g., -2 -> negative two) - MUST come before hyphen-minus pattern
  {
    pattern: /(^|\s)-(\d+)\b/g,
    replacement: (_match: string, pre: string, number: string) => {
      const num = parseInt(number);
      return `${pre}negative ${convertNumberToWords(num)}`;
    },
    description: 'Negative numbers'
  },

  // Context-aware hyphen (-) - only convert when used as mathematical operator (no space before hyphen)
  {
    pattern: /\b(\d+)-\s*(\d+)\b/g,
    replacement: (_match: string, num1: string, num2: string) => {
      const first = convertNumberToWords(parseInt(num1));
      const second = convertNumberToWords(parseInt(num2));
      return `${first} minus ${second}`;
    },
    description: 'Hyphen between numbers (minus)'
  },

  // Comma-separated numbers (e.g., 12,345 -> twelve thousand three hundred forty five)
  {
    pattern: /\b(\d{1,3}(?:,\d{3})*)\b/g,
    replacement: (_match: string, number: string) => {
      const cleanNumber = number.replace(/,/g, '');
      // Cap at 999 trillion to avoid precision issues with very large numbers
      if (cleanNumber.length > 15) {
        return 'NUMBER_TOO_LARGE';
      }
      
      const num = parseInt(cleanNumber);
      if (num >= 1000000000000000) { // 1 quadrillion and above
        return 'NUMBER_TOO_LARGE';
      }
      
      return convertNumberToWords(num);
    },
    description: 'Comma-separated numbers'
  },

  // Simple numbers (any size) - MUST come last to avoid interfering with context patterns
  {
    pattern: /\b(\d+)\b/g,
    replacement: (_match: string, number: string) => {
      const num = parseInt(number);
      if (num === 0) return 'zero';
      return convertNumberToWords(num);
    },
    description: 'Simple numbers'
  }
];

// Symbol patterns for pronunciation conversion
const SYMBOL_PATTERNS: SymbolPattern[] = [
  // Mathematical symbols
  { symbol: '+', pronunciation: 'plus' },
  { symbol: '×', pronunciation: 'times' },
  { symbol: '÷', pronunciation: 'divided by' },
  { symbol: '=', pronunciation: 'equals' },
  { symbol: '%', pronunciation: 'percent' },
  { symbol: '&', pronunciation: 'and' },
  { symbol: '@', pronunciation: 'at' },
  { symbol: '#', pronunciation: 'pound' },
  { symbol: '*', pronunciation: 'asterisk' },

  // Currency symbols
  { symbol: '$', pronunciation: 'dollars' },
  { symbol: '€', pronunciation: 'euros' },
  { symbol: '£', pronunciation: 'pounds' },

  // Common abbreviations
  { symbol: 'Dr.', pronunciation: 'doctor' },
  { symbol: 'Mr.', pronunciation: 'mister' },
  { symbol: 'Mrs.', pronunciation: 'missus' },
  { symbol: 'Jr.', pronunciation: 'junior' },
  { symbol: 'Sr.', pronunciation: 'senior' },
  { symbol: 'Inc.', pronunciation: 'incorporated' },
  { symbol: 'Ltd.', pronunciation: 'limited' },

  // File extensions
  { symbol: '.txt', pronunciation: 'dot t x t' },
  { symbol: '.pdf', pronunciation: 'dot p d f' },
  { symbol: '.mp3', pronunciation: 'dot m p three' },
  { symbol: '.jpg', pronunciation: 'dot j p g' },
  { symbol: '.png', pronunciation: 'dot p n g' },
  { symbol: '.doc', pronunciation: 'dot d o c' },
  { symbol: '.xls', pronunciation: 'dot x l s' },

  // URLs and email
  { symbol: 'www.', pronunciation: 'w w w dot' },
  { symbol: '.com', pronunciation: 'dot com' },
  { symbol: '.org', pronunciation: 'dot org' },
  { symbol: '.net', pronunciation: 'dot net' },
  { symbol: '.edu', pronunciation: 'dot e d u' }
];

// Number conversion utilities
function convertNumberToWords(num: number): string {
  if (num === 0) return 'zero';
  if (num < 20) return getOnes(num);
  if (num < 100) return getTens(num);
  if (num < 1000) return getHundreds(num);
  return convertLargeNumberToWords(num);
}



function convertLargeNumberToWords(num: number): string {
  if (num < 1000) return convertNumberToWords(num);
  
  // Cap at 999 trillion to avoid precision issues
  if (num >= 1000000000000000) { // 1 quadrillion and above
    return 'NUMBER_TOO_LARGE';
  }
  
  // Handle trillions (10^12)
  if (num >= 1e12) {
    const trillions = Math.floor(num / 1e12);
    const remainder = num % 1e12;
    let result = convertNumberToWords(trillions) + ' trillion';
    if (trillions !== 1) result += 's';
    if (remainder > 0) {
      result += ' ' + convertLargeNumberToWords(remainder);
    }
    return result;
  }
  
  // Handle billions
  if (num >= 1000000000) {
    const billions = Math.floor(num / 1000000000);
    const remainder = num % 1000000000;
    let result = convertNumberToWords(billions) + ' billion';
    if (billions !== 1) result += 's';
    if (remainder > 0) {
      result += ' ' + convertLargeNumberToWords(remainder);
    }
    return result;
  }
  
  // Handle millions
  if (num >= 1000000) {
    const millions = Math.floor(num / 1000000);
    const remainder = num % 1000000;
    let result = convertNumberToWords(millions) + ' million';
    if (millions !== 1) result += 's';
    if (remainder > 0) {
      result += ' ' + convertLargeNumberToWords(remainder);
    }
    return result;
  }
  
  // Handle thousands
  const thousands = Math.floor(num / 1000);
  const remainder = num % 1000;
  
  let result = '';
  if (thousands > 0) {
    result += convertNumberToWords(thousands) + ' thousand';
    if (thousands !== 1) result += 's';
  }
  
  if (remainder > 0) {
    if (result) result += ' ';
    result += convertNumberToWords(remainder);
  }
  
  return result;
}

function convertFractionToWords(numerator: number, denominator: number): string {
  const numWords = convertNumberToWords(numerator);
  const denWords = getDenominatorWords(denominator);
  return `${numWords} ${denWords}`;
}

function convertToOrdinal(num: number): string {
  if (num === 1) return 'first';
  if (num === 2) return 'second';
  if (num === 3) return 'third';
  if (num === 4) return 'fourth';
  if (num === 5) return 'fifth';
  if (num === 6) return 'sixth';
  if (num === 7) return 'seventh';
  if (num === 8) return 'eighth';
  if (num === 9) return 'ninth';
  if (num === 10) return 'tenth';
  if (num === 11) return 'eleventh';
  if (num === 12) return 'twelfth';
  if (num === 13) return 'thirteenth';
  if (num === 14) return 'fourteenth';
  if (num === 15) return 'fifteenth';
  if (num === 16) return 'sixteenth';
  if (num === 17) return 'seventeenth';
  if (num === 18) return 'eighteenth';
  if (num === 19) return 'nineteenth';
  if (num === 20) return 'twentieth';
  
  // For numbers > 20, use the base number + "th"
  return convertNumberToWords(num) + 'th';
}

// Helper functions for number conversion
function getOnes(num: number): string {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
                'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  return ones[num];
}

function getTens(num: number): string {
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const ten = Math.floor(num / 10);
  const one = num % 10;
  
  let result = tens[ten];
  if (one > 0) {
    result += ' ' + getOnes(one);
  }
  return result;
}

function getHundreds(num: number): string {
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  
  let result = '';
  if (hundred > 0) {
    result += getOnes(hundred) + ' hundred';
  }
  
  if (remainder > 0) {
    if (result) result += ' ';
    result += convertNumberToWords(remainder);
  }
  
  return result;
}

function getDenominatorWords(denominator: number): string {
  if (denominator === 2) return 'half';
  if (denominator === 3) return 'third';
  if (denominator === 4) return 'fourth';
  if (denominator === 5) return 'fifth';
  if (denominator === 6) return 'sixth';
  if (denominator === 7) return 'seventh';
  if (denominator === 8) return 'eighth';
  if (denominator === 9) return 'ninth';
  if (denominator === 10) return 'tenth';
  
  // For other denominators, use ordinal form
  return convertToOrdinal(denominator);
}



// Main preprocessing function
export function preprocessText(text: string): string {
  let result = text;

  // Apply number patterns
  NUMBER_PATTERNS.forEach(pattern => {
    if (typeof pattern.replacement === 'function') {
      result = result.replace(pattern.pattern, pattern.replacement as any);
    } else {
      result = result.replace(pattern.pattern, pattern.replacement);
    }
  });

  // Apply symbol patterns (only to standalone symbols, not parts of words)
  SYMBOL_PATTERNS.forEach(symbol => {
    // Escape the symbol for regex
    const escapedSymbol = symbol.symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match symbols that are either:
    // 1. Surrounded by word boundaries (standalone symbols)
    // 2. At the beginning or end of the string
    // 3. Surrounded by whitespace
    const regex = new RegExp(`(\\b${escapedSymbol}\\b|^${escapedSymbol}|${escapedSymbol}$|\\s${escapedSymbol}\\s)`, 'g');
    // Add spaces around the replacement to ensure proper word separation
    result = result.replace(regex, ` ${symbol.pronunciation} `);
  });

  // Clean up extra spaces
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

// Specific conversion functions for different types
export function convertNumbersToPronunciation(text: string): string {
  return preprocessText(text);
}

export function convertCurrencyToWords(amount: string): string {
  // Handle currency amounts like "$1,234.56"
  const match = amount.match(/^(\$|€|£)?(\d{1,3}(?:,\d{3})*)\.(\d{2})$/);
  if (!match) return amount;

  const currency = match[1] || '$';
  const whole = parseInt(match[2].replace(/,/g, ''));
  const cents = parseInt(match[3]);

  let result = convertNumberToWords(whole);
  
  if (currency === '$') {
    result += ' dollars';
  } else if (currency === '€') {
    result += ' euros';
  } else if (currency === '£') {
    result += ' pounds';
  }

  if (cents > 0) {
    result += ' and ' + convertNumberToWords(cents) + ' cents';
  }

  return result;
}

export function convertTimeToWords(time: string): string {
  // Handle time formats like "2:30 PM" or "14:30"
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?$/);
  if (!match) return time;

  const hour = parseInt(match[1]);
  const minute = parseInt(match[2]);
  const period = match[3];

  let result = '';
  
  if (period) {
    // 12-hour format
    result = convertNumberToWords(hour) + ' ' + convertNumberToWords(minute);
    if (period.toUpperCase() === 'PM') {
      result += ' P M';
    } else {
      result += ' A M';
    }
  } else {
    // 24-hour format
    result = convertNumberToWords(hour) + ' ' + convertNumberToWords(minute);
  }

  return result;
} 

 