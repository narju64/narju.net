# nPA (narju's Phonetic Alphabet) Translator

A comprehensive system that translates English text into narju's custom phonetic alphabet using IPA as an intermediary. The system includes both a dedicated translator interface and a site-wide toggle for viewing the entire website in nPA.

## Project Overview

The nPA Translator captures pronunciation exactly as words sound, using a custom alphabet that represents each distinct phonetic sound with a unique character. nPA is like IPA (International Phonetic Alphabet) but designed to be easier to read and use.

### Purpose and Applications

#### Educational Applications
- **English Language Learning**: Teach foreign speakers English pronunciation with a more accessible phonetic system
- **Phonetics Education**: Provide a bridge between traditional spelling and phonetic representation
- **Pronunciation Training**: Help learners understand how words actually sound vs. how they're spelled

#### Literary and Creative Applications
- **Poetry Analysis**: Identify rhymes, assonance, and alliteration through visual phonetic mapping
- **Rap/Song Lyrics**: Map phonetic patterns in lyrics for analysis and creation
- **Spoken Word**: Generate rhymes and literary devices while writing
- **Creative Writing**: Visualize sound patterns in text for enhanced poetic composition

#### Future Applications
- **Conlang Development**: nPA serves as the foundation for a planned constructed language
- **Phonology Research**: Study sound patterns across different texts and languages
- **Accessibility**: Provide phonetic reading aids for various learning needs

## Core Architecture

### Data Flow Pipeline
```
English Text → Word Segmentation → CMUdict Lookup → ARPABET → IPA → nPA → Output
```

### Translation Priority Order
1. **R-controlled vowels** (ɑr, ɛr, ɪr, ɔr, ʊr, ɜr) - Processed FIRST
2. **Diphthongs** (eɪ, aɪ, ɔɪ, aʊ, oʊ) - Processed SECOND  
3. **Individual vowels and consonants** - Processed LAST

## Complete nPA Character Mapping

### Vowels (12 sounds)
```json
{
  "i": "E",    // see
  "ɪ": "i",    // sit
  "e": "e",    // bed
  "ɛ": "e",    // bet
  "æ": "a",    // cat
  "ɑ": "o",    // father
  "ɒ": "o",    // lot (British)
  "ɔ": "C",    // thought
  "ʊ": "U",    // put
  "u": "u",    // too
  "ʌ": "V",    // cut
  "ə": "V"     // about (schwa)
}
```

### Diphthongs (5 sounds)
```json
{
  "eɪ": "A",   // face
  "aɪ": "I",   // price
  "ɔɪ": "Y",   // boy
  "aʊ": "W",   // mouth
  "oʊ": "O"    // goat
}
```

### R-Controlled Vowels (6 sounds)
```json
{
  "ɑr": "R",   // car
  "ɛr": "X",   // air
  "ɪr": "G",   // ear
  "ɔr": "Q",   // or
  "ʊr": "Q",   // poor
  "ɜr": "H"    // her
}
```

### Consonants (24 sounds)
```json
{
  "p": "p",    // pen
  "b": "b",    // bad
  "t": "t",    // tea
  "d": "d",    // dog
  "k": "k",    // key
  "g": "g",    // get
  "f": "f",    // fat
  "v": "v",    // van
  "θ": "T",    // thin
  "ð": "D",    // this
  "s": "s",    // see
  "z": "z",    // zoo
  "ʃ": "S",    // ship
  "ʒ": "J",    // vision
  "h": "h",    // hat
  "tʃ": "c",   // chair
  "dʒ": "j",   // jam
  "m": "m",    // man
  "n": "n",    // no
  "ŋ": "N",    // sing
  "l": "l",    // left
  "r": "r",    // right
  "j": "y",    // yes
  "w": "w"     // wet
}
```

## Technical Specifications

### Font System
- **Font File**: `nPAv1.ttf` located in `public/fonts/`
- **Character Type**: Single characters for all sounds
- **Font Loading**: CSS @font-face loaded immediately on page load
- **Browser Support**: Modern browsers with fallback for older versions
- **No Stress Markers**: Stress indicators (ˈ, ˌ) are ignored
- **No Special Allophones**: Flapped T (ɾ), glottal stop (ʔ), velarized L (ɫ) are ignored
- **No Length Indicators**: Long vowel (ː), half-long (ˑ) are ignored
- **No Modifiers**: Aspirated (ʰ), palatalized (ʲ), labialized (ʷ) are ignored

