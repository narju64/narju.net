// Security utilities for the secret pages

// Simple hash function (not cryptographically secure, but better than plain text)
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
};

// Salt for additional security
const SALT = 'narju_secret_2024';

// Hash the password with salt
export const hashPassword = (password: string): string => {
  return simpleHash(password + SALT);
};

// Get the secret password from environment variables
const getSecretPassword = (): string => {
  // For Vite, environment variables need to be prefixed with VITE_
  return import.meta.env.VITE_ACCESS_CODE || '1234';
};

// Check if password is correct
export const verifyPassword = (password: string): boolean => {
  const hashedInput = hashPassword(password);
  const correctHash = hashPassword(getSecretPassword());
  return hashedInput === correctHash;
};

// Generate a random encryption key
const generateKey = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Simple encryption (XOR with key)
const encrypt = (text: string, key: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result); // Base64 encode
};

// Simple decryption
const decrypt = (encryptedText: string, key: string): string => {
  const decoded = atob(encryptedText); // Base64 decode
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
};

// Store encrypted data
export const storeEncryptedData = (key: string, data: any): void => {
  const encryptionKey = generateKey();
  const encryptedData = encrypt(JSON.stringify(data), encryptionKey);
  
  // Store encrypted data and key separately
  sessionStorage.setItem('encrypted_data', encryptedData);
  sessionStorage.setItem('encryption_key', encryptionKey);
  sessionStorage.setItem('data_key', key);
};

// Retrieve and decrypt data
export const getEncryptedData = (key: string): any | null => {
  const storedKey = sessionStorage.getItem('data_key');
  if (storedKey !== key) return null;
  
  const encryptedData = sessionStorage.getItem('encrypted_data');
  const encryptionKey = sessionStorage.getItem('encryption_key');
  
  if (!encryptedData || !encryptionKey) return null;
  
  try {
    const decrypted = decrypt(encryptedData, encryptionKey);
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
};

// Clear all encrypted data
export const clearEncryptedData = (): void => {
  sessionStorage.removeItem('encrypted_data');
  sessionStorage.removeItem('encryption_key');
  sessionStorage.removeItem('data_key');
  sessionStorage.removeItem('secretAuth');
};

// Rate limiting for password attempts
export class RateLimiter {
  private attempts: number = 0;
  private lastAttempt: number = 0;
  private lockoutUntil: number = 0;
  
  constructor(
    private maxAttempts: number = 5,
    private lockoutDuration: number = 300000 // 5 minutes
  ) {}
  
  canAttempt(): boolean {
    const now = Date.now();
    
    // Check if still locked out
    if (now < this.lockoutUntil) {
      return false;
    }
    
    // Reset attempts if enough time has passed
    if (now - this.lastAttempt > 60000) { // 1 minute
      this.attempts = 0;
    }
    
    return this.attempts < this.maxAttempts;
  }
  
  recordAttempt(): void {
    this.attempts++;
    this.lastAttempt = Date.now();
    
    if (this.attempts >= this.maxAttempts) {
      this.lockoutUntil = Date.now() + this.lockoutDuration;
    }
  }
  
  getLockoutTime(): number {
    return Math.max(0, this.lockoutUntil - Date.now());
  }
} 