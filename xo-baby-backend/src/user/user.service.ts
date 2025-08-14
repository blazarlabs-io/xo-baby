import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { EncryptedDataDto, MockUserDataDto } from './dto/encrypted-data.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { EncryptionService } from '../encryption/encryption.service';
import { IpfsService } from '../ipfs/ipfs.service';
import { PinataService } from '../ipfs/pinata.service';

import { createLogger } from 'src/midnight/logger-utils';
import { TestnetRemoteConfig } from 'src/midnight/config';
import { generateNFTId, createChildId } from 'src/midnight/index';
import { generateRoleBasedNFT } from 'src/midnight/index';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly firebase: FirebaseService,
    private readonly encryptionService: EncryptionService,
    private readonly ipfsService: IpfsService,
    private readonly pinataService: PinataService,
  ) {}

  async createUser(dto: CreateUserDto) {
    try {
      // Create Firebase Auth user
      const userRecord = await this.firebase.getAuth().createUser({
        email: dto.email,
        password: dto.password,
      });

      const config = new TestnetRemoteConfig();
      const logger = await createLogger(config.logDir);

      // generateNFTId NFTID generator success

      // ------------------------------------------------------------------------------------------------------------------------
      const userNFTId = await generateNFTId(
        config,
        logger,
        process.env.CONTRACT_ADDRESS as string,
        process.env.PRIVATE_KEY as string,
        dto.firstName,
        dto.lastName,
        dto.email,
      );

      logger.info(`User NFT ID: ${userNFTId}`);

      // ------------------------------------------------------------------------------------------------------------------------
      // Prepare data for encryption and IPFS upload

      // ------------------------------------------------------------------------------------------------------------------------
      // Create ChildID

      // const childId = await createChildId(
      //   config,
      //   logger,
      //   process.env.CONTRACT_ADDRESS as string,
      //   process.env.PRIVATE_KEY as string,
      //   dto.firstName,
      //   dto.dateOfBirth || '2025-01-01',
      //   'male',
      // );

      // logger.info(`Child ID: ${childId}`);

      // ------------------------------------------------------------------------------------------------------------------------

      const dataToEncrypt = {
        userId: userRecord.uid,
        personalInfo: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          dateOfBirth: dto.dateOfBirth,
          phoneNumber: dto.phoneNumber,
          address: dto.address,
        },
        medicalInfo: {
          bloodType: dto.bloodType,
          allergies: dto.allergies,
          medications: dto.medications,
          emergencyContact: {
            name: dto.emergencyContactName,
            phone: dto.emergencyContactPhone,
          },
        },
        preferences: {
          language: dto.language,
          notifications: dto.notifications === 'true',
        },
        customNotes: dto.customNotes,
        metadata: {
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          dataVersion: '1.0.0',
          nftId: 'userNFTId',
        },
      };

      // Generate AES key for encryption
      const aesKey = this.encryptionService.generateAESKey();

      // Encrypt the data
      const encryptedData = this.encryptionService.encryptObject(
        dataToEncrypt,
        aesKey,
      );

      // Upload encrypted data to Pinata
      const ipfsHash = await this.pinataService.uploadString(encryptedData);

      // Generate Pinata gateway URL
      const ipfsGatewayUrl = this.pinataService.getGatewayUrl(ipfsHash);

      // Store basic user info in Firebase (without sensitive data)

      // await this.firebase
      //   .getFirestore()
      //   .collection('users')
      //   .doc(userRecord.uid)
      //   .set({
      //     firstName: dto.firstName,
      //     lastName: dto.lastName,
      //     email: dto.email,
      //     uid: userRecord.uid,
      //     nftId: userNFTId,
      //     ipfsHash: ipfsHash,
      //     ipfsGatewayUrl: ipfsGatewayUrl,
      //     createdAt: new Date().toISOString(),
      //   });

      // Calculate data sizes for response
      const originalDataSize = JSON.stringify(dataToEncrypt).length;
      const encryptedDataSize = encryptedData.length;

      this.logger.log('User creation completed successfully');

      return {
        uid: userRecord.uid,
        email: dto.email,
        nftId: 'userNFTId',
        encryption: {
          aesKey: aesKey,
          ipfsHash: ipfsHash,
          ipfsGatewayUrl: ipfsGatewayUrl,
          originalDataSize: originalDataSize,
          encryptedDataSize: encryptedDataSize,
        },
        message:
          'User created successfully with encrypted data uploaded to IPFS',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw new Error(`User creation failed: ${error.message}`);
    }
  }

  async loginUser(email: string, password: string) {
    try {
      const userCredential = await this.firebase
        .getAuth()
        .getUserByEmail(email);

      return { uid: userCredential.uid, email: userCredential.email };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async verifyIdToken(idToken: string) {
    try {
      const decodedToken = await this.firebase.getAuth().verifyIdToken(idToken);
      return { uid: decodedToken.uid };
    } catch (error) {
      throw new UnauthorizedException('Invalid ID token');
    }
  }

  private generateMockUserData(userId: string): MockUserDataDto {
    return {
      userId,
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        dateOfBirth: '1990-01-15',
        phoneNumber: '+1-555-123-4567',
      },
      medicalInfo: {
        bloodType: 'O+',
        allergies: ['Peanuts', 'Shellfish', 'Latex'],
        medications: ['Lisinopril 10mg', 'Metformin 500mg'],
        medicalHistory: [
          'Hypertension diagnosed 2020',
          'Type 2 Diabetes diagnosed 2019',
          'Appendectomy 2015',
        ],
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '+1-555-987-6543',
        },
      },
      preferences: {
        language: 'en',
        notifications: true,
        privacyLevel: 'private',
      },
      metadata: {
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        dataVersion: '1.0.0',
      },
    };
  }

  /**
   * Process user data: encrypt and upload to IPFS
   */
  async processUserDataToIPFS(userId: string): Promise<EncryptedDataDto> {
    try {
      this.logger.log(`Processing user data for user: ${userId}`);

      // Step 1: Generate mock data
      const mockData = this.generateMockUserData(userId);
      this.logger.log('Mock data generated successfully');

      // Step 2: Generate AES key
      const aesKey = this.encryptionService.generateAESKey();
      this.logger.log('AES key generated successfully');

      // Step 3: Encrypt the data
      const encryptedData = this.encryptionService.encryptObject(
        mockData,
        aesKey,
      );
      this.logger.log('Data encrypted successfully');

      // Step 4: Upload encrypted data to Pinata
      const ipfsHash = await this.pinataService.uploadString(encryptedData);
      this.logger.log(`Data uploaded to Pinata with hash: ${ipfsHash}`);

      // Step 5: Generate Pinata gateway URL
      const ipfsGatewayUrl = this.pinataService.getGatewayUrl(ipfsHash);

      // Step 6: Create response object
      const originalDataSize = JSON.stringify(mockData).length;
      const encryptedDataSize = encryptedData.length;

      const result: EncryptedDataDto = {
        aesKey,
        encryptedData,
        ipfsHash,
        ipfsGatewayUrl,
        originalDataSize,
        encryptedDataSize,
        timestamp: new Date().toISOString(),
      };

      this.logger.log('Data processing completed successfully');
      return result;
    } catch (error) {
      this.logger.error(`Failed to process user data: ${error.message}`);
      throw new Error(`Data processing failed: ${error.message}`);
    }
  }

  /**
   * Retrieve and decrypt data from Pinata
   */
  async retrieveAndDecryptFromIPFS(
    ipfsHash: string,
    aesKey: string,
  ): Promise<MockUserDataDto> {
    try {
      this.logger.log(`Retrieving data from Pinata with hash: ${ipfsHash}`);

      // Step 1: Retrieve encrypted data from Pinata
      const encryptedData = await this.pinataService.getData(ipfsHash);
      this.logger.log('Encrypted data retrieved from Pinata');

      // Step 2: Decrypt the data
      const decryptedData = this.encryptionService.decryptToObject(
        encryptedData,
        aesKey,
      );
      this.logger.log('Data decrypted successfully');

      return decryptedData as MockUserDataDto;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve and decrypt data: ${error.message}`,
      );
      throw new Error(`Data retrieval failed: ${error.message}`);
    }
  }

  /**
   * Demo method to show the complete flow
   */
  async demonstrateEncryptionAndIPFS(userId: string): Promise<{
    encrypted: EncryptedDataDto;
    decrypted: MockUserDataDto;
    success: boolean;
  }> {
    try {
      this.logger.log(
        `Starting encryption and IPFS demonstration for user: ${userId}`,
      );

      // Process data (encrypt and upload to IPFS)
      const encryptedResult = await this.processUserDataToIPFS(userId);

      // Wait a moment for IPFS propagation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Retrieve and decrypt data
      const decryptedResult = await this.retrieveAndDecryptFromIPFS(
        encryptedResult.ipfsHash,
        encryptedResult.aesKey,
      );

      this.logger.log('Demonstration completed successfully');

      return {
        encrypted: encryptedResult,
        decrypted: decryptedResult,
        success: true,
      };
    } catch (error) {
      this.logger.error(`Demonstration failed: ${error.message}`);
      throw new Error(`Demonstration failed: ${error.message}`);
    }
  }

  /**
   * Test Pinata connection
   */
  async testPinataConnection(): Promise<boolean> {
    return this.pinataService.testConnection();
  }
}
