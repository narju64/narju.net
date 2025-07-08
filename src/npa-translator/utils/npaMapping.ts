import { NPAMapping, ARPABETMapping } from '../types/phonetic';

// Complete nPA character mappings
export const NPA_MAPPINGS: NPAMapping[] = [
  // R-controlled vowels (processed FIRST)
  { ipa: 'ɑr', npa: 'R', description: 'car' },
  { ipa: 'ɛr', npa: 'X', description: 'air' },
  { ipa: 'ɪr', npa: 'G', description: 'ear' },
  { ipa: 'ɔr', npa: 'Q', description: 'or' },
  { ipa: 'ʊr', npa: 'Q', description: 'poor' },
  { ipa: 'ɜr', npa: 'H', description: 'her' },

  // Diphthongs (processed SECOND)
  { ipa: 'eɪ', npa: 'A', description: 'face' },
  { ipa: 'aɪ', npa: 'I', description: 'price' },
  { ipa: 'ɔɪ', npa: 'Y', description: 'boy' },
  { ipa: 'aʊ', npa: 'W', description: 'mouth' },
  { ipa: 'oʊ', npa: 'O', description: 'goat' },

  // Individual vowels (processed LAST)
  { ipa: 'i', npa: 'E', description: 'see' },
  { ipa: 'ɪ', npa: 'i', description: 'sit' },
  { ipa: 'e', npa: 'e', description: 'bed' },
  { ipa: 'ɛ', npa: 'e', description: 'bet' },
  { ipa: 'æ', npa: 'a', description: 'cat' },
  { ipa: 'ɑ', npa: 'o', description: 'father' },
  { ipa: 'ɒ', npa: 'o', description: 'lot (British)' },
  { ipa: 'ɔ', npa: 'C', description: 'thought' },
  { ipa: 'ʊ', npa: 'U', description: 'put' },
  { ipa: 'u', npa: 'u', description: 'too' },
  { ipa: 'ʌ', npa: 'V', description: 'cut' },
  { ipa: 'ə', npa: 'V', description: 'about (schwa)' },

  // Consonants
  { ipa: 'p', npa: 'p', description: 'pen' },
  { ipa: 'b', npa: 'b', description: 'bad' },
  { ipa: 't', npa: 't', description: 'tea' },
  { ipa: 'd', npa: 'd', description: 'dog' },
  { ipa: 'k', npa: 'k', description: 'key' },
  { ipa: 'g', npa: 'g', description: 'get' },
  { ipa: 'f', npa: 'f', description: 'fat' },
  { ipa: 'v', npa: 'v', description: 'van' },
  { ipa: 'θ', npa: 'T', description: 'thin' },
  { ipa: 'ð', npa: 'D', description: 'this' },
  { ipa: 's', npa: 's', description: 'see' },
  { ipa: 'z', npa: 'z', description: 'zoo' },
  { ipa: 'ʃ', npa: 'S', description: 'ship' },
  { ipa: 'ʒ', npa: 'J', description: 'vision' },
  { ipa: 'h', npa: 'h', description: 'hat' },
  { ipa: 'tʃ', npa: 'c', description: 'chair' },
  { ipa: 'dʒ', npa: 'j', description: 'jam' },
  { ipa: 'm', npa: 'm', description: 'man' },
  { ipa: 'n', npa: 'n', description: 'no' },
  { ipa: 'ŋ', npa: 'N', description: 'sing' },
  { ipa: 'l', npa: 'l', description: 'left' },
  { ipa: 'r', npa: 'r', description: 'right' },
  { ipa: 'j', npa: 'y', description: 'yes' },
  { ipa: 'w', npa: 'w', description: 'wet' },
];

