import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PhoneticContextType, TranslationOptions } from '../types/phonetic';
import { translationEngine } from '../utils/translationEngine';

// Create the context
const PhoneticContext = createContext<PhoneticContextType | undefined>(undefined);

// Provider component
interface PhoneticProviderProps {
  children: ReactNode;
}

export function PhoneticProvider({ children }: PhoneticProviderProps) {
  const [isNPAMode, setIsNPAMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the translation engine on mount
  useEffect(() => {
    async function initializeEngine() {
      try {
        await translationEngine.initialize();
        setIsInitialized(true);
        
        // Load nPA mode preference from localStorage
        const savedMode = localStorage.getItem('npa-mode');
        if (savedMode === 'true') {
          setIsNPAMode(true);
          document.body.classList.add('npa-mode');
          console.log('Restored nPA mode from localStorage');
        }
      } catch (error) {
        console.error('Failed to initialize phonetic context:', error);
      }
    }

    initializeEngine();
  }, []);

  // Toggle nPA mode
  const toggleNPAMode = () => {
    const newMode = !isNPAMode;
    setIsNPAMode(newMode);
    
    // Save preference to localStorage
    localStorage.setItem('npa-mode', newMode.toString());
    
    // Add or remove npa-mode class to body for font application
    if (newMode) {
      document.body.classList.add('npa-mode');
      console.log('Added npa-mode class to body');
    } else {
      document.body.classList.remove('npa-mode');
      console.log('Removed npa-mode class from body');
    }
    
    // If switching to nPA mode, translate all text content
    if (newMode) {
      translateAllTextContent();
    } else {
      // If switching back to English, restore original text
      restoreOriginalText();
    }
  };

  // Translate text using the engine
  const translateText = async (text: string, options?: TranslationOptions): Promise<string> => {
    if (!isInitialized) {
      console.warn('Translation engine not initialized');
      return text;
    }

    try {
      const result = await translationEngine.translateToNPA(text, options);
      return result.npa;
    } catch (error) {
      console.error('Translation failed:', error);
      return text; // Return original text on error
    }
  };

  // Translate a single word
  const translateWord = async (word: string, pronunciation?: string): Promise<string> => {
    if (!isInitialized) {
      console.warn('Translation engine not initialized');
      return word;
    }

    try {
      return await translationEngine.translateWord(word, pronunciation);
    } catch (error) {
      console.error('Word translation failed:', error);
      return word; // Return original word on error
    }
  };

  // Get word pronunciations
  const getWordPronunciations = async (word: string): Promise<string[]> => {
    if (!isInitialized) {
      return [];
    }

    try {
      return await translationEngine.getWordPronunciations(word);
    } catch (error) {
      console.error('Failed to get pronunciations:', error);
      return [];
    }
  };

  // Translate all text content on the page
  const translateAllTextContent = async () => {
    if (!isInitialized) return;

    // Find all text nodes and translate them
    const textNodes = findTextNodes(document.body);
    
    for (const node of textNodes) {
      if (node.textContent && node.textContent.trim()) {
        try {
          const translated = await translateText(node.textContent);
          if (translated !== node.textContent) {
            // Store original text for restoration
            (node as any).originalText = node.textContent;
            node.textContent = translated;
          }
        } catch (error) {
          console.error('Failed to translate text node:', error);
        }
      }
    }

    // Translate form placeholders and labels
    const formElements = document.querySelectorAll('input[placeholder], textarea[placeholder], label');
    for (const element of formElements) {
      const placeholder = element.getAttribute('placeholder');
      const labelText = element.textContent;
      
      if (placeholder) {
        try {
          const translated = await translateText(placeholder);
          if (translated !== placeholder) {
            (element as any).originalPlaceholder = placeholder;
            element.setAttribute('placeholder', translated);
          }
        } catch (error) {
          console.error('Failed to translate placeholder:', error);
        }
      }
      
      if (labelText && labelText.trim()) {
        try {
          const translated = await translateText(labelText);
          if (translated !== labelText) {
            (element as any).originalLabelText = labelText;
            element.textContent = translated;
          }
        } catch (error) {
          console.error('Failed to translate label:', error);
        }
      }
    }
  };

  // Restore original text content
  const restoreOriginalText = () => {
    // Restore text nodes
    const textNodes = findTextNodes(document.body);
    
    for (const node of textNodes) {
      if ((node as any).originalText) {
        node.textContent = (node as any).originalText;
        delete (node as any).originalText;
      }
    }

    // Restore form elements
    const formElements = document.querySelectorAll('input[placeholder], textarea[placeholder], label');
    for (const element of formElements) {
      if ((element as any).originalPlaceholder) {
        element.setAttribute('placeholder', (element as any).originalPlaceholder);
        delete (element as any).originalPlaceholder;
      }
      
      if ((element as any).originalLabelText) {
        element.textContent = (element as any).originalLabelText;
        delete (element as any).originalLabelText;
      }
    }
  };

  // Find all text nodes in the DOM
  const findTextNodes = (element: Node): Text[] => {
    const textNodes: Text[] = [];
    
    function traverse(node: Node) {
      if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node as Text);
      } else {
        for (const child of Array.from(node.childNodes)) {
          traverse(child);
        }
      }
    }
    
    traverse(element);
    return textNodes;
  };

  // Context value
  const contextValue: PhoneticContextType = {
    isNPAMode,
    toggleNPAMode,
    translateText,
    translateWord,
    getWordPronunciations,
  };

  return (
    <PhoneticContext.Provider value={contextValue}>
      {children}
    </PhoneticContext.Provider>
  );
}

// Custom hook to use the phonetic context
export function usePhoneticContext(): PhoneticContextType {
  const context = useContext(PhoneticContext);
  
  if (context === undefined) {
    throw new Error('usePhoneticContext must be used within a PhoneticProvider');
  }
  
  return context;
}

// Hook for conditional translation
export function useConditionalTranslation() {
  const { isNPAMode, translateText } = usePhoneticContext();
  
  return {
    translate: async (text: string, options?: TranslationOptions): Promise<string> => {
      if (!isNPAMode) {
        return text;
      }
      return await translateText(text, options);
    }
  };
} 