### Data Sources
- **CMUdict**: Full pronunciation dictionary bundled locally
- **Unknown Words**: Wrapped in `[brackets]` notation and logged for review
- **Dialect**: US English focus
- **Custom Additions**: Support for slang and custom words
- **Multiple Pronunciations**: Support for alternative pronunciations per word
- **Translation Logging**: Failed translations logged for manual review and addition

## Project Structure

```
src/npa-translator/
├── components/
│   ├── PhoneticTranslator.tsx    # Main translator interface
│   ├── SiteToggle.tsx            # Header toggle component
│   └── PhoneticTranslator.css    # Translator styling
├── utils/
│   ├── npaMapping.ts             # Complete mapping system
│   ├── cmudict.ts                # CMUdict integration
│   ├── translationEngine.ts      # Core translation logic
│   ├── textPreprocessor.ts       # Number/symbol pronunciation conversion
│   ├── wordProcessor.ts          # Word segmentation
│   ├── cache.ts                  # Caching utilities
│   └── translationLogger.ts      # Log failed translations for review
├── types/
│   └── phonetic.ts               # TypeScript definitions
├── context/
│   └── PhoneticContext.tsx       # Global state management
└── README.md                     # This documentation
```

## ARPABET to IPA Conversion Table

CMUdict uses ARPABET notation, which must be converted to IPA before nPA mapping.

### Vowels
```json
{
  "AA": "ɑ",   // odd
  "AE": "æ",   // at
  "AH": "ʌ",   // hut
  "AO": "ɔ",   // ought
  "AW": "aʊ",  // cow
  "AY": "aɪ",  // hide
  "EH": "ɛ",   // bet
  "ER": "ɜr",  // hurt
  "EY": "eɪ",  // say
  "IH": "ɪ",   // it
  "IY": "i",   // eat
  "OW": "oʊ",  // oat
  "OY": "ɔɪ",  // toy
  "UH": "ʊ",   // hood
  "UW": "u"    // two
}
```

### Consonants
```json
{
  "B": "b",    // be
  "CH": "tʃ",  // cheese
  "D": "d",    // dee
  "DH": "ð",   // thee
  "F": "f",    // fee
  "G": "g",    // green
  "HH": "h",   // he
  "JH": "dʒ",  // gee
  "K": "k",    // key
  "L": "l",    // lee
  "M": "m",    // me
  "N": "n",    // knee
  "NG": "ŋ",   // ping
  "P": "p",    // pee
  "R": "r",    // read
  "S": "s",    // sea
  "SH": "ʃ",   // she
  "T": "t",    // tea
  "TH": "θ",   // theta
  "V": "v",    // vee
  "W": "w",    // we
  "Y": "j",    // yield
  "Z": "z",    // zee
  "ZH": "ʒ"    // seizure
}
```

## Number and Symbol Pronunciation Rules

The translator must understand how numbers and symbols are actually pronounced, not just translate them literally.

### Number Patterns

#### Large Numbers
- `1,000,342` → "one million three hundred forty two"
- `2,500,000` → "two million five hundred thousand"
- `1,234,567` → "one million two hundred thirty four thousand five hundred sixty seven"

#### Phone Numbers
- `343-123-1234` → "three four three one two three one two three four"
- `(555) 123-4567` → "five five five one two three four five six seven"
- `+1-800-555-0123` → "plus one eight zero zero five five five zero one two three"

#### Decimal Numbers
- `10.153` → "ten point one five three"
- `3.14159` → "three point one four one five nine"
- `0.5` → "zero point five"

#### Fractions
- `1/2` → "one half"
- `3/4` → "three fourths"
- `2/3` → "two thirds"

#### Ordinal Numbers
- `1st` → "first"
- `2nd` → "second"
- `3rd` → "third"
- `4th` → "fourth"

### Symbol Patterns

#### Mathematical Symbols
- `+` → "plus"
- `-` → "minus"
- `×` → "times"
- `÷` → "divided by"
- `=` → "equals"
- `%` → "percent"

#### Currency
- `$1,234.56` → "one thousand two hundred thirty four dollars and fifty six cents"
- `€500` → "five hundred euros"
- `£25.99` → "twenty five pounds and ninety nine pence"

#### Time
- `2:30 PM` → "two thirty P M"
- `12:00 AM` → "twelve A M"
- `3:45` → "three forty five"

