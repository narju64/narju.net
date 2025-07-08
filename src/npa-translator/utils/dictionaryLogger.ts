// Dictionary change logging utility
// In development: writes directly to DictionaryChanges.txt
// In production: copies to clipboard

export interface DictionaryChange {
  action: 'ADD' | 'EDIT' | 'REMOVE';
  word: string;
  arpabet: string;
  notes: string;
  timestamp: string;
}

// Check if a word already exists in DictionaryChanges.txt
async function checkForDuplicate(word: string): Promise<boolean> {
  try {
    const response = await fetch('/DictionaryChanges.txt');
    if (!response.ok) {
      // If file doesn't exist, no duplicates
      return false;
    }
    
    const content = await response.text();
    const lines = content.split('\n');
    
    // Check if word already exists in any ADD entry
    return lines.some(line => {
      const parts = line.split('|');
      return parts[0] === 'ADD' && parts[1] === word.toLowerCase();
    });
  } catch (error) {
    // If we can't read the file, assume no duplicates
    console.warn('Could not check for duplicates:', error);
    return false;
  }
}

export function logDictionaryChange(change: DictionaryChange): Promise<void> {
  const entry = `${change.action}|${change.word}|${change.arpabet}|${change.notes}|${change.timestamp}`;
  
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Development: POST to local API endpoint
    return fetch('/api/dictionary-change', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: entry,
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to write entry');
      });
  } else {
    // Production: copy to clipboard
    return copyToClipboard(entry);
  }
}



async function copyToClipboard(entry: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(entry);
    console.log('Dictionary change copied to clipboard:', entry);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback to alert
    alert(`Dictionary change entry:\n${entry}`);
  }
}

// Convenience function for adding new words
export async function addWordToDictionary(word: string, arpabet: string, npaInput: string): Promise<void> {
  const wordLower = word.toLowerCase();
  
  // Check for duplicates in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const isDuplicate = await checkForDuplicate(wordLower);
    if (isDuplicate) {
      console.warn(`Word "${word}" already exists in DictionaryChanges.txt`);
      return; // Don't add duplicate
    }
  }
  
  const change: DictionaryChange = {
    action: 'ADD',
    word: wordLower,
    arpabet: arpabet,
    notes: `nPA: ${npaInput}`,
    timestamp: new Date().toISOString()
  };
  
  return logDictionaryChange(change);
}

// Convenience function for editing existing words
export function editWordInDictionary(word: string, arpabet: string, npaInput: string): Promise<void> {
  const change: DictionaryChange = {
    action: 'EDIT',
    word: word.toLowerCase(),
    arpabet: arpabet,
    notes: `nPA: ${npaInput}`,
    timestamp: new Date().toISOString()
  };
  
  return logDictionaryChange(change);
}

// Convenience function for removing words
export function removeWordFromDictionary(word: string, reason: string): Promise<void> {
  const change: DictionaryChange = {
    action: 'REMOVE',
    word: word.toLowerCase(),
    arpabet: '',
    notes: reason,
    timestamp: new Date().toISOString()
  };
  
  return logDictionaryChange(change);
} 