import { TranslationCache, CacheStats } from '../types/phonetic';

// Cache configuration
const CACHE_CONFIG = {
  maxSize: 10000, // Maximum number of cached entries
  maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  cleanupInterval: 60 * 60 * 1000, // 1 hour cleanup interval
};

// Global cache instance
let translationCache: TranslationCache = {};
let cacheStats: CacheStats = {
  hits: 0,
  misses: 0,
  size: 0,
  hitRatio: 0,
};

// Cache cleanup timer
let cleanupTimer: NodeJS.Timeout | null = null;

// Initialize cache
export function initializeCache(): void {
  // Start periodic cleanup
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
  }
  
  cleanupTimer = setInterval(cleanupCache, CACHE_CONFIG.cleanupInterval);
  
  // Load cache from localStorage if available
  loadCacheFromStorage();
}

// Generate cache key
export function generateCacheKey(word: string, pronunciation?: string): string {
  return pronunciation ? `${word}:${pronunciation}` : word;
}

// Get cached translation
export function getCachedTranslation(word: string, pronunciation?: string): string | null {
  const key = generateCacheKey(word, pronunciation);
  const entry = translationCache[key];
  
  if (!entry) {
    cacheStats.misses++;
    updateHitRatio();
    return null;
  }
  
  // Check if entry has expired
  if (Date.now() - entry.timestamp > CACHE_CONFIG.maxAge) {
    delete translationCache[key];
    cacheStats.misses++;
    updateHitRatio();
    return null;
  }
  
  cacheStats.hits++;
  updateHitRatio();
  return entry.npa;
}

// Cache translation
export function cacheTranslation(word: string, npa: string, pronunciation?: string): void {
  const key = generateCacheKey(word, pronunciation);
  
  // Check if cache is full
  if (Object.keys(translationCache).length >= CACHE_CONFIG.maxSize) {
    cleanupCache();
  }
  
  translationCache[key] = {
    npa,
    timestamp: Date.now(),
    pronunciation: pronunciation || '',
  };
  
  cacheStats.size = Object.keys(translationCache).length;
}

// Clean up expired entries
export function cleanupCache(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  for (const [key, entry] of Object.entries(translationCache)) {
    if (now - entry.timestamp > CACHE_CONFIG.maxAge) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => {
    delete translationCache[key];
  });
  
  cacheStats.size = Object.keys(translationCache).length;
  
  // Save cache to localStorage
  saveCacheToStorage();
}

// Clear entire cache
export function clearCache(): void {
  translationCache = {};
  cacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    hitRatio: 0,
  };
  
  // Clear from localStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('npa-translation-cache');
    localStorage.removeItem('npa-cache-stats');
  }
}

// Get cache statistics
export function getCacheStats(): CacheStats {
  return { ...cacheStats };
}

// Update hit ratio
function updateHitRatio(): void {
  const total = cacheStats.hits + cacheStats.misses;
  cacheStats.hitRatio = total > 0 ? cacheStats.hits / total : 0;
}

// Save cache to localStorage
function saveCacheToStorage(): void {
  if (typeof localStorage === 'undefined') return;
  
  try {
    localStorage.setItem('npa-translation-cache', JSON.stringify(translationCache));
    localStorage.setItem('npa-cache-stats', JSON.stringify(cacheStats));
  } catch (error) {
    console.warn('Failed to save cache to localStorage:', error);
  }
}

// Load cache from localStorage
function loadCacheFromStorage(): void {
  if (typeof localStorage === 'undefined') return;
  
  try {
    const cachedData = localStorage.getItem('npa-translation-cache');
    const cachedStats = localStorage.getItem('npa-cache-stats');
    
    if (cachedData) {
      translationCache = JSON.parse(cachedData);
    }
    
    if (cachedStats) {
      cacheStats = JSON.parse(cachedStats);
    }
    
    // Clean up expired entries after loading
    cleanupCache();
  } catch (error) {
    console.warn('Failed to load cache from localStorage:', error);
    // Reset cache if loading fails
    translationCache = {};
    cacheStats = {
      hits: 0,
      misses: 0,
      size: 0,
      hitRatio: 0,
    };
  }
}

// Preload common words into cache
export function preloadCommonWords(_commonWords: string[]): void {
  // This will be called after the translation engine is ready
  // to preload frequently used words
}

// Get cache size
export function getCacheSize(): number {
  return Object.keys(translationCache).length;
}

// Check if cache is full
export function isCacheFull(): boolean {
  return getCacheSize() >= CACHE_CONFIG.maxSize;
}

// Get cache memory usage estimate (rough calculation)
export function getCacheMemoryUsage(): number {
  let totalSize = 0;
  
  for (const [key, entry] of Object.entries(translationCache)) {
    // Rough estimate: key length + npa length + timestamp + pronunciation length
    totalSize += key.length + entry.npa.length + 8 + entry.pronunciation.length;
  }
  
  return totalSize;
}

// Export cache for debugging/testing
export function exportCache(): TranslationCache {
  return { ...translationCache };
}

// Import cache (for testing or migration)
export function importCache(cacheData: TranslationCache): void {
  translationCache = { ...cacheData };
  cacheStats.size = Object.keys(translationCache).length;
  saveCacheToStorage();
}

// Cleanup on page unload
export function cleanupOnUnload(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
  
  saveCacheToStorage();
}

// Initialize cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupOnUnload);
} 