#### Dates
- `12/25/2023` → "December twenty fifth twenty twenty three"
- `Jan 15` → "January fifteenth"
- `2024-03-14` → "twenty twenty four March fourteenth"

#### Scientific Notation
- `1.23e-4` → "one point two three times ten to the negative four"
- `2.5e6` → "two point five times ten to the six"

#### Roman Numerals
- `IV` → "four"
- `XII` → "twelve"
- `XXI` → "twenty one"

#### Abbreviations and Titles
- `Dr.` → "doctor"
- `Mr.` → "mister"
- `Mrs.` → "missus"
- `Jr.` → "junior"
- `Sr.` → "senior"
- `Inc.` → "incorporated"
- `Ltd.` → "limited"

#### URLs and Email
- `www.example.com` → "w w w dot example dot com"
- `user@domain.com` → "user at domain dot com"

#### File Extensions
- `.txt` → "dot t x t"
- `.pdf` → "dot p d f"
- `.mp3` → "dot m p three"

## Translation Logic Flow

### Step 1: Text Preprocessing
- Split text into words and symbols
- Identify number patterns and symbols
- Convert to pronunciation form based on context
- Handle punctuation (keep periods, commas)
- Preserve spaces between words

### Step 2: CMUdict Lookup
- Look up each word in CMUdict
- Handle unknown words with `[brackets]`
- Get ARPABET pronunciation

### Step 3: ARPABET to IPA Conversion
- Convert ARPABET symbols to IPA
- Remove stress markers and ignored symbols
- Prepare for nPA mapping

### Step 4: nPA Mapping (Priority Order)
1. **R-controlled vowels**: Replace vowel+r combinations
2. **Diphthongs**: Replace two-vowel combinations
3. **Individual sounds**: Map remaining IPA symbols

### Step 5: Output
- Apply nPA font
- Format final text
- Handle unknown words with brackets

## Core Functions

```typescript
// Main translation function
function translateToNPA(text: string, options?: TranslationOptions): string

// Text preprocessing with pronunciation conversion
function preprocessText(text: string): string

// Number and symbol pronunciation conversion
function convertNumbersToPronunciation(text: string): string

// Word-level translation with priority ordering
function translateWord(word: string, pronunciation?: string): string

// Multiple pronunciation selection
function getWordPronunciations(word: string): string[]

// R-controlled vowel detection and replacement
function processRControlledVowels(ipaString: string): string

// Diphthong detection and replacement
function processDiphthongs(ipaString: string): string

// Individual sound mapping
function mapIndividualSounds(ipaString: string): string

// Translation logging for failed words
function logFailedTranslation(word: string, context?: string): void

// Global state management
interface PhoneticContextType {
  isNPAMode: boolean;
  toggleNPAMode: () => void;
  translateText: (text: string) => string;
  translateWord: (word: string, pronunciation?: string) => string;
}
```

## Error Handling Strategy

### Unknown Words
- Wrap in `[brackets]` notation
- Preserve original spelling
- Allow for future dictionary additions

### Missing Pronunciations
- Fallback to letter-by-letter mapping
- Clear error messaging
- Graceful degradation

### Invalid Input
- Sanitize input text
- Handle special characters
- Provide helpful error messages

## Performance Optimization

### Performance Benchmarks
- **Single word translation**: < 10ms
- **1000-word text**: < 2 seconds
- **Cache hit ratio**: > 80% for repeated words
- **Memory usage**: < 50MB for full CMUdict
- **Font loading**: < 500ms with fallback

### Caching Strategy
- In-memory Map cache for word translations
- Cache key: `word + pronunciation_variant`
- Periodic cache clearing
- Target: >80% cache hit ratio

### Bulk Processing
- Chunk-based processing for large texts
- Progress indicators
- Non-blocking UI updates
- Cancellation support

### Browser Compatibility
- **Modern browsers**: Full support with nPA font
- **Older browsers**: Fallback to system fonts
- **Mobile devices**: Responsive design with touch-friendly interface
- **Screen readers**: Maintain accessibility with proper ARIA labels

## UI Components

### PhoneticTranslator Component
- Simple input/output interface
- Copy-to-clipboard functionality
- Progress indicators for bulk processing
- Error display for unknown words
- Pronunciation selection dropdown for multiple pronunciations
- Mobile-responsive design (desktop-optimized with mobile consideration)

### SiteToggle Component
- Header-integrated toggle
- Global state management
- Visual indicator of current mode
- Persistence across navigation

