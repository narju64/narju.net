const fs = require('fs');
const path = require('path');

// Paths
const currentCMUFile = path.join(__dirname, '..', 'public', 'cmudict.txt');
const originalCMUFile = path.join(__dirname, '..', 'public', 'OriginalCMU.txt');
const outputFile = path.join(__dirname, '..', 'custom-words-complete-list.txt');

function compareDictionaries() {
    console.log('Comparing current CMU dictionary with original...');
    
    // Read both dictionaries
    const currentContent = fs.readFileSync(currentCMUFile, 'utf8');
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
            pronunciation: pronunciation,
            fullLine: line.trim()
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
    
    console.log(`Found ${customWords.length} custom words.`);
    console.log(`Complete list saved to: ${outputFile}`);
    
    // Also show them in console
    console.log('\nCustom words found:');
    customWords.forEach(entry => {
        console.log(`- ${entry.word}: ${entry.pronunciation}`);
    });
    
    // Show some statistics
    console.log(`\nStatistics:`);
    console.log(`- Original CMU dictionary: ${originalWords.size} words`);
    console.log(`- Current CMU dictionary: ${currentWords.size} words`);
    console.log(`- Custom additions: ${customWords.length} words`);
}

compareDictionaries(); 