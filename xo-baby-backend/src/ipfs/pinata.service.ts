import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface PinataConfig {
  apiKey: string;
  secretApiKey: string;
  gateway: string;
  gatewayToken?: string;
}

export interface PinataUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface PinataFileResponse {
  data: string;
  size: number;
}

@Injectable()
export class PinataService {
  private readonly logger = new Logger(PinataService.name);
  private readonly config: PinataConfig;
  private readonly baseUrl = 'https://api.pinata.cloud';
  
  // Cache for getData responses - never expires, always keeps as fallback
  private readonly dataCache = new Map<string, { data: string; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes for fresh cache
  
  // Rate limiting to avoid 429 errors
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 200; // minimum 200ms between requests

  constructor() {
    // Fix: Ensure gateway URL includes https://
    const gateway = process.env.PINATA_GATEWAY || 'harlequin-quiet-flamingo-121.mypinata.cloud';
    const gatewayWithProtocol = gateway.startsWith('http') 
      ? gateway 
      : `https://${gateway}`;
    
    this.config = {
      apiKey: process.env.PINATA_API_KEY || '',
      secretApiKey: process.env.PINATA_SECRET_API_KEY || '',
      gateway: gatewayWithProtocol,
      gatewayToken: process.env.PINATA_GATEWAY_TOKEN || 'oULXMuARhUSkROEB2tBm6_UfIrJj5ZCelqlTfhU70CjzltfMh6ul_yPsszE_dSdF',
    };
    
    this.logger.log(`🌐 Pinata gateway configured: ${this.config.gateway}`);
    this.logger.log(`🔑 Pinata gateway token configured: ${this.config.gatewayToken ? 'Yes' : 'No'}`);
  }

  private isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.secretApiKey);
  }

  /**
   * Wait to respect rate limits
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const delay = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Retry logic with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    initialDelay = 1000,
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Check if it's a rate limit error (429)
        const is429 = error?.response?.status === 429 || 
                      error?.message?.includes('429') ||
                      error?.message?.includes('Too Many Requests');
        
        if (is429 && attempt < maxRetries) {
          const delay = initialDelay * Math.pow(2, attempt);
          this.logger.warn(
            `⚠️  Rate limit hit (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        } else if (attempt < maxRetries) {
          const delay = initialDelay;
          this.logger.warn(
            `⚠️  Request failed (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Get data from cache if available and not expired
   */
  private getCachedData(hash: string, allowStale = false): string | null {
    const cached = this.dataCache.get(hash);
    
    if (cached) {
      const age = Date.now() - cached.timestamp;
      
      if (age < this.CACHE_TTL) {
        this.logger.debug(`💾 Cache hit for hash: ${hash} (age: ${Math.round(age / 1000)}s)`);
        return cached.data;
      } else if (allowStale) {
        // Return stale cache as fallback
        this.logger.warn(`💾 Returning stale cache for hash: ${hash} (age: ${Math.round(age / 1000)}s)`);
        return cached.data;
      }
    }
    
    return null;
  }

  /**
   * Store data in cache (never deleted - kept forever as fallback)
   */
  private setCachedData(hash: string, data: string): void {
    this.dataCache.set(hash, {
      data,
      timestamp: Date.now(),
    });
    this.logger.debug(`💾 Cached data for hash: ${hash}`);
  }

  async uploadJSON(data: any): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Pinata API credentials not configured');
    }

    try {
      this.logger.log('📤 Uploading JSON data to Pinata...');

      const response = await axios.post<PinataUploadResponse>(
        `${this.baseUrl}/pinning/pinJSONToIPFS`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            pinata_api_key: this.config.apiKey,
            pinata_secret_api_key: this.config.secretApiKey,
          },
        },
      );

      const hash = response.data.IpfsHash;
      this.logger.log(`✅ Data uploaded to Pinata with hash: ${hash}`);
      
      // ⭐ IMPORTANT: Cache the uploaded data immediately!
      // This ensures it's available even if gateway retrieval fails later
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      this.setCachedData(hash, dataString);
      this.logger.log(`💾 Cached uploaded data for hash: ${hash}`);
      
      return hash;
    } catch (error) {
      this.logger.error(`❌ Failed to upload to Pinata: ${error.message}`);
      throw new Error(`Pinata upload failed: ${error.message}`);
    }
  }

  async uploadString(data: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Pinata API credentials not configured');
    }

    try {
      this.logger.log('📤 Uploading string data to Pinata...');

      // Convert string to JSON object for Pinata
      const jsonData = {
        data: data,
        name: `data-${Date.now()}`,
        description: 'Encrypted data uploaded via Pinata API',
      };

      const response = await axios.post<PinataUploadResponse>(
        `${this.baseUrl}/pinning/pinJSONToIPFS`,
        jsonData,
        {
          headers: {
            'Content-Type': 'application/json',
            pinata_api_key: this.config.apiKey,
            pinata_secret_api_key: this.config.secretApiKey,
          },
        },
      );

      const hash = response.data.IpfsHash;
      this.logger.log(`✅ String data uploaded to Pinata with hash: ${hash}`);
      
      // ⭐ Cache the uploaded data immediately
      this.setCachedData(hash, JSON.stringify(jsonData));
      this.logger.log(`💾 Cached uploaded string data for hash: ${hash}`);
      
      return hash;
    } catch (error) {
      this.logger.error(
        `❌ Failed to upload string to Pinata: ${error.message}`,
      );
      throw new Error(`Pinata string upload failed: ${error.message}`);
    }
  }

  async uploadFile(buffer: Buffer, filename: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Pinata API credentials not configured');
    }

    try {
      this.logger.log(`📤 Uploading file ${filename} to Pinata...`);

      const formData = new FormData();
      formData.append('file', new Blob([new Uint8Array(buffer)]), filename);

      const response = await axios.post<PinataUploadResponse>(
        `${this.baseUrl}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            pinata_api_key: this.config.apiKey,
            pinata_secret_api_key: this.config.secretApiKey,
          },
        },
      );

      const hash = response.data.IpfsHash;
      this.logger.log(`✅ File uploaded to Pinata with hash: ${hash}`);
      return hash;
    } catch (error) {
      this.logger.error(`❌ Failed to upload file to Pinata: ${error.message}`);
      throw new Error(`Pinata file upload failed: ${error.message}`);
    }
  }

  async getData(hash: string): Promise<string> {
    // 1. Check fresh cache first
    const cachedData = this.getCachedData(hash, false);
    if (cachedData) {
      return cachedData;
    }

    // 2. Wait for rate limit
    await this.waitForRateLimit();

    // 3. Try to fetch with retry logic
    try {
      const data = await this.retryWithBackoff(async () => {
        this.logger.log(`📥 Retrieving data from Pinata gateway: ${hash}`);

        // Build URL with gateway token as query parameter
        let gatewayUrl = `${this.config.gateway}/ipfs/${hash}`;
        if (this.config.gatewayToken) {
          gatewayUrl += `?pinataGatewayToken=${this.config.gatewayToken}`;
        }

        const requestConfig: any = {
          timeout: 10000,
        };

        const response = await axios.get(gatewayUrl, requestConfig);

        // If the response is JSON with a data field, extract it
        let result: string;
        if (typeof response.data === 'object' && response.data.data) {
          result = response.data.data;
        } else {
          // Otherwise return the data as string
          result = typeof response.data === 'string'
            ? response.data
            : JSON.stringify(response.data);
        }

        return result;
      });

      // Cache the successful result
      this.setCachedData(hash, data);
      
      return data;
    } catch (error) {
      // 4. ⭐ FALLBACK: If request failed, try to return stale cache
      const staleData = this.getCachedData(hash, true);
      
      if (staleData) {
        this.logger.warn(
          `⚠️  Pinata request failed but returning cached data for hash: ${hash}`
        );
        return staleData;
      }
      
      // 5. No cache available, throw the error
      this.logger.error(
        `❌ Failed to retrieve data from Pinata and no cache available: ${error.message}`,
      );
      throw new Error(`Pinata data retrieval failed: ${error.message}`);
    }
  }

  getGatewayUrl(hash: string): string {
    let url = `${this.config.gateway}/ipfs/${hash}`;
    if (this.config.gatewayToken) {
      url += `?pinataGatewayToken=${this.config.gatewayToken}`;
    }
    return url;
  }

  async pinHash(hash: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Pinata API credentials not configured');
    }

    try {
      this.logger.log(`📌 Pinning hash to Pinata: ${hash}`);

      await axios.post(
        `${this.baseUrl}/pinning/pinHashToIPFS`,
        {
          hashToPin: hash,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            pinata_api_key: this.config.apiKey,
            pinata_secret_api_key: this.config.secretApiKey,
          },
        },
      );

      this.logger.log(`✅ Hash pinned to Pinata: ${hash}`);
    } catch (error) {
      this.logger.error(`❌ Failed to pin hash to Pinata: ${error.message}`);
      throw new Error(`Pinata pinning failed: ${error.message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      this.logger.log('🔍 Testing Pinata connection...');

      const response = await axios.get(
        `${this.baseUrl}/data/testAuthentication`,
        {
          headers: {
            pinata_api_key: this.config.apiKey,
            pinata_secret_api_key: this.config.secretApiKey,
          },
        },
      );

      const isConnected = response.status === 200;
      this.logger.log(
        `✅ Pinata connection test: ${isConnected ? 'SUCCESS' : 'FAILED'}`,
      );
      return isConnected;
    } catch (error) {
      this.logger.error(`❌ Pinata connection test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Clear the cache (useful for testing or when data needs to be refreshed)
   */
  clearCache(hash?: string): void {
    if (hash) {
      this.dataCache.delete(hash);
      this.logger.log(`🗑️  Cache cleared for hash: ${hash}`);
    } else {
      this.dataCache.clear();
      this.logger.log(`🗑️  All cache cleared (${this.dataCache.size} entries)`);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.dataCache.size,
      entries: Array.from(this.dataCache.keys()),
    };
  }
}
