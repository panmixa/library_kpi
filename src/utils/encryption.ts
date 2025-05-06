import CryptoJS from 'crypto-js';

// This key should be stored securely in environment variables
const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'your-fallback-encryption-key-for-development';

/**
 * Encrypts data using AES encryption
 * @param data Any data that needs to be encrypted
 * @returns Encrypted string
 */
export const encrypt = (data: any): string => {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(dataString, ENCRYPTION_KEY).toString();
};

/**
 * Decrypts an encrypted string
 * @param encryptedData The encrypted data string
 * @returns Decrypted data
 */
export const decrypt = (encryptedData: string): any => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
  
  try {
    return JSON.parse(decryptedString);
  } catch (e) {
    // If not valid JSON, return as string
    return decryptedString;
  }
};
