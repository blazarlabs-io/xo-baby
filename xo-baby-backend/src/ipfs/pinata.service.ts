import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface PinataConfig {
  apiKey: string;
  secretApiKey: string;
  gateway: string;
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

  constructor() {
    this.config = {
      apiKey: process.env.PINATA_API_KEY || '',
      secretApiKey: process.env.PINATA_SECRET_API_KEY || '',
      gateway: process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud',
    };
  }

  /**
   * Check if Pinata is properly configured
   */
  private isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.secretApiKey);
  }

  /**
   * Upload JSON data to Pinata
   */
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
      return hash;
    } catch (error) {
      this.logger.error(`❌ Failed to upload to Pinata: ${error.message}`);
      throw new Error(`Pinata upload failed: ${error.message}`);
    }
  }

  /**
   * Upload string data to Pinata
   */
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
      return hash;
    } catch (error) {
      this.logger.error(
        `❌ Failed to upload string to Pinata: ${error.message}`,
      );
      throw new Error(`Pinata string upload failed: ${error.message}`);
    }
  }

  /**
   * Upload file buffer to Pinata
   */
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

  /**
   * Retrieve data from Pinata gateway
   */
  async getData(hash: string): Promise<string> {
    try {
      this.logger.log(`📥 Retrieving data from Pinata gateway: ${hash}`);

      const response = await axios.get(`${this.config.gateway}/ipfs/${hash}`, {
        timeout: 10000,
      });

      // If the response is JSON with a data field, extract it
      if (typeof response.data === 'object' && response.data.data) {
        return response.data.data;
      }

      // Otherwise return the data as string
      return typeof response.data === 'string'
        ? response.data
        : JSON.stringify(response.data);
    } catch (error) {
      this.logger.error(
        `❌ Failed to retrieve data from Pinata: ${error.message}`,
      );
      throw new Error(`Pinata data retrieval failed: ${error.message}`);
    }
  }

  /**
   * Get Pinata gateway URL for a hash
   */
  getGatewayUrl(hash: string): string {
    return `${this.config.gateway}/ipfs/${hash}`;
  }

  /**
   * Pin an existing IPFS hash to Pinata
   */
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

  /**
   * Test Pinata connection
   */
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
}
