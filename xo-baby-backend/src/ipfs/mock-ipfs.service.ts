import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MockIpfsService {
  private readonly logger = new Logger(MockIpfsService.name);
  private storage = new Map<string, string>();
  private readonly storageDir = path.join(process.cwd(), 'mock-ipfs-storage');

  constructor() {
    this.initializeStorage();
  }

  /**
   * Initialize persistent storage directory
   */
  private initializeStorage(): void {
    try {
      if (!fs.existsSync(this.storageDir)) {
        fs.mkdirSync(this.storageDir, { recursive: true });
        this.logger.log(
          `📁 Created mock IPFS storage directory: ${this.storageDir}`,
        );
      }

      // Load existing data from files
      this.loadExistingData();
    } catch (error) {
      this.logger.warn(
        `⚠️ Could not initialize persistent storage: ${error.message}`,
      );
      this.logger.log('📝 Using in-memory storage only');
    }
  }

  /**
   * Load existing data from storage directory
   */
  private loadExistingData(): void {
    try {
      const files = fs.readdirSync(this.storageDir);
      let loadedCount = 0;

      for (const file of files) {
        if (file.endsWith('.json')) {
          const hash = file.replace('.json', '');
          const data = this.loadFromFile(hash);
          if (data) {
            this.storage.set(hash, data);
            loadedCount++;
          }
        }
      }

      if (loadedCount > 0) {
        this.logger.log(
          `📂 Loaded ${loadedCount} items from persistent storage`,
        );
      }
    } catch (error) {
      this.logger.warn(`⚠️ Could not load existing data: ${error.message}`);
    }
  }

  /**
   * Save data to persistent storage (using base64 encoding to handle binary data)
   */
  private saveToFile(hash: string, data: string): void {
    try {
      const filePath = path.join(this.storageDir, `${hash}.json`);
      // Encode data as base64 to safely store binary/encrypted data
      const encodedData = Buffer.from(data, 'utf8').toString('base64');
      const fileContent = JSON.stringify({
        hash,
        data: encodedData,
        timestamp: new Date().toISOString(),
        encoding: 'base64',
      });
      fs.writeFileSync(filePath, fileContent, 'utf8');
    } catch (error) {
      this.logger.warn(`⚠️ Could not save to file: ${error.message}`);
    }
  }

  /**
   * Mock upload that simulates IPFS behavior
   */
  async uploadString(data: string): Promise<string> {
    this.logger.log('📦 Mock IPFS: Uploading string data...');

    // Generate a mock IPFS hash (QmXXX format)
    const hash = this.generateMockHash(data);

    // Store data in memory
    this.storage.set(hash, data);

    // Save to persistent file storage
    this.saveToFile(hash, data);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    this.logger.log(`✅ Mock IPFS: Data uploaded with hash: ${hash}`);
    return hash;
  }

  /**
   * Mock upload for objects
   */
  async uploadObject(data: any): Promise<string> {
    const jsonString = JSON.stringify(data);
    return this.uploadString(jsonString);
  }

  /**
   * Mock upload for buffers
   */
  async uploadBuffer(buffer: Buffer): Promise<string> {
    return this.uploadString(buffer.toString());
  }

  /**
   * Mock retrieval
   */
  async getData(hash: string): Promise<string> {
    this.logger.log(`📥 Mock IPFS: Retrieving data with hash: ${hash}`);

    // Try to get from memory first
    let data = this.storage.get(hash);

    // If not in memory, try to load from file
    if (!data) {
      const fileData = this.loadFromFile(hash);
      if (fileData) {
        data = fileData;
        // Add to memory for faster future access
        this.storage.set(hash, data);
        this.logger.log(
          `📂 Loaded data from persistent storage for hash: ${hash}`,
        );
      }
    }

    if (!data) {
      throw new Error(`Mock IPFS: Data not found for hash: ${hash}`);
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    this.logger.log('✅ Mock IPFS: Data retrieved successfully');
    return data;
  }

  /**
   * Load data from persistent file storage (decoding base64 data)
   */
  private loadFromFile(hash: string): string | null {
    try {
      const filePath = path.join(this.storageDir, `${hash}.json`);
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');

        // Try to parse as JSON (new format with base64 encoding)
        try {
          const parsed = JSON.parse(fileContent);
          if (parsed.encoding === 'base64' && parsed.data) {
            // Decode base64 data back to original string
            return Buffer.from(parsed.data, 'base64').toString('utf8');
          }
        } catch (parseError) {
          // Fallback: treat as raw data (old format - for backwards compatibility)
          this.logger.warn(`📄 Loading legacy format for hash: ${hash}`);
          return fileContent;
        }
      }
    } catch (error) {
      this.logger.warn(`⚠️ Could not load from file: ${error.message}`);
    }
    return null;
  }

  /**
   * Generate gateway URL (mock)
   */
  getGatewayUrl(
    hash: string,
    gateway: string = 'https://mock-ipfs.local/',
  ): string {
    return `${gateway}${hash}`;
  }

  /**
   * Mock pinning
   */
  async pinContent(hash: string): Promise<void> {
    this.logger.log(`📌 Mock IPFS: Content pinned: ${hash}`);
  }

  /**
   * Generate a realistic looking IPFS hash (46 characters like real IPFS)
   */
  private generateMockHash(data: string): string {
    // Create a realistic 46-character IPFS hash
    const timestamp = Date.now().toString();
    const combined = data + timestamp + Math.random().toString();

    // Generate a 44-character hash (46 - 2 for "Qm" prefix)
    const fullHash = this.simpleHash(combined);
    return `Qm${fullHash}`;
  }

  /**
   * Enhanced hash function to generate 44-character strings
   */
  private simpleHash(str: string): string {
    let hash = 0;
    let hash2 = 1;

    // Create multiple hash values for longer output
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash2 = (hash2 << 3) - hash2 + char + i;
      hash = hash & hash; // Convert to 32bit integer
      hash2 = hash2 & hash2;
    }

    // Combine hashes and convert to base36 for realistic look
    const part1 = Math.abs(hash).toString(36);
    const part2 = Math.abs(hash2).toString(36);
    const part3 = Math.abs(hash ^ hash2).toString(36);
    const part4 = Date.now().toString(36);

    // Combine and pad to get exactly 44 characters
    const combined = (part1 + part2 + part3 + part4).toLowerCase();
    return combined.padEnd(44, '0').substring(0, 44);
  }

  /**
   * Clear storage (for testing)
   */
  clearStorage(): void {
    this.storage.clear();
    this.logger.log('🗑️ Mock IPFS: Storage cleared');
  }

  /**
   * Get storage stats
   */
  getStats(): { totalItems: number; hashes: string[]; storageDir: string } {
    return {
      totalItems: this.storage.size,
      hashes: Array.from(this.storage.keys()),
      storageDir: this.storageDir,
    };
  }

  /**
   * Clean up persistent storage (for testing)
   */
  cleanupPersistentStorage(): void {
    try {
      if (fs.existsSync(this.storageDir)) {
        const files = fs.readdirSync(this.storageDir);
        for (const file of files) {
          fs.unlinkSync(path.join(this.storageDir, file));
        }
        this.logger.log('🗑️ Mock IPFS: Persistent storage cleaned up');
      }
    } catch (error) {
      this.logger.warn(`⚠️ Could not clean up storage: ${error.message}`);
    }
  }
}
