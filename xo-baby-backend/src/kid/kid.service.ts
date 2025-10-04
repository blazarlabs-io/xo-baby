import { Kid } from './kid.model';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateKidDto } from './dto/create-kid.dto';
import { FirebaseService } from '../firebase/firebase.service';
import * as admin from 'firebase-admin';
import { TestnetRemoteConfig } from 'src/midnight/config';
import { createLogger } from 'src/midnight/logger-utils';
import { createChildId, generateChildNFT } from 'src/midnight/index';
import { EncryptionService } from '../encryption/encryption.service';
import { PinataService } from '../ipfs/pinata.service';
import { getDataFromChildNFT } from '../midnight/index';
import { bytesToString } from 'src/midnight/api';

// Add cache interface
interface BlockchainDataCache {
  [childId: string]: {
    data: any;
    timestamp: number;
    expiryTime: number;
  };
}

// Add wallet connection pool interface
interface WalletConnection {
  config: any;
  logger: any;
  lastUsed: number;
  isInUse: boolean;
}

@Injectable()
export class KidService {
  // Add blockchain data cache (5 minute cache)
  private blockchainCache: BlockchainDataCache = {};
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY_BASE = 2000; // 2 seconds (increased from 1 second)
  
  // Add wallet connection pooling
  private walletConnection: WalletConnection | null = null;
  private readonly WALLET_CONNECTION_TIMEOUT = 10 * 60 * 1000; // 10 minutes
  private isProcessingBlockchain = false;

  constructor(
    private readonly firebase: FirebaseService,
    private readonly encryptionService: EncryptionService,
    private readonly pinataService: PinataService,
  ) {}

  // Sleep function for retry delays
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get or create wallet connection
  private async getWalletConnection(): Promise<WalletConnection> {
    const now = Date.now();
    
    // Check if we have a valid connection
    if (this.walletConnection && 
        !this.walletConnection.isInUse && 
        (now - this.walletConnection.lastUsed) < this.WALLET_CONNECTION_TIMEOUT) {
      this.walletConnection.lastUsed = now;
      this.walletConnection.isInUse = true;
      console.log('🔗 Reusing existing wallet connection');
      return this.walletConnection;
    }

    // Create new connection
    console.log('🆕 Creating new wallet connection');
    const config = new TestnetRemoteConfig();
    const logger = await createLogger(config.logDir);
    
    this.walletConnection = {
      config,
      logger,
      lastUsed: now,
      isInUse: true,
    };
    
    return this.walletConnection;
  }

  // Release wallet connection
  private releaseWalletConnection(): void {
    if (this.walletConnection) {
      this.walletConnection.isInUse = false;
      this.walletConnection.lastUsed = Date.now();
      console.log('🔓 Released wallet connection');
    }
  }

  // Process all blockchain data with sequential calls and shared wallet
  private async processAllBlockchainData(uniqueKids: any[]): Promise<any[]> {
    const decryptedKidsData: any[] = [];
    
    // Wait for any existing blockchain processing to complete
    while (this.isProcessingBlockchain) {
      console.log('⏳ Waiting for existing blockchain processing to complete...');
      await this.sleep(1000);
    }
    
    this.isProcessingBlockchain = true;
    let walletConnection: WalletConnection | null = null;
    
    try {
      walletConnection = await this.getWalletConnection();
      
      // Process kids sequentially with shared wallet connection
      for (let index = 0; index < uniqueKids.length; index++) {
        const kid = uniqueKids[index];
        const childId = (kid as any).childId || kid.id;

        try {
          const blockchainData = await this.getBlockchainDataWithSharedWallet(
            childId,
            walletConnection,
          );

          const processedData = this.processBlockchainData(blockchainData, kid.id);
          decryptedKidsData.push(processedData);
          
          // Add delay between requests to avoid overwhelming the network
          if (index < uniqueKids.length - 1) {
            await this.sleep(1000); // 1 second delay between requests
          }
        } catch (error) {
          console.error(
            `❌ Error getting blockchain data for kid ${childId}:`,
            error,
          );
          decryptedKidsData.push({
            kidId: kid.id,
            '1': null, // ipfsHash
            '2': null, // aesKey
            blockchainError: error.message,
          });
        }
      }
      
      return decryptedKidsData;
    } finally {
      if (walletConnection) {
        this.releaseWalletConnection();
      }
      this.isProcessingBlockchain = false;
    }
  }

