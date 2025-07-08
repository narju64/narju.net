const fs = require('fs');
const path = require('path');

// Paths
const changesFile = path.join(__dirname, '..', 'DictionaryChanges.txt');
const cmudictFile = path.join(__dirname, '..', 'public', 'cmudict.txt');

// ARPABET phoneme list (longest first for greedy matching)
const ARPABET_PHONEMES = [
  'AA', 'AE', 'AH', 'AO', 'AW', 'AY',
  'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW',
  'B', 'CH', 'D', 'DH', 'F', 'G', 'HH', 'JH', 'K', 'L', 'M', 'N', 'NG', 'P', 'R', 'S', 'SH', 'T', 'TH', 'V', 'W', 'Y', 'Z', 'ZH'
];
const ARPABET_VOWELS = [
  'AA', 'AE', 'AH', 'AO', 'AW', 'AY',
  'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW'
];

function splitArpabet(arpabet) {
  // If already space-separated, just return
  if (arpabet.includes(' ')) {
    return arpabet.trim().split(/\s+/);
  }
  // Greedy match from left to right
  const result = [];
  let s = arpabet.trim();
  while (s.length > 0) {
    let matched = false;
    for (const ph of ARPABET_PHONEMES) {
      if (s.startsWith(ph)) {
        result.push(ph);
        s = s.slice(ph.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      // If no match, just take the first character (shouldn't happen)
      result.push(s[0]);
      s = s.slice(1);
    }
  }
  return result;
}

function addDefaultStress(arpabet) {
  const phonemes = splitArpabet(arpabet);
  let stressAdded = false;
  return phonemes.map(ph => {
    // Remove any existing stress
    const basePh = ph.replace(/[012]$/, '');
    if (ARPABET_VOWELS.includes(basePh)) {
      if (!stressAdded) {
        stressAdded = true;
        return basePh + '1';
      } else {
        return basePh + '0';
      }
    }
    return basePh;
  }).join(' ');
}

function applyDictionaryChanges() {
    console.log('Applying dictionary changes...');
    
    // Check if changes file exists and has content
    if (!fs.existsSync(changesFile)) {
        console.log('No DictionaryChanges.txt file found.');
        return;
    }
    
    const changesContent = fs.readFileSync(changesFile, 'utf8').trim();
    if (!changesContent) {
        console.log('DictionaryChanges.txt is empty.');
        return;
    }
    
    // Read current CMUdict
    const cmudictContent = fs.readFileSync(cmudictFile, 'utf8');
    const lines = cmudictContent.split('\n');
    
    // Parse changes
    const changes = changesContent.split('\n').filter(line => line.trim());
    const newEntries = [];
    
    for (const change of changes) {
        const parts = change.split('|');
        if (parts[0] === 'ADD' && parts[1] && parts[2]) {
            const word = parts[1];
            const arpabet = parts[2];
            newEntries.push({ word, arpabet });
        }
    }
    
    if (newEntries.length === 0) {
        console.log('No new entries to add.');
        return;
    }
    
    // Add default stress markers and convert to lowercase
    const processedEntries = newEntries.map(({ word, arpabet }) => {
        const stressedPron = addDefaultStress(arpabet);
        return `${word.toLowerCase()}  ${stressedPron}`;
    });
    
    // Find insertion points for each entry
    const insertions = [];
    for (const entry of processedEntries) {
        const word = entry.split('  ')[0];
        let insertIndex = 0;
        
        // Find the correct alphabetical position
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith(';;')) continue; // Skip comments
            
            const existingWord = line.split('  ')[0];
            if (existingWord && word < existingWord) {
                insertIndex = i;
                break;
            }
            insertIndex = i + 1;
        }
        
        insertions.push({ entry, index: insertIndex });
    }
    
    // Sort insertions by index (descending) to avoid shifting issues
    insertions.sort((a, b) => b.index - a.index);
    
    // Insert entries
    for (const { entry, index } of insertions) {
        lines.splice(index, 0, entry);
    }
    
    // Write back to file
    fs.writeFileSync(cmudictFile, lines.join('\n'));
    
    // Clear the changes file
    fs.writeFileSync(changesFile, '');
    
    console.log(`Added ${processedEntries.length} new entries to CMUdict.`);
    console.log('DictionaryChanges.txt has been cleared.');
    
    // Update the custom words list
    console.log('Updating custom words list...');
    updateCustomWordsList();
}

function updateCustomWordsList() {
    const originalCMUFile = path.join(__dirname, '..', 'public', 'OriginalCMU.txt');
    const outputFile = path.join(__dirname, '..', 'custom-words-complete-list.txt');
    
    // Read both dictionaries
    const currentContent = fs.readFileSync(cmudictFile, 'utf8');
    const originalContent = fs.readFileSync(originalCMUFile, 'utf8');
    
    // Parse current dictionary
    const currentWords = new Set();
    const currentEntries = new Map();
    
    currentContent.split('\n').forEach(line => {
        if (!line.trim() || line.startsWith(';;')) return;
        
        const parts = line.split(/\s+/);
        if (parts.length < 2) return;
        
        const word = parts[0].toLowerCase();
        const pronunciation = parts.slice(1).join(' ');
        
        currentWords.add(word);
        currentEntries.set(word, {
            word: parts[0], // Keep original case
            pronunciation: pronunciation
        });
    });
    
    // Parse original dictionary
    const originalWords = new Set();
    
    originalContent.split('\n').forEach(line => {
        if (!line.trim() || line.startsWith(';;')) return;
        
        const parts = line.split(/\s+/);
        if (parts.length < 2) return;
        
        const word = parts[0].toLowerCase();
        originalWords.add(word);
    });
    
    // Find custom words (in current but not in original)
    const customWords = [];
    
    for (const word of currentWords) {
        if (!originalWords.has(word)) {
            const entry = currentEntries.get(word);
            customWords.push(entry);
        }
    }
    
    // Sort alphabetically
    customWords.sort((a, b) => a.word.localeCompare(b.word));
    
    // Write to output file
    let output = '';
    
    for (const entry of customWords) {
        output += `${entry.word}  ${entry.pronunciation}\n`;
    }
    
    fs.writeFileSync(outputFile, output);
    
    console.log(`Updated custom words list: ${customWords.length} words found.`);
}

applyDictionaryChanges(); 