// ARPABET to IPA conversion mappings
export const ARPABET_MAPPINGS: ARPABETMapping[] = [
  // Vowels
  { arpabet: 'AA', ipa: 'ɑ', description: 'odd' },
  { arpabet: 'AE', ipa: 'æ', description: 'at' },
  { arpabet: 'AH', ipa: 'ʌ', description: 'hut' },
  { arpabet: 'AO', ipa: 'ɔ', description: 'ought' },
  { arpabet: 'AW', ipa: 'aʊ', description: 'cow' },
  { arpabet: 'AY', ipa: 'aɪ', description: 'hide' },
  { arpabet: 'EH', ipa: 'ɛ', description: 'bet' },
  { arpabet: 'ER', ipa: 'ɜr', description: 'hurt' },
  { arpabet: 'EY', ipa: 'eɪ', description: 'say' },
  { arpabet: 'IH', ipa: 'ɪ', description: 'it' },
  { arpabet: 'IY', ipa: 'i', description: 'eat' },
  { arpabet: 'OW', ipa: 'oʊ', description: 'oat' },
  { arpabet: 'OY', ipa: 'ɔɪ', description: 'toy' },
  { arpabet: 'UH', ipa: 'ʊ', description: 'hood' },
  { arpabet: 'UW', ipa: 'u', description: 'two' },

  // Consonants
  { arpabet: 'B', ipa: 'b', description: 'be' },
  { arpabet: 'CH', ipa: 'tʃ', description: 'cheese' },
  { arpabet: 'D', ipa: 'd', description: 'dee' },
  { arpabet: 'DH', ipa: 'ð', description: 'thee' },
  { arpabet: 'F', ipa: 'f', description: 'fee' },
  { arpabet: 'G', ipa: 'g', description: 'green' },
  { arpabet: 'HH', ipa: 'h', description: 'he' },
  { arpabet: 'JH', ipa: 'dʒ', description: 'gee' },
  { arpabet: 'K', ipa: 'k', description: 'key' },
  { arpabet: 'L', ipa: 'l', description: 'lee' },
  { arpabet: 'M', ipa: 'm', description: 'me' },
  { arpabet: 'N', ipa: 'n', description: 'knee' },
  { arpabet: 'NG', ipa: 'ŋ', description: 'ping' },
  { arpabet: 'P', ipa: 'p', description: 'pee' },
  { arpabet: 'R', ipa: 'r', description: 'read' },
  { arpabet: 'S', ipa: 's', description: 'sea' },
  { arpabet: 'SH', ipa: 'ʃ', description: 'she' },
  { arpabet: 'T', ipa: 't', description: 'tea' },
  { arpabet: 'TH', ipa: 'θ', description: 'theta' },
  { arpabet: 'V', ipa: 'v', description: 'vee' },
  { arpabet: 'W', ipa: 'w', description: 'we' },
  { arpabet: 'Y', ipa: 'j', description: 'yield' },
  { arpabet: 'Z', ipa: 'z', description: 'zee' },
  { arpabet: 'ZH', ipa: 'ʒ', description: 'seizure' },
];

// Create lookup maps for efficient access
export const IPA_TO_NPA_MAP = new Map<string, string>();
export const ARPABET_TO_IPA_MAP = new Map<string, string>();

// Initialize lookup maps
NPA_MAPPINGS.forEach(mapping => {
  IPA_TO_NPA_MAP.set(mapping.ipa, mapping.npa);
});

ARPABET_MAPPINGS.forEach(mapping => {
  ARPABET_TO_IPA_MAP.set(mapping.arpabet, mapping.ipa);
});

// Priority-ordered mapping functions
export function processRControlledVowels(ipaString: string): string {
  let result = ipaString;
  
  // Process r-controlled vowels first (longest patterns first)
  const rControlledPatterns = [
    { pattern: /ɑr/g, replacement: 'R' },
    { pattern: /ɛr/g, replacement: 'X' },
    { pattern: /ɪr/g, replacement: 'G' },
    { pattern: /ɔr/g, replacement: 'Q' },
    { pattern: /ʊr/g, replacement: 'Q' },
    { pattern: /ɜr/g, replacement: 'H' },
  ];

  rControlledPatterns.forEach(({ pattern, replacement }) => {
    result = result.replace(pattern, replacement);
  });

  return result;
}

export function processDiphthongs(ipaString: string): string {
  let result = ipaString;
  
  // Process diphthongs second (longest patterns first)
  const diphthongPatterns = [
    { pattern: /eɪ/g, replacement: 'A' },
    { pattern: /aɪ/g, replacement: 'I' },
    { pattern: /ɔɪ/g, replacement: 'Y' },
    { pattern: /aʊ/g, replacement: 'W' },
    { pattern: /oʊ/g, replacement: 'O' },
  ];

  diphthongPatterns.forEach(({ pattern, replacement }) => {
    result = result.replace(pattern, replacement);
  });

  return result;
}

