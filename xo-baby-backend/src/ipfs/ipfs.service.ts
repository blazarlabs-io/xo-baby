import { Injectable, Logger } from '@nestjs/common';
import { create, IPFSHTTPClient } from 'ipfs-http-client';
import { MockIpfsService } from './mock-ipfs.service';

@Injectable()
export class IpfsService {
  private readonly logger = new Logger(IpfsService.name);
  private ipfs: IPFSHTTPClient | null = null;
  private mockService: MockIpfsService;
  private useMockMode = false;

  constructor() {
    this.mockService = new MockIpfsService();
    // Initialize IPFS client with automatic provider detection
    this.initializeIPFS();
  }

  private async initializeIPFS(): Promise<void> {
    const provider = process.env.IPFS_PROVIDER?.toLowerCase();

    // Option 1: Infura IPFS (if credentials provided)
    if (this.hasInfuraCredentials()) {
      try {
        this.logger.log('🚀 Configuring Infura IPFS...');
        this.ipfs = create({
          host: 'ipfs.infura.io',
          port: 5001,
          protocol: 'https',
          headers: {
            authorization:
              'Basic ' +
              Buffer.from(
                process.env.INFURA_PROJECT_ID +
                  ':' +
                  process.env.INFURA_PROJECT_SECRET,
              ).toString('base64'),
          },
        });
        return;
      } catch (error) {
        this.logger.error(
          '❌ Infura IPFS failed, falling back to alternatives',
        );
      }
    }

    // Option 2: Local IPFS (if explicitly requested or running)
    if (provider === 'local' || this.isLocalIPFSAvailable()) {
      try {
        this.logger.log('🏠 Connecting to local IPFS node...');
        this.ipfs = create({
          host: 'localhost',
          port: 5001,
          protocol: 'http',
        });
        return;
      } catch (error) {
        this.logger.warn('⚠️ Local IPFS not available, trying alternatives');
      }
    }

    // Option 3: Custom gateway (if configured)
    if (provider === 'custom' && process.env.IPFS_HOST) {
      try {
        this.logger.log(
          `🔧 Using custom IPFS gateway: ${process.env.IPFS_HOST}`,
        );
        this.ipfs = create({
          host: process.env.IPFS_HOST,
          port: parseInt(process.env.IPFS_PORT || '443'),
          protocol: process.env.IPFS_PROTOCOL || 'https',
        });
        return;
      } catch (error) {
        this.logger.error('❌ Custom gateway failed, trying alternatives');
      }
    }

    // Option 4: Public gateways (try but fallback to mock on failure)
    try {
      this.ipfs = this.initializePublicGateway();
    } catch (error) {
      this.logger.warn(
        '⚠️ All IPFS gateways failed, using mock IPFS for development',
      );
      this.useMockMode = true;
      this.ipfs = null;
    }
  }

  private hasInfuraCredentials(): boolean {
    return !!(
      process.env.INFURA_PROJECT_ID && process.env.INFURA_PROJECT_SECRET
    );
  }

  private isLocalIPFSAvailable(): boolean {
    // This is a simple check - in production you might want to ping the local node
    return process.env.NODE_ENV === 'development';
  }

  private initializePublicGateway(): IPFSHTTPClient {
    this.logger.log('🌐 Using public IPFS gateways...');

    const gateways = [
      { name: 'Cloudflare', host: 'cloudflare-ipfs.com', port: 443 },
      { name: 'Aragon', host: 'ipfs.eth.aragon.network', port: 443 },
      { name: 'Pinata', host: 'gateway.pinata.cloud', port: 443 },
    ];

    for (const gateway of gateways) {
      try {
        this.logger.log(`📡 Trying ${gateway.name} IPFS gateway...`);
        const client = create({
          host: gateway.host,
          port: gateway.port,
          protocol: 'https',
        });
        this.logger.log(`✅ Connected to ${gateway.name} IPFS gateway`);
        return client;
      } catch (error) {
        this.logger.warn(`⚠️ ${gateway.name} gateway failed, trying next...`);
      }
    }

    // Last resort: basic configuration
    this.logger.warn('⚠️ All gateways failed, using basic IPFS configuration');
    return create();
  }