  // Get cached blockchain data or fetch from blockchain with shared wallet
  private async getBlockchainDataWithSharedWallet(
    childId: string,
    walletConnection: WalletConnection,
  ): Promise<any> {
    const now = Date.now();
    
    // Check if we have valid cached data
    if (this.blockchainCache[childId] && now < this.blockchainCache[childId].expiryTime) {
      console.log(`📋 Using cached blockchain data for child: ${childId}`);
      return this.blockchainCache[childId].data;
    }

    // Fetch from blockchain with retry logic using shared wallet
    let lastError: any;
    for (let attempt = 1; attempt <= this.MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        console.log(`📋 Fetching blockchain data for child: ${childId} (attempt ${attempt})`);
        
        const blockchainData = await getDataFromChildNFT(
          walletConnection.config,
          walletConnection.logger,
          process.env.CONTRACT_ADDRESS as string,
          process.env.PRIVATE_KEY as string,
          childId,
        );

        // Cache the successful result
        this.blockchainCache[childId] = {
          data: blockchainData,
          timestamp: now,
          expiryTime: now + this.CACHE_DURATION,
        };

        return blockchainData;
      } catch (error) {
        lastError = error;
        const errorMessage = error.message || JSON.stringify(error);
        console.error(`❌ Attempt ${attempt} failed for child ${childId}:`, errorMessage);
        
        // Check for specific error types that shouldn't be retried
        if (this.isNonRetryableError(error)) {
          console.log(`🚫 Non-retryable error detected, stopping retries for child ${childId}`);
          break;
        }
        
        if (attempt < this.MAX_RETRY_ATTEMPTS) {
          const delay = this.RETRY_DELAY_BASE * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await this.sleep(delay);
        }
      }
    }

