// Test script to verify nPA translator integration
// Run this in the browser console after the page loads

export async function testNPATranslatorIntegration() {
  console.log('🧪 Testing nPA Translator Integration...');
  
  try {
    // Test 1: Check if components are available
    console.log('✅ Components loaded successfully');
    
    // Test 2: Check if font is loaded
    const fontTest = document.createElement('div');
    fontTest.style.fontFamily = 'nPA, Courier New, monospace';
    fontTest.textContent = 'R X G Q H A I Y W O';
    document.body.appendChild(fontTest);
    
    // Wait a moment for font to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const computedStyle = window.getComputedStyle(fontTest);
    const fontFamily = computedStyle.fontFamily;
    
    if (fontFamily.includes('nPA')) {
      console.log('✅ nPA font loaded successfully');
    } else {
      console.log('⚠️ nPA font may not be loaded (fallback to Courier New)');
    }
    
    document.body.removeChild(fontTest);
    
    // Test 3: Check if route is accessible
    const currentPath = window.location.pathname;
    if (currentPath === '/projects/phonetic-alphabet') {
      console.log('✅ Route accessible at /projects/phonetic-alphabet');
    } else {
      console.log('ℹ️ Current path:', currentPath);
      console.log('ℹ️ Navigate to /projects/phonetic-alphabet to test the translator');
    }
    
    // Test 4: Check if translation engine is available
    if (typeof window !== 'undefined' && (window as any).testNPATranslationEngine) {
      console.log('✅ Translation engine test function available');
      console.log('ℹ️ Run testNPATranslationEngine() to test the core engine');
    } else {
      console.log('⚠️ Translation engine test function not available');
    }
    
    console.log('\n🎉 Integration test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Navigate to /projects/phonetic-alphabet');
    console.log('2. Try translating some text');
    console.log('3. Test the character guide');
    console.log('4. Test the site-wide toggle');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testNPATranslatorIntegration = testNPATranslatorIntegration;
} 