export function processAffricates(ipaString: string): string {
  let result = ipaString;
  
  // Process affricates (two-character consonant sounds)
  const affricatePatterns = [
    { pattern: /tʃ/g, replacement: 'c' },
    { pattern: /dʒ/g, replacement: 'j' },
  ];

  affricatePatterns.forEach(({ pattern, replacement }) => {
    result = result.replace(pattern, replacement);
  });

  return result;
}

export function mapIndividualSounds(ipaString: string): string {
  let result = ipaString;
  
  // Handle affricates first (in case they weren't processed earlier)
  result = result.replace(/dʒ/g, 'j');
  result = result.replace(/tʃ/g, 'c');
  
  // Map remaining individual sounds
  for (const [ipa, npa] of IPA_TO_NPA_MAP) {
    // Skip r-controlled vowels and diphthongs (already processed)
    if (ipa.length > 1) continue;
    
    result = result.replace(new RegExp(ipa, 'g'), npa);
  }

  return result;
}

// Main mapping function - process character by character
export function mapIPAToNPA(ipaString: string): string {
  
  let result = '';
  let i = 0;
  
  while (i < ipaString.length) {
    // Check for multi-character patterns first (longest patterns first)
    if (i + 1 < ipaString.length) {
      const twoChar = ipaString.substring(i, i + 2);
      if (twoChar === 'dʒ') {
        result += 'j';
        i += 2;
        continue;
      }
      if (twoChar === 'tʃ') {
        result += 'c';
        i += 2;
        continue;
      }
      if (twoChar === 'ɑr') {
        result += 'R';
        i += 2;
        continue;
      }
      if (twoChar === 'ɛr') {
        result += 'X';
        i += 2;
        continue;
      }
      if (twoChar === 'ɪr') {
        result += 'G';
        i += 2;
        continue;
      }
      if (twoChar === 'ɔr') {
        result += 'Q';
        i += 2;
        continue;
      }
      if (twoChar === 'ʊr') {
        result += 'Q';
        i += 2;
        continue;
      }
      if (twoChar === 'ɜr') {
        result += 'H';
        i += 2;
        continue;
      }
      if (twoChar === 'eɪ') {
        result += 'A';
        i += 2;
        continue;
      }
      if (twoChar === 'aɪ') {
        result += 'I';
        i += 2;
        continue;
      }
      if (twoChar === 'ɔɪ') {
        result += 'Y';
        i += 2;
        continue;
      }
      if (twoChar === 'aʊ') {
        result += 'W';
        i += 2;
        continue;
      }
      if (twoChar === 'oʊ') {
        result += 'O';
        i += 2;
        continue;
      }
    }
    
    // Single character patterns
    const char = ipaString[i];
    switch (char) {
      case 'i': result += 'E'; break;
      case 'ɪ': result += 'i'; break;
      case 'e': result += 'e'; break;
      case 'ɛ': result += 'e'; break;
      case 'æ': result += 'a'; break;
      case 'ɑ': result += 'o'; break;
      case 'ɒ': result += 'o'; break;
      case 'ɔ': result += 'C'; break;
      case 'ʊ': result += 'U'; break;
      case 'u': result += 'u'; break;
      case 'ʌ': result += 'V'; break;
      case 'ə': result += 'V'; break;
      case 'p': result += 'p'; break;
      case 'b': result += 'b'; break;
      case 't': result += 't'; break;
      case 'd': result += 'd'; break;
      case 'k': result += 'k'; break;
      case 'g': result += 'g'; break;
      case 'f': result += 'f'; break;
      case 'v': result += 'v'; break;
      case 'θ': result += 'T'; break;
      case 'ð': result += 'D'; break;
      case 's': result += 's'; break;
      case 'z': result += 'z'; break;
      case 'ʃ': result += 'S'; break;
      case 'ʒ': result += 'J'; break;
      case 'h': result += 'h'; break;
      case 'm': result += 'm'; break;
      case 'n': result += 'n'; break;
      case 'ŋ': result += 'N'; break;
      case 'l': result += 'l'; break;
      case 'r': result += 'r'; break;
      case 'j': result += 'y'; break;
      case 'w': result += 'w'; break;
      default: result += char; break; // Keep spaces and other characters
    }
    i++;
  }
  
  return result;
}

