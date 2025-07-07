import { mapIPAToNPA } from './npaMapping';

// Test function to run all tests
function runTests() {
  console.log('🧪 Running nPA Mapping Tests\n');
  
  const tests = [
    // Basic single characters
    { input: 'i', expected: 'E', description: 'Basic vowel i' },
    { input: 'ɪ', expected: 'i', description: 'Basic vowel ɪ' },
    { input: 'p', expected: 'p', description: 'Basic consonant p' },
    { input: 'b', expected: 'b', description: 'Basic consonant b' },
    
    // Affricates (should be processed as single units)
    { input: 'dʒ', expected: 'j', description: 'Affricate dʒ' },
    { input: 'tʃ', expected: 'c', description: 'Affricate tʃ' },
    { input: 'dʒi', expected: 'jE', description: 'Affricate + vowel' },
    { input: 'idʒ', expected: 'Ej', description: 'Vowel + affricate' },
    
    // R-controlled vowels (should be processed as single units)
    { input: 'ɑr', expected: 'R', description: 'R-controlled vowel ɑr' },
    { input: 'ɛr', expected: 'X', description: 'R-controlled vowel ɛr' },
    { input: 'ɪr', expected: 'G', description: 'R-controlled vowel ɪr' },
    { input: 'ɔr', expected: 'Q', description: 'R-controlled vowel ɔr' },
    { input: 'ʊr', expected: 'Q', description: 'R-controlled vowel ʊr' },
    { input: 'ɜr', expected: 'H', description: 'R-controlled vowel ɜr' },
    
    // Diphthongs (should be processed as single units)
    { input: 'eɪ', expected: 'A', description: 'Diphthong eɪ' },
    { input: 'aɪ', expected: 'I', description: 'Diphthong aɪ' },
    { input: 'ɔɪ', expected: 'Y', description: 'Diphthong ɔɪ' },
    { input: 'aʊ', expected: 'W', description: 'Diphthong aʊ' },
    { input: 'oʊ', expected: 'O', description: 'Diphthong oʊ' },
    
    // Complex words
    { input: 'dʒip', expected: 'jEp', description: 'Word: dip' },
    { input: 'tʃip', expected: 'cEp', description: 'Word: chip' },
    { input: 'kɑr', expected: 'koR', description: 'Word: car' },
    { input: 'ɛr', expected: 'X', description: 'Word: air' },
    { input: 'ɪr', expected: 'G', description: 'Word: ear' },
    { input: 'ɔr', expected: 'Q', description: 'Word: or' },
    { input: 'feɪs', expected: 'fAs', description: 'Word: face' },
    { input: 'praɪs', expected: 'prIs', description: 'Word: price' },
    { input: 'bɔɪ', expected: 'bY', description: 'Word: boy' },
    { input: 'maʊθ', expected: 'mWθ', description: 'Word: mouth' },
    { input: 'goʊt', expected: 'gOt', description: 'Word: goat' },
    
    // Mixed patterns
    { input: 'dʒip ɑr', expected: 'jEp R', description: 'Mixed: dip car' },
    { input: 'tʃip ɛr', expected: 'cEp X', description: 'Mixed: chip air' },
    { input: 'feɪs ɪr', expected: 'fAs G', description: 'Mixed: face ear' },
    { input: 'praɪs ɔr', expected: 'prIs Q', description: 'Mixed: price or' },
    
    // Edge cases
    { input: 'dʒdʒ', expected: 'jj', description: 'Double affricate' },
    { input: 'ɑrɑr', expected: 'RR', description: 'Double r-controlled' },
    { input: 'eɪeɪ', expected: 'AA', description: 'Double diphthong' },
    { input: 'dʒɑr', expected: 'jR', description: 'Affricate + r-controlled' },
    { input: 'ɑrdʒ', expected: 'Rj', description: 'R-controlled + affricate' },
    { input: 'dʒeɪ', expected: 'jA', description: 'Affricate + diphthong' },
    { input: 'eɪdʒ', expected: 'Aj', description: 'Diphthong + affricate' },
    
    // All vowels
    { input: 'iɪeɛæɑɒɔʊuʌə', expected: 'EieeaooCUuVV', description: 'All vowels' },
    
    // All consonants
    { input: 'pbtkgfvθðszʃʒhmnŋlrjw', expected: 'pbtkgfvθðszSJhmnNlrjw', description: 'All consonants' },
    
    // Spaces and punctuation
    { input: 'dʒ ip', expected: 'j Ep', description: 'With space' },
    { input: 'dʒ,ip', expected: 'j,Ep', description: 'With comma' },
    { input: 'dʒ.ip', expected: 'j.Ep', description: 'With period' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach((test, index) => {
    const result = mapIPAToNPA(test.input);
    const success = result === test.expected;
    
    if (success) {
      passed++;
      console.log(`✅ Test ${index + 1}: ${test.description}`);
      console.log(`   Input: "${test.input}" → Output: "${result}"`);
    } else {
      failed++;
      console.log(`❌ Test ${index + 1}: ${test.description}`);
      console.log(`   Input: "${test.input}"`);
      console.log(`   Expected: "${test.expected}"`);
      console.log(`   Got: "${result}"`);
    }
    console.log('');
  });
  
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check the output above.');
  }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runTests();
}

export { runTests }; 