    // All retries failed, throw the last error
    throw lastError;
  }

  // Get cached blockchain data or fetch from blockchain (deprecated - use shared wallet version)
  private async getBlockchainDataWithCache(
    childId: string,
    config: any,
    logger: any,
  ): Promise<any> {
    const now = Date.now();
    
    // Check if we have valid cached data
    if (this.blockchainCache[childId] && now < this.blockchainCache[childId].expiryTime) {
      console.log(`📋 Using cached blockchain data for child: ${childId}`);
      return this.blockchainCache[childId].data;
    }

    // Fetch from blockchain with retry logic
    let lastError: any;
    for (let attempt = 1; attempt <= this.MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        console.log(`📋 Fetching blockchain data for child: ${childId} (attempt ${attempt})`);
        
        const blockchainData = await getDataFromChildNFT(
          config,
          logger,
          process.env.CONTRACT_ADDRESS as string,
          process.env.PRIVATE_KEY as string,
          childId,
        );

        // Cache the successful result
        this.blockchainCache[childId] = {
          data: blockchainData,
          timestamp: now,
          expiryTime: now + this.CACHE_DURATION,
        };

        return blockchainData;
      } catch (error) {
        lastError = error;
        const errorMessage = error.message || JSON.stringify(error);
        console.error(`❌ Attempt ${attempt} failed for child ${childId}:`, errorMessage);
        
        // Check for specific error types that shouldn't be retried
        if (this.isNonRetryableError(error)) {
          console.log(`🚫 Non-retryable error detected, stopping retries for child ${childId}`);
          break;
        }
        
        if (attempt < this.MAX_RETRY_ATTEMPTS) {
          const delay = this.RETRY_DELAY_BASE * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await this.sleep(delay);
        }
      }
    }

    // All retries failed, throw the last error
    throw lastError;
  }

  // Check if error is non-retryable (e.g., invalid child ID, permission errors)
  private isNonRetryableError(error: any): boolean {
    const errorStr = JSON.stringify(error).toLowerCase();
    const message = (error.message || '').toLowerCase();
    
    // Add patterns for non-retryable errors
    const nonRetryablePatterns = [
      'invalid child id',
      'child not found',
      'permission denied',
      'unauthorized',
      'invalid token',
      'invalid signature'
    ];
    
    return nonRetryablePatterns.some(pattern => 
      errorStr.includes(pattern) || message.includes(pattern)
    );
  }

  // Process blockchain data safely
  private processBlockchainData(blockchainData: any, childId: string): any {
    let decryptedKidData = {};

    if (
      blockchainData &&
      Array.isArray(blockchainData) &&
      blockchainData.length > 0
    ) {
      blockchainData.forEach((value: any, valueIndex: number) => {
        if (value instanceof Uint8Array) {
          const stringValue = bytesToString(value);
          decryptedKidData[valueIndex] = stringValue;
        } else {
          decryptedKidData[valueIndex] = value;
        }
      });
    } else {
      decryptedKidData = {
        '1': null, // ipfsHash
        '2': null, // aesKey
      };
    }

    return {
      kidId: childId,
      ...decryptedKidData,
    };
  }

  // Clear blockchain cache (useful for testing or when data changes)
  public clearBlockchainCache(): void {
    console.log('🗑️ Clearing blockchain cache');
    this.blockchainCache = {};
    this.clearWalletConnection();
  }

  // Clear wallet connection
  private clearWalletConnection(): void {
    if (this.walletConnection) {
      console.log('🗑️ Clearing wallet connection');
      this.walletConnection = null;
    }
  }

  // Clear expired cache entries
  private clearExpiredCache(): void {
    const now = Date.now();
    Object.keys(this.blockchainCache).forEach(childId => {
      if (now >= this.blockchainCache[childId].expiryTime) {
        delete this.blockchainCache[childId];
      }
    });
    
    // Also clear wallet connection if it's expired
    if (this.walletConnection && 
        !this.walletConnection.isInUse && 
        (now - this.walletConnection.lastUsed) >= this.WALLET_CONNECTION_TIMEOUT) {
      this.clearWalletConnection();
    }
  }

  async createKid(dto: CreateKidDto) {
    try {
      let childId: string;
      const config = new TestnetRemoteConfig();
      const logger = await createLogger(config.logDir);

      childId = await createChildId(
        config,
        logger,
        process.env.CONTRACT_ADDRESS as string,
        process.env.PRIVATE_KEY as string,
        dto.firstName + ' ' + dto.lastName,
        dto.birthDate,
        dto.gender,
      );

      // Validate that childId was created successfully
      if (!childId) {
        throw new Error('Failed to generate child ID');
      }

      const aesKey = this.encryptionService.generateAESKey();
      

      console.log('🔍 Avatar URL:', dto.avatarUrl);
      console.log('🔍 Avatar URL type:', typeof dto.avatarUrl);
      
      const kidDataForEncryption = {
        ...dto,
        createdAt: new Date().toISOString(),
      };
      const encryptedKidData = this.encryptionService.encryptObject(
        kidDataForEncryption,
        aesKey,
      );
      const jsonDataForPinata = {
        encryptedData: encryptedKidData,
        dataType: 'kid-profile',
        timestamp: new Date().toISOString(),
        version: '1.0',
      };
      const ipfsHash = await this.pinataService.uploadJSON(jsonDataForPinata);

      let nftTxHash = null;
      try {
        const kidNFT = await generateChildNFT(
          config,
          logger,
          process.env.CONTRACT_ADDRESS as string,
          process.env.PRIVATE_KEY as string,
          childId,
          ipfsHash,
          aesKey,
        );
        nftTxHash = kidNFT?.txId || null;
      } catch (nftError) {
        console.warn(
          '⚠️ NFT generation failed, but continuing with kid creation:',
          nftError,
        );
      }

      const docRef = this.firebase.getFirestore().collection('kids').doc();
      const kidData = {
        id: docRef.id,
        childId: childId, // This should now be defined
        parentId: dto.parentId,
        adminId: dto.adminId || null,
        doctorId: dto.doctorId || null,
        nftTxHash: nftTxHash, // Store only the transaction hash string
        avatarUrl: dto.avatarUrl || '',
        createdAt: new Date().toISOString(),
        vitals: {
          heartRate: 0,
          oximetry: 0,
          breathingRate: 0,
          temperature: 0,
          movement: 0,
          weight: 0,
          height: 0,
          headCircumference: 0,
          feedingSchedule: '',
        },
        weightHistory: [],
        heightHistory: [],
        headCircumferenceHistory: [],
      };

      console.log('💾 Saving kid to Firestore with avatarUrl:', kidData.avatarUrl);

      if (!kidData.childId) {
        throw new Error('childId is required but is undefined');
      }
      if (!kidData.parentId) {
        throw new Error('parentId is required but is undefined');
      }

      await docRef.set(kidData);

      const result = {
        id: docRef.id,
        childId: childId,
        ipfsHash: ipfsHash,
        nftTxHash: nftTxHash,
        message: 'Kid created successfully with blockchain ID and IPFS storage',
        kidData: {
          id: docRef.id,
          childId: childId,
          parentId: dto.parentId,
          adminId: dto.adminId || null,
          doctorId: dto.doctorId || null,
          firstName: kidDataForEncryption.firstName,
          lastName: kidDataForEncryption.lastName,
          birthDate: kidDataForEncryption.birthDate,
          gender: kidDataForEncryption.gender,
          bloodType: kidDataForEncryption.bloodType,
          ethnicity: kidDataForEncryption.ethnicity,
          location: kidDataForEncryption.location,
          congenitalAnomalies: kidDataForEncryption.congenitalAnomalies,
          // avatarUrl: kidDataForEncryption.avatarUrl,
          avatarUrl: dto.avatarUrl || '',
          createdAt: new Date().toISOString(),
          nftTxHash: nftTxHash,
          vitals: {
            heartRate: 0,
            oximetry: 0,
            breathingRate: 0,
            temperature: 0,
            movement: 0,
            weight: 0,
            height: 0,
            headCircumference: 0,
            feedingSchedule: '',
          },
          weightHistory: [],
          heightHistory: [],
          headCircumferenceHistory: [],
          aesKey: aesKey, // Include AES key in response for parent to store securely
        },
      };

      return result;
    } catch (error) {
      console.error('Error creating kid:', error);
      throw new Error('Failed to create kid');
    }
  }

  async getKidsByUserToken(token: string) {
    // Clear expired cache entries to prevent memory buildup
    this.clearExpiredCache();
    
    const decoded = await this.firebase.getAuth().verifyIdToken(token);
    const uid = decoded.uid;
    
    console.log(`🔍 Getting kids for user: ${uid}, email: ${decoded.email}`);
    
    // Get user profile to determine role
    const userDoc = await this.firebase.getFirestore().collection('users').doc(uid).get();
    let userRole = 'parent';
    
    if (userDoc.exists) {
      userRole = userDoc.data()?.role || 'parent';
    } else {
      // Create user record if it doesn't exist (for medical personnel)
      console.log(`⚠️ User ${uid} not found in users collection, creating with parent role`);
      await this.firebase.getFirestore().collection('users').doc(uid).set({
        uid: uid,
        email: decoded.email || '',
        role: 'parent',
        createdAt: new Date().toISOString(),
      });
    }

    console.log(`👤 User role: ${userRole}, exists: ${userDoc.exists}`);

    let kids: any[] = [];

    // Get kids based on user role
    if (userRole === 'parent') {
      console.log(`🔍 Searching for kids with parentId: ${uid}`);
      const parentSnapshot = await this.firebase
        .getFirestore()
        .collection('kids')
        .where('parentId', '==', uid)
        .get();

      kids = parentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        userRole: 'parent',
      }));
      console.log(`👶 Found ${kids.length} kids as parent`);
      console.log('🔍 First kid avatarUrl from Firestore:', kids[0]?.avatarUrl);
    } else if (userRole === 'medical') {
      console.log(`🔍 Searching for kids with doctorId: ${uid}`);
      const doctorSnapshot = await this.firebase
        .getFirestore()
        .collection('kids')
        .where('doctorId', '==', uid)
        .get();

      kids = doctorSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        userRole: 'medical',
      }));
      console.log(`👶 Found ${kids.length} kids as medical personnel`);
    } else if (userRole === 'admin') {
      console.log(`🔍 Getting all kids for admin`);
      const adminSnapshot = await this.firebase
        .getFirestore()
        .collection('kids')
        // .where('adminId', '==', uid)
        .get();

      kids = adminSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        userRole: 'admin',
      }));
      console.log(`👶 Found ${kids.length} kids as admin`);
    }

    const uniqueKids = kids.filter(
      (kid, index, self) => index === self.findIndex((t) => t.id === kid.id),
    );

    if (uniqueKids.length === 0) {
      return [];
    }

    console.log('------------------ unique kids ----------------')
    console.log(uniqueKids)
    console.log('------------------ unique kids ----------------')

    // Use shared wallet connection for all blockchain operations
    const decryptedKidsData = await this.processAllBlockchainData(uniqueKids);

    const completeKidsData = await Promise.all(
      decryptedKidsData.map(
        async (decryptedData: any, index: number): Promise<any> => {
          try {
            const ipfsHash = decryptedData['1']; // IPFS hash
            const aesKey = decryptedData['2']; // AES key
            const kid = uniqueKids[index]; // Corresponding kid from uniqueKids

            if (!ipfsHash || !aesKey) {
              return {
                id: kid.id,
                childId: (kid as any).childId,
                parentId: (kid as any).parentId,
                adminId: (kid as any).adminId,
                doctorId: (kid as any).doctorId,
                firstName: (kid as any).firstName || 'Unknown',
                lastName: (kid as any).lastName || 'Unknown',
                birthDate: (kid as any).birthDate || '',
                gender: (kid as any).gender || 'Unknown',
                bloodType: (kid as any).bloodType || '',
                ethnicity: (kid as any).ethnicity || '',
                location: (kid as any).location || '',
                congenitalAnomalies: (kid as any).congenitalAnomalies || [],
                avatarUrl: (kid as any).avatarUrl || '',
                createdAt: (kid as any).createdAt,
                // Role-based data access
                vitals: kid.userRole === 'admin' ? {} : ((kid as any).vitals || {}),
                weightHistory: kid.userRole === 'admin' ? [] : ((kid as any).weightHistory || []),
                heightHistory: kid.userRole === 'admin' ? [] : ((kid as any).heightHistory || []),
                headCircumferenceHistory: kid.userRole === 'admin' ? [] : ((kid as any).headCircumferenceHistory || []),
                userRole: kid.userRole,
                canEdit: kid.userRole === 'parent',
                canDelete: kid.userRole === 'admin',
                canViewVitals: kid.userRole !== 'admin',
                canViewMedicalData: kid.userRole === 'parent' || kid.userRole === 'medical',
                blockchainError: decryptedData.blockchainError || 'No blockchain data available',
              };
            }

            const encryptedData = await this.pinataService.getData(ipfsHash);
            let actualEncryptedData: string;
            if (typeof encryptedData === 'string') {
              try {
                const parsed = JSON.parse(encryptedData);
                actualEncryptedData = parsed.encryptedData || encryptedData;
              } catch {
                actualEncryptedData = encryptedData;
              }
            } else {
              actualEncryptedData =
                (encryptedData as any).encryptedData || encryptedData;
            }

            const decryptedKidData = this.encryptionService.decryptToObject(
              actualEncryptedData,
              aesKey,
            );

            const result = {
              id: kid.id,
              childId: (kid as any).childId,
              parentId: (kid as any).parentId,
              adminId: (kid as any).adminId,
              doctorId: (kid as any).doctorId,
              firstName: decryptedKidData.firstName || (kid as any).firstName || 'Unknown',
              lastName: decryptedKidData.lastName || (kid as any).lastName || 'Unknown',
              birthDate: decryptedKidData.birthDate || (kid as any).birthDate || '',
              gender: decryptedKidData.gender || (kid as any).gender || 'Unknown',
              bloodType: decryptedKidData.bloodType || (kid as any).bloodType || '',
              ethnicity: decryptedKidData.ethnicity || (kid as any).ethnicity || '',
              location: decryptedKidData.location || (kid as any).location || '',
              congenitalAnomalies: decryptedKidData.congenitalAnomalies || (kid as any).congenitalAnomalies || [],
              avatarUrl: decryptedKidData.avatarUrl || (kid as any).avatarUrl || '',
              createdAt: (kid as any).createdAt,
              // Role-based data access
              vitals: kid.userRole === 'admin' ? {} : ((kid as any).vitals || {}),
              weightHistory: kid.userRole === 'admin' ? [] : ((kid as any).weightHistory || []),
              heightHistory: kid.userRole === 'admin' ? [] : ((kid as any).heightHistory || []),
              headCircumferenceHistory: kid.userRole === 'admin' ? [] : ((kid as any).headCircumferenceHistory || []),
              userRole: kid.userRole,
              canEdit: kid.userRole === 'parent',
              canDelete: kid.userRole === 'admin',
              canViewVitals: kid.userRole !== 'admin',
              canViewMedicalData: kid.userRole === 'parent' || kid.userRole === 'medical',
            };

            console.log(`🖼️ Avatar URL for ${result.firstName}:`, {
              fromBlockchain: decryptedKidData.avatarUrl,
              fromFirestore: (kid as any).avatarUrl,
              final: result.avatarUrl
            });

            return result;
          } catch (error) {
            console.error(`❌ Error processing kid ${index + 1}:`, error);
            const kid = uniqueKids[index];
            return {
              id: kid.id,
              childId: (kid as any).childId,
              parentId: (kid as any).parentId,
              adminId: (kid as any).adminId,
              doctorId: (kid as any).doctorId,
              firstName: (kid as any).firstName || 'Error Loading',
              lastName: (kid as any).lastName || 'Error Loading',
              birthDate: (kid as any).birthDate || '',
              gender: (kid as any).gender || 'Unknown',
              bloodType: (kid as any).bloodType || '',
              ethnicity: (kid as any).ethnicity || '',
              location: (kid as any).location || '',
              congenitalAnomalies: (kid as any).congenitalAnomalies || [],
              avatarUrl: (kid as any).avatarUrl || '',
              createdAt: (kid as any).createdAt,
              // Role-based data access
              vitals: kid.userRole === 'admin' ? {} : ((kid as any).vitals || {}),
              weightHistory: kid.userRole === 'admin' ? [] : ((kid as any).weightHistory || []),
              heightHistory: kid.userRole === 'admin' ? [] : ((kid as any).heightHistory || []),
              headCircumferenceHistory: kid.userRole === 'admin' ? [] : ((kid as any).headCircumferenceHistory || []),
              userRole: kid.userRole,
              canEdit: kid.userRole === 'parent',
              canDelete: kid.userRole === 'admin',
              canViewVitals: kid.userRole !== 'admin',
              canViewMedicalData: kid.userRole === 'parent' || kid.userRole === 'medical',
              error: error.message,
            };
          }
        },
      ),
    );

    // Type guard function to check if item is a valid kid object
    const isValidKidObject = (item: any): item is any => {
      return (
        item &&
        typeof item === 'object' &&
        !Array.isArray(item) &&
        'id' in item &&
        item.id
      );
    };

    const filteredKidsData = completeKidsData.filter(isValidKidObject);
    return filteredKidsData;
  }

  async findById(kidId: string): Promise<Kid | null> {
    const docRef = this.firebase.getFirestore().collection('kids').doc(kidId);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Kid;
  }

  async updateWeight(
    kidId: string,
    userId: string,
    weight: number,
    date: string,
  ) {
    const docRef = this.firebase.getFirestore().collection('kids').doc(kidId);
    const doc = await docRef.get();

    if (!doc.exists) throw new UnauthorizedException('Kid not found');

    const kid = doc.data() as Kid;
    if (kid.parentId !== userId) {
      throw new UnauthorizedException('You are not the parent of this kid');
    }

    await docRef.update({
      'vitals.weight': weight,
      weightHistory: admin.firestore.FieldValue.arrayUnion({
        value: weight,
        date,
      }),
    });

    return { success: true, weight, date };
  }

  async updateHeight(
    kidId: string,
    userId: string,
    height: number,
    date: string,
  ) {
    const docRef = this.firebase.getFirestore().collection('kids').doc(kidId);
    const doc = await docRef.get();
    if (!doc.exists) throw new UnauthorizedException('Kid not found');
    const kid = doc.data() as Kid;
    if (kid.parentId !== userId) {
      throw new UnauthorizedException('You are not the parent of this kid');
    }

    await docRef.update({
      'vitals.height': height,
      heightHistory: admin.firestore.FieldValue.arrayUnion({
        value: height,
        date,
      }),
    });

    return { success: true, height, date };
  }

  async getWeightHistory(kidId: string, userId: string) {
    const docRef = this.firebase.getFirestore().collection('kids').doc(kidId);
    const doc = await docRef.get();

    if (!doc.exists) throw new UnauthorizedException('Kid not found');

    const kid = doc.data() as Kid;
    if (kid.parentId !== userId) {
      throw new UnauthorizedException('You are not the parent of this kid');
    }

    const history = kid.weightHistory || [];
    return { kidId: kidId, weightHistory: history };
  }

  async getHeightHistory(kidId: string, userId: string) {
    const docRef = this.firebase.getFirestore().collection('kids').doc(kidId);
    const doc = await docRef.get();

    if (!doc.exists) throw new UnauthorizedException('Kid not found');

    const kid = doc.data() as Kid;
    if (kid.parentId !== userId) {
      throw new UnauthorizedException('You are not the parent of this kid');
    }

    const history = kid.heightHistory || [];
    return { kidId: kidId, heightHistory: history };
  }

  async updateKidDoctorAssignment(kidId: string, doctorId: string | null) {
    console.log(`🔄 Updating kid ${kidId} doctor assignment to:`, doctorId);
    
    const docRef = this.firebase.getFirestore().collection('kids').doc(kidId);
    const doc = await docRef.get();

    if (!doc.exists) {
      console.log(`❌ Kid ${kidId} not found`);
      throw new UnauthorizedException('Kid not found');
    }

    console.log(`📝 Updating kid ${kidId} with doctorId:`, doctorId);
    
    // Update the doctorId field
    await docRef.update({
      doctorId: doctorId,
      updatedAt: new Date().toISOString(),
    });

    console.log(`✅ Kid ${kidId} doctor assignment updated successfully`);

    // Clear any cached data for this kid
    if (this.blockchainCache[kidId]) {
      delete this.blockchainCache[kidId];
    }

    return { success: true, message: 'Kid doctor assignment updated successfully' };
  }

  async deleteKid(kidId: string) {
    const docRef = this.firebase.getFirestore().collection('kids').doc(kidId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new UnauthorizedException('Kid not found');
    }

    // Delete the kid document from Firestore
    await docRef.delete();

    // Clear any cached data for this kid
    if (this.blockchainCache[kidId]) {
      delete this.blockchainCache[kidId];
    }

    return { success: true, message: 'Kid deleted successfully' };
  }
}