// ARPABET to IPA conversion
export function convertARPABETToIPA(arpabetString: string): string {
  const arpabetTokens = arpabetString.split(/\s+/);
  const ipaTokens: string[] = [];
  
  for (let i = 0; i < arpabetTokens.length; i++) {
    const token = arpabetTokens[i];
    const cleanToken = token.replace(/[012]$/, '');
    
    // Check for r-controlled vowel patterns
    if (i < arpabetTokens.length - 1) {
      const nextToken = arpabetTokens[i + 1].replace(/[012]$/, '');
      
      // R-controlled vowel patterns
      if (cleanToken === 'AA' && nextToken === 'R') {
        ipaTokens.push('ɑr');
        i++; // Skip the next token (R)
        continue;
      } else if (cleanToken === 'AE' && nextToken === 'R') {
        ipaTokens.push('ɛr');
        i++; // Skip the next token (R)
        continue;
      } else if (cleanToken === 'EH' && nextToken === 'R') {
        ipaTokens.push('ɛr');
        i++; // Skip the next token (R)
        continue;
      } else if (cleanToken === 'IH' && nextToken === 'R') {
        ipaTokens.push('ɪr');
        i++; // Skip the next token (R)
        continue;
      } else if (cleanToken === 'IY' && nextToken === 'R') {
        ipaTokens.push('ɪr');
        i++; // Skip the next token (R)
        continue;
      } else if (cleanToken === 'AO' && nextToken === 'R') {
        ipaTokens.push('ɔr');
        i++; // Skip the next token (R)
        continue;
      } else if (cleanToken === 'UH' && nextToken === 'R') {
        ipaTokens.push('ʊr');
        i++; // Skip the next token (R)
        continue;
      } else if (cleanToken === 'UW' && nextToken === 'R') {
        ipaTokens.push('ʊr');
        i++; // Skip the next token (R)
        continue;
      }
    }
    
    // Check for ER (ɜr) - this is already a single token
    if (cleanToken === 'ER') {
      ipaTokens.push('ɜr');
      continue;
    }
    
    // Regular conversion
    const ipa = ARPABET_TO_IPA_MAP.get(cleanToken) || cleanToken;
    ipaTokens.push(ipa);
  }
  
  return ipaTokens.join('');
}

// Utility function to get nPA character for IPA sound
export function getNPACharacter(ipaSound: string): string | undefined {
  return IPA_TO_NPA_MAP.get(ipaSound);
}

// Utility function to get IPA for ARPABET symbol
export function getIPASound(arpabetSymbol: string): string | undefined {
  return ARPABET_TO_IPA_MAP.get(arpabetSymbol);
}

// Reverse mapping: nPA to ARPABET
export function npaToArpabet(npaString: string): string {
  // Simple direct mapping from nPA to ARPABET
  const NPA_TO_ARPABET_MAP = new Map<string, string>([
    // Vowels
    ['E', 'IY'], ['i', 'IH'], ['e', 'EH'], ['a', 'AE'], ['o', 'AA'], ['C', 'AO'], ['U', 'UH'], ['u', 'UW'], ['V', 'AH'],
    // Diphthongs
    ['A', 'EY'], ['I', 'AY'], ['Y', 'OY'], ['W', 'AW'], ['O', 'OW'],
    // R-controlled vowels
    ['R', 'AA R'], ['X', 'EH R'], ['G', 'IH R'], ['Q', 'AO R'], ['H', 'ER'],
    // Consonants
    ['T', 'TH'], ['D', 'DH'], ['S', 'SH'], ['J', 'ZH'], ['c', 'CH'], ['j', 'JH'], ['N', 'NG'],
    // Regular consonants (same as nPA)
    ['p', 'P'], ['b', 'B'], ['t', 'T'], ['d', 'D'], ['k', 'K'], ['g', 'G'], ['f', 'F'], ['v', 'V'],
    ['s', 'S'], ['z', 'Z'], ['h', 'HH'], ['m', 'M'], ['n', 'N'], ['l', 'L'], ['r', 'R'], ['y', 'Y'], ['w', 'W']
  ]);

  const result: string[] = [];
  
  for (const char of npaString) {
    const arpabet = NPA_TO_ARPABET_MAP.get(char);
    if (arpabet) {
      result.push(arpabet);
    } else {
      throw new Error(`Invalid nPA character: ${char}`);
    }
  }
  
  return result.join(' ');
} 