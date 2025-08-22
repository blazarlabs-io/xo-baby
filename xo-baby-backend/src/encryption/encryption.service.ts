import { Injectable, Logger } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  /**
   * Generate a random AES key (256-bit)
   */
  generateAESKey(): string {
    try {
      const key = CryptoJS.lib.WordArray.random(256 / 8).toString();
      this.logger.log('🔑 Generated new AES-256 encryption key');
      return key;
    } catch (error) {
      this.logger.error(`❌ Failed to generate AES key: ${error.message}`);
      throw new Error(`Key generation failed: ${error.message}`);
    }
  }

  /**
   * Encrypt data using AES-256 encryption with additional security
   */
  encrypt(data: string, key: string): string {
    try {
      if (!data) {
        throw new Error('Data to encrypt cannot be empty');
      }
      if (!key) {
        throw new Error('Encryption key cannot be empty');
      }

      // Generate a random IV for each encryption
      const iv = CryptoJS.lib.WordArray.random(128 / 8);

      const encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      // Combine IV and encrypted data for storage
      const combined = iv.toString() + ':' + encrypted.toString();

      this.logger.log('🔐 Data encrypted successfully with AES-256-CBC');
      return combined;
    } catch (error) {
      this.logger.error(`❌ Encryption failed: ${error.message}`);
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt data using AES-256 decryption
   */
  decrypt(encryptedData: string, key: string): string {
    try {
      if (!encryptedData) {
        throw new Error('Encrypted data cannot be empty');
      }
      if (!key) {
        throw new Error('Decryption key cannot be empty');
      }

      // Check if this is the new format with IV
      if (encryptedData.includes(':')) {
        const parts = encryptedData.split(':');
        if (parts.length !== 2) {
          throw new Error('Invalid encrypted data format');
        }

        const iv = CryptoJS.enc.Hex.parse(parts[0]);
        const encrypted = parts[1];

        const bytes = CryptoJS.AES.decrypt(encrypted, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        });

        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        if (!decrypted) {
          throw new Error(
            'Failed to decrypt data - invalid key or corrupted data',
          );
        }

        this.logger.log('🔓 Data decrypted successfully');
        return decrypted;
      } else {
        // Fallback for old format without IV (backwards compatibility)
        this.logger.warn(
          '⚠️ Using legacy decryption format - consider re-encrypting data',
        );
        const bytes = CryptoJS.AES.decrypt(encryptedData, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        if (!decrypted) {
          throw new Error(
            'Failed to decrypt data - invalid key or corrupted data',
          );
        }

        return decrypted;
      }
    } catch (error) {
      this.logger.error(`❌ Decryption failed: ${error.message}`);
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Encrypt object data (converts to JSON first) with medical data validation
   */
  encryptObject(data: any, key: string): string {
    try {
      if (!data) {
        throw new Error('Object to encrypt cannot be null or undefined');
      }

      // Add encryption metadata for medical data
      const dataWithMetadata = {
        ...data,
        encryptionMetadata: {
          encryptedAt: new Date().toISOString(),
          version: '2.0', // Updated version for new encryption format
          algorithm: 'AES-256-CBC',
          purpose: 'medical-data-protection',
        },
      };

      const jsonString = JSON.stringify(dataWithMetadata);
      this.logger.log(
        `🔐 Encrypting medical data object (${jsonString.length} characters)`,
      );

      return this.encrypt(jsonString, key);
    } catch (error) {
      this.logger.error(`❌ Object encryption failed: ${error.message}`);
      throw new Error(`Object encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt to object (parses JSON after decryption) with validation
   */
  decryptToObject(encryptedData: string, key: string): any {
    try {
      const decryptedString = this.decrypt(encryptedData, key);

      if (!decryptedString) {
        throw new Error('Decrypted data is empty');
      }

      const parsedData = JSON.parse(decryptedString);

      // Validate medical data structure
      if (parsedData.encryptionMetadata) {
        this.logger.log(
          `🔓 Successfully decrypted medical data (version: ${parsedData.encryptionMetadata.version})`,
        );

        // Remove encryption metadata before returning
        const { encryptionMetadata, ...actualData } = parsedData;
        return actualData;
      } else {
        // Legacy data without metadata
        this.logger.warn(
          '⚠️ Decrypted legacy medical data without encryption metadata',
        );
        return parsedData;
      }
    } catch (error) {
      this.logger.error(`❌ Object decryption failed: ${error.message}`);
      throw new Error(`Object decryption failed: ${error.message}`);
    }
  }

  /**
   * Generate a secure hash for data integrity verification
   */
  generateDataHash(data: string): string {
    try {
      const hash = CryptoJS.SHA256(data).toString();
      this.logger.log('🔍 Generated SHA-256 hash for data integrity');
      return hash;
    } catch (error) {
      this.logger.error(`❌ Hash generation failed: ${error.message}`);
      throw new Error(`Hash generation failed: ${error.message}`);
    }
  }

  /**
   * Verify data integrity using hash
   */
  verifyDataHash(data: string, expectedHash: string): boolean {
    try {
      const actualHash = this.generateDataHash(data);
      const isValid = actualHash === expectedHash;

      if (isValid) {
        this.logger.log('✅ Data integrity verification successful');
      } else {
        this.logger.warn(
          '⚠️ Data integrity verification failed - data may be corrupted',
        );
      }

      return isValid;
    } catch (error) {
      this.logger.error(`❌ Hash verification failed: ${error.message}`);
      return false;
    }
  }
}
