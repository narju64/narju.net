// Simple test file to verify the core translation engine
// This can be run in the browser console or as a standalone test

import { translationEngine } from './utils/translationEngine';

// Test function
export async function testTranslationEngine() {
  console.log('🧪 Testing nPA Translation Engine...');
  
  try {
    // Initialize the engine
    await translationEngine.initialize();
    console.log('✅ Engine initialized successfully');
    
    // Test basic word translations
    const basicTests = [
      'hello',
      'world',
      'computer',
      'test'
    ];
    
    console.log('\n📝 Testing basic words:');
    for (const word of basicTests) {
      try {
        const result = await translationEngine.translateWord(word);
        console.log(`${word} → ${result}`);
      } catch (error) {
        console.error(`❌ Failed to translate "${word}":`, error);
      }
    }
    
    // Test r-controlled vowels
    const rControlledTests = [
      'car',
      'air',
      'ear',
      'or',
      'poor',
      'her'
    ];
    
    console.log('\n🎯 Testing r-controlled vowels:');
    for (const word of rControlledTests) {
      try {
        const result = await translationEngine.translateWord(word);
        console.log(`${word} → ${result}`);
      } catch (error) {
        console.error(`❌ Failed to translate "${word}":`, error);
      }
    }
    
    // Test diphthongs
    const diphthongTests = [
      'face',
      'price',
      'boy',
      'mouth',
      'goat'
    ];
    
    console.log('\n🎵 Testing diphthongs:');
    for (const word of diphthongTests) {
      try {
        const result = await translationEngine.translateWord(word);
        console.log(`${word} → ${result}`);
      } catch (error) {
        console.error(`❌ Failed to translate "${word}":`, error);
      }
    }
    
    // Test contractions
    const contractionTests = [
      "can't",
      "I'm",
      "you're",
      "won't"
    ];
    
    console.log('\n📝 Testing contractions:');
    for (const word of contractionTests) {
      try {
        const result = await translationEngine.translateWord(word);
        console.log(`${word} → ${result}`);
      } catch (error) {
        console.error(`❌ Failed to translate "${word}":`, error);
      }
    }
    
    // Test unknown words
    const unknownTests = [
      'xyzabc',
      'supercalifragilisticexpialidocious'
    ];
    
    console.log('\n❓ Testing unknown words:');
    for (const word of unknownTests) {
      try {
        const result = await translationEngine.translateWord(word);
        console.log(`${word} → ${result}`);
      } catch (error) {
        console.error(`❌ Failed to translate "${word}":`, error);
      }
    }
    
    // Test full text translation
    console.log('\n📄 Testing full text translation:');
    const testText = "Hello world! This is a test of the nPA translator. Can't wait to see how it works.";
    try {
      const result = await translationEngine.translateToNPA(testText);
      console.log('Original:', testText);
      console.log('Translated:', result.npa);
      console.log('Unknown words:', result.unknownWords);
      console.log('Processing time:', result.processingTime.toFixed(2), 'ms');
    } catch (error) {
      console.error('❌ Failed to translate full text:', error);
    }
    
    // Get statistics
    console.log('\n📊 Engine Statistics:');
    try {
      const stats = await translationEngine.getTranslationStats();
      console.log('Cache stats:', stats.cacheStats);
      console.log('Failed translation stats:', stats.failedTranslationStats);
      console.log('CMUdict stats:', stats.cmudictStats);
    } catch (error) {
      console.error('❌ Failed to get statistics:', error);
    }
    
    console.log('\n✅ Translation engine test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testNPATranslationEngine = testTranslationEngine;
}

// Run test if this file is executed directly
if (typeof module !== 'undefined' && module.exports) {
  testTranslationEngine().catch(console.error);
} 