### Site-Wide Translation Implementation
- **Global Context**: React Context for nPA mode state
- **Content Translation**: Translate ALL text content (navigation, forms, dynamic content)
- **Dynamic Content**: Handle React component text updates
- **Performance**: Debounced translation to avoid excessive processing
- **Fallback**: Graceful degradation if translation fails
- **Persistence**: Save preference in localStorage
- **Scope**: All text elements including placeholders, labels, and accessibility text

## Implementation Phases

### Phase 1: Core Engine (Week 1)
1. Set up project structure
2. Implement CMUdict integration
3. Create nPA mapping system with priority ordering
4. Build core translation engine
5. Add error handling and caching

### Phase 2: UI Development (Week 2)
1. Create PhoneticTranslator component
2. Implement site-wide toggle
3. Add global state management
4. Style components to match site

### Phase 3: Advanced Features (Week 3)
1. Add bulk text processing
2. Implement copy-to-clipboard
3. Performance optimization
4. Comprehensive testing

## Testing Strategy

### Unit Tests
- Translation engine logic
- Priority ordering (r-controlled → diphthongs → individual)
- Error handling
- Cache management

### Integration Tests
- End-to-end translation workflow
- CMUdict integration
- UI component interactions
- Performance benchmarks

### Manual Testing
- Various word types and lengths
- R-controlled vowel examples
- Diphthong examples
- Unknown word handling

### Test Data Examples
- **Basic words**: "hello", "world", "computer"
- **R-controlled vowels**: "car", "air", "ear", "or", "poor", "her"
- **Diphthongs**: "face", "price", "boy", "mouth", "goat"
- **Numbers**: "1,234,567", "555-123-4567", "3.14159"
- **Symbols**: "$1,234.56", "2:30 PM", "Dr. Smith"
- **Complex text**: Mixed content with various patterns
- **Edge cases**: Unknown words, special characters, very long text

## Success Criteria

### Functional Requirements
- ✅ Accurate English to nPA translation
- ✅ Proper priority ordering for mappings
- ✅ R-controlled vowel handling
- ✅ Site-wide nPA toggle
- ✅ Unknown word handling with brackets
- ✅ Performance optimization

### Technical Requirements
- ✅ TypeScript implementation
- ✅ CMUdict integration
- ✅ Font loading and application
- ✅ Caching system
- ✅ Error handling

### User Experience Requirements
- ✅ Simple, intuitive interface
- ✅ Consistent site styling
- ✅ Fast translation speed
- ✅ Clear error messaging

## Risk Mitigation

### Technical Risks
- **CMUdict Size**: Bundle optimization and lazy loading
- **Font Loading**: Fallback fonts and preloading
- **Performance**: Web Workers for bulk processing
- **Future Extensibility**: Architecture designed for multi-language support

### User Experience Risks
- **Unknown Words**: Clear explanations and suggestions
- **Complex Interface**: Progressive disclosure and defaults
- **Mobile Experience**: Responsive design with desktop optimization

## Future Enhancements

### Phase 4+ Features
1. **Audio Integration**: Text-to-speech for nPA
2. **Learning Mode**: Interactive nPA character guide
3. **Custom Dictionaries**: User-defined word mappings
4. **Export Features**: Save translations to files
5. **Mobile App**: Standalone mobile translator
6. **API Service**: Public translation API

### Literary Analysis Features
7. **Rhyme Detection**: Identify rhyming patterns in text
8. **Assonance Mapping**: Visualize vowel sound patterns
9. **Alliteration Highlighting**: Mark consonant sound repetitions
10. **Phonetic Pattern Analysis**: Statistical analysis of sound distributions
11. **Rhyme Suggestion Tool**: Generate rhyming words based on phonetic patterns

### Educational Features
12. **Pronunciation Comparison**: Side-by-side English/nPA comparison
13. **Interactive Lessons**: Guided pronunciation exercises
14. **Progress Tracking**: Monitor learning progress over time
15. **Custom Word Lists**: Create subject-specific vocabulary sets

### Conlang Development Tools
16. **Phonology Analysis**: Study sound patterns for conlang development
17. **Orthography Testing**: Test nPA-based writing systems
18. **Grammar Integration**: Connect phonetic patterns to grammatical structures

## Ready for Implementation

All specifications are confirmed and the project structure is organized. The implementation plan is comprehensive and ready for execution. 