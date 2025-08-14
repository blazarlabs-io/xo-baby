import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class EncryptionService {
  /**
   * Generate a random AES key
   */
  generateAESKey(): string {
    return CryptoJS.lib.WordArray.random(256 / 8).toString();
  }

  /**
   * Encrypt data using AES encryption
   */
  encrypt(data: string, key: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(data, key).toString();
      return encrypted;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt data using AES decryption
   */
  decrypt(encryptedData: string, key: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, key);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        throw new Error(
          'Failed to decrypt data - invalid key or corrupted data',
        );
      }

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Encrypt object data (converts to JSON first)
   */
  encryptObject(data: any, key: string): string {
    const jsonString = JSON.stringify(data);
    return this.encrypt(jsonString, key);
  }

  /**
   * Decrypt to object (parses JSON after decryption)
   */
  decryptToObject(encryptedData: string, key: string): any {
    const decryptedString = this.decrypt(encryptedData, key);
    return JSON.parse(decryptedString);
  }
}