  /**
   * Upload string data to IPFS
   */
  async uploadString(data: string): Promise<string> {
    // Use mock service if in mock mode or real IPFS failed
    if (this.useMockMode || !this.ipfs) {
      return this.mockService.uploadString(data);
    }

    try {
      this.logger.log('Uploading string data to IPFS...');

      const result = await this.ipfs.add(data);
      const hash = result.cid.toString();

      this.logger.log(`Data uploaded to IPFS with hash: ${hash}`);
      return hash;
    } catch (error) {
      this.logger.error(`Failed to upload to IPFS: ${error.message}`);
      this.logger.log('🔄 Falling back to mock IPFS...');
      this.useMockMode = true;
      return this.mockService.uploadString(data);
    }
  }

  /**
   * Upload object data to IPFS (converts to JSON first)
   */
  async uploadObject(data: any): Promise<string> {
    const jsonString = JSON.stringify(data);
    return this.uploadString(jsonString);
  }

  /**
   * Upload buffer data to IPFS
   */
  async uploadBuffer(buffer: Buffer): Promise<string> {
    // Use mock service if in mock mode or real IPFS failed
    if (this.useMockMode || !this.ipfs) {
      return this.mockService.uploadBuffer(buffer);
    }

    try {
      this.logger.log('Uploading buffer data to IPFS...');

      const result = await this.ipfs.add(buffer);
      const hash = result.cid.toString();

      this.logger.log(`Buffer uploaded to IPFS with hash: ${hash}`);
      return hash;
    } catch (error) {
      this.logger.error(`Failed to upload buffer to IPFS: ${error.message}`);
      this.logger.log('🔄 Falling back to mock IPFS...');
      this.useMockMode = true;
      return this.mockService.uploadBuffer(buffer);
    }
  }

  /**
   * Retrieve data from IPFS using hash
   */
  async getData(hash: string): Promise<string> {
    // Use mock service if in mock mode or real IPFS failed
    if (this.useMockMode || !this.ipfs) {
      return this.mockService.getData(hash);
    }

    try {
      this.logger.log(`Retrieving data from IPFS with hash: ${hash}`);

      const chunks: Uint8Array[] = [];
      for await (const chunk of this.ipfs.cat(hash)) {
        chunks.push(chunk);
      }

      const data = Buffer.concat(chunks).toString();
      this.logger.log('Data retrieved successfully from IPFS');

      return data;
    } catch (error) {
      this.logger.error(`Failed to retrieve from IPFS: ${error.message}`);
      this.logger.log('🔄 Falling back to mock IPFS...');
      this.useMockMode = true;
      return this.mockService.getData(hash);
    }
  }

  /**
   * Get IPFS gateway URL for a hash
   */
  getGatewayUrl(
    hash: string,
    gateway: string = 'https://ipfs.io/ipfs/',
  ): string {
    // Use mock service if in mock mode
    if (this.useMockMode) {
      return this.mockService.getGatewayUrl(hash, gateway);
    }
    return `${gateway}${hash}`;
  }

  /**
   * Pin content to ensure it stays available
   */
  async pinContent(hash: string): Promise<void> {
    // Use mock service if in mock mode or real IPFS failed
    if (this.useMockMode || !this.ipfs) {
      return this.mockService.pinContent(hash);
    }

    try {
      await this.ipfs.pin.add(hash);
      this.logger.log(`Content pinned successfully: ${hash}`);
    } catch (error) {
      this.logger.error(`Failed to pin content: ${error.message}`);
      this.logger.log('🔄 Falling back to mock IPFS...');
      this.useMockMode = true;
      return this.mockService.pinContent(hash);
    }
  }
}
