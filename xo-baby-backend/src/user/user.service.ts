import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { EncryptedDataDto, MockUserDataDto } from './dto/encrypted-data.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { EncryptionService } from '../encryption/encryption.service';
import * as admin from 'firebase-admin';
// import { IpfsService } from '../ipfs/ipfs.service';
// import { PinataService } from '../ipfs/pinata.service';

import { createLogger } from 'src/midnight/logger-utils';
import { TestnetRemoteConfig } from 'src/midnight/config';
import { generateNFTId } from 'src/midnight/index';
// import { generateRoleBasedNFT } from 'src/midnight/index';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly firebase: FirebaseService,
    private readonly encryptionService: EncryptionService,
    // private readonly ipfsService: IpfsService,
    // private readonly pinataService: PinataService,
  ) {}

  async createUser(dto: CreateUserDto) {
    try {
      this.logger.log(`Starting user creation for email: ${dto.email}`);

      let userRecord;
      let isNewUser = false;

      // Check if user already exists in Firebase Auth
      try {
        userRecord = await this.firebase.getAuth().getUserByEmail(dto.email);
        this.logger.log(
          `User already exists in Firebase Auth: ${userRecord.uid}`,
        );
      } catch (error) {
        // User doesn't exist, create new one
        this.logger.log(
          `Creating new Firebase Auth user for email: ${dto.email}`,
        );
        userRecord = await this.firebase.getAuth().createUser({
          email: dto.email,
          password: dto.password,
        });
        isNewUser = true;
        this.logger.log(`Firebase user created with UID: ${userRecord.uid}`);
      }

      // Check if user already exists in Firestore
      const existingFirestoreUser = await this.firebase
        .getFirestore()
        .collection('users')
        .doc(userRecord.uid)
        .get();

      if (existingFirestoreUser.exists) {
        this.logger.log(`User already exists in Firestore: ${userRecord.uid}`);
        return {
          uid: userRecord.uid,
          email: dto.email,
          message: 'User already exists and is ready to use',
          timestamp: new Date().toISOString(),
        };
      }

      // Generate NFT ID for new users
      let userNFTId: string;
      try {
        const config = new TestnetRemoteConfig();
        const logger = await createLogger(config.logDir);

        userNFTId = await generateNFTId(
          config,
          logger,
          process.env.CONTRACT_ADDRESS as string,
          process.env.PRIVATE_KEY as string,
          dto.firstName,
          dto.lastName,
          dto.email,
        );
        logger.info(`User NFT ID generated: ${userNFTId}`);
      } catch (nftError) {
        this.logger.warn(`NFT ID generation failed: ${nftError.message}`);
        userNFTId = `temp-${Date.now()}`; // Fallback NFT ID
      }

      this.logger.log(`User NFT ID: ${userNFTId}`);

      // ------------------------------------------------------------------------------------------------------------------------
      // Prepare data for encryption and IPFS upload

      // const dataToEncrypt = {
      //   userId: userRecord.uid,
      //   personalInfo: {
      //     firstName: dto.firstName,
      //     lastName: dto.lastName,
      //     email: dto.email,
      //     dateOfBirth: dto.dateOfBirth,
      //     phoneNumber: dto.phoneNumber,
      //     address: dto.address,
      //   },
      //   medicalInfo: {
      //     bloodType: dto.bloodType,
      //     allergies: dto.allergies,
      //     medications: dto.medications,
      //     emergencyContact: {
      //       name: dto.emergencyContactName,
      //       phone: dto.emergencyContactPhone,
      //     },
      //   },
      //   preferences: {
      //     language: dto.language,
      //     notifications: dto.notifications === 'true',
      //   },
      //   customNotes: dto.customNotes,
      //   metadata: {
      //     createdAt: new Date().toISOString(),
      //     lastUpdated: new Date().toISOString(),
      //     dataVersion: '1.0.0',
      //     nftId: 'userNFTId',
      //   },
      // };

      // const aesKey = this.encryptionService.generateAESKey();
      // const encryptedData = this.encryptionService.encryptObject(
      //   dataToEncrypt,
      //   aesKey,
      // );
      // const ipfsHash = await this.pinataService.uploadString(encryptedData);
      // const ipfsGatewayUrl = this.pinataService.getGatewayUrl(ipfsHash);

      await this.firebase
        .getFirestore()
        .collection('users')
        .doc(userRecord.uid)
        .set({
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          uid: userRecord.uid,
          nftId: userNFTId,
          createdAt: new Date().toISOString(),
          status: 'active',
        });

      this.logger.log('User creation completed successfully');

      return {
        uid: userRecord.uid,
        email: dto.email,
        nftId: userNFTId,
        message: isNewUser
          ? 'User created successfully'
          : 'User profile updated successfully',
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

  /**
   * Process user data: encrypt and upload to IPFS
   */
  // async processUserDataToIPFS(userId: string): Promise<EncryptedDataDto> {
  //   try {
  //     this.logger.log(`Processing user data for user: ${userId}`);

  //     // Step 1: Generate mock data
  //     const mockData = this.generateMockUserData(userId);
  //     this.logger.log('Mock data generated successfully');

  //     // Step 2: Generate AES key
  //     const aesKey = this.encryptionService.generateAESKey();
  //     this.logger.log('AES key generated successfully');

  //     // Step 3: Encrypt the data
  //     const encryptedData = this.encryptionService.encryptObject(
  //       mockData,
  //       aesKey,
  //     );
  //     this.logger.log('Data encrypted successfully');

  //     // Step 4: Upload encrypted data to Pinata
  //     const ipfsHash = await this.pinataService.uploadString(encryptedData);
  //     this.logger.log(`Data uploaded to Pinata with hash: ${ipfsHash}`);

  //     // Step 5: Generate Pinata gateway URL
  //     const ipfsGatewayUrl = this.pinataService.getGatewayUrl(ipfsHash);

  //     // Step 6: Create response object
  //     const originalDataSize = JSON.stringify(mockData).length;
  //     const encryptedDataSize = encryptedData.length;

  //     const result: EncryptedDataDto = {
  //       aesKey,
  //       encryptedData,
  //       ipfsHash,
  //       ipfsGatewayUrl,
  //       originalDataSize,
  //       encryptedDataSize,
  //       timestamp: new Date().toISOString(),
  //     };

  //     this.logger.log('Data processing completed successfully');
  //     return result;
  //   } catch (error) {
  //     this.logger.error(`Failed to process user data: ${error.message}`);
  //     throw new Error(`Data processing failed: ${error.message}`);
  //   }
  // }

  /**
   * Retrieve and decrypt data from Pinata
   */
  // async retrieveAndDecryptFromIPFS(
  //   ipfsHash: string,
  //   aesKey: string,
  // ): Promise<MockUserDataDto> {
  //   try {
  //     this.logger.log(`Retrieving data from Pinata with hash: ${ipfsHash}`);

  //     // Step 1: Retrieve encrypted data from Pinata
  //     const encryptedData = await this.pinataService.getData(ipfsHash);
  //     this.logger.log('Encrypted data retrieved from Pinata');

  //     // Step 2: Decrypt the data
  //     const decryptedData = this.encryptionService.decryptToObject(
  //       encryptedData,
  //       aesKey,
  //     );
  //     this.logger.log('Data decrypted successfully');

  //     return decryptedData as MockUserDataDto;
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to retrieve and decrypt data: ${error.message}`,
  //     );
  //     throw new Error(`Data retrieval failed: ${error.message}`);
  //   }
  // }

  /**
   * Demo method to show the complete flow
   */
  // async demonstrateEncryptionAndIPFS(userId: string): Promise<{
  //   encrypted: EncryptedDataDto;
  //   decrypted: MockUserDataDto;
  //   success: boolean;
  // }> {
  //   try {
  //     this.logger.log(
  //       `Starting encryption and IPFS demonstration for user: ${userId}`,
  //     );

  //     // Process data (encrypt and upload to IPFS)
  //     const encryptedResult = await this.processUserDataToIPFS(userId);

  //     // Wait a moment for IPFS propagation
  //     await new Promise((resolve) => setTimeout(resolve, 2000));

  //     // Retrieve and decrypt data
  //     const decryptedResult = await this.retrieveAndDecryptFromIPFS(
  //       encryptedResult.ipfsHash,
  //       encryptedResult.aesKey,
  //     );

  //     this.logger.log('Demonstration completed successfully');

  //     return {
  //       encrypted: encryptedResult,
  //       decrypted: decryptedResult,
  //       success: true,
  //     };
  //   } catch (error) {
  //     this.logger.error(`Demonstration failed: ${error.message}`);
  //     throw new Error(`Demonstration failed: ${error.message}`);
  //   }
  // }

  /**
   * Get user role from Firestore
   */
  async getUserRole(uid: string, idToken: string) {
    try {
      this.logger.log(`🔍 Getting user role for UID: ${uid}`);

      // Verify the token
      const decodedToken = await this.firebase.getAuth().verifyIdToken(idToken);
      this.logger.log(`✅ Token verified for UID: ${decodedToken.uid}`);

      // Check if the token belongs to the requested user
      if (decodedToken.uid !== uid) {
        this.logger.error(
          `❌ Token UID (${decodedToken.uid}) doesn't match requested UID (${uid})`,
        );
        throw new UnauthorizedException(
          'Token does not match the requested user',
        );
      }

      // Get user data from Firestore
      this.logger.log(`🔍 Fetching user data from Firestore for UID: ${uid}`);
      const userDoc = await this.firebase
        .getFirestore()
        .collection('users')
        .doc(uid)
        .get();

      if (!userDoc.exists) {
        this.logger.log(`❌ User not found in Firestore: ${uid}`);
        return { role: 'parent' }; // Default role
      }

      const userData = userDoc.data();
      this.logger.log(`📋 User data from Firestore:`, userData);

      const role = userData?.role || 'parent'; // Default to parent if no role is set
      this.logger.log(`✅ User role retrieved: ${role} for UID: ${uid}`);

      return { role };
    } catch (error) {
      this.logger.error(`❌ Failed to get user role: ${error.message}`);
      throw new Error(`Failed to get user role: ${error.message}`);
    }
  }

  /**
   * Update user role in Firestore
   */
  async updateUserRole(uid: string, role: string) {
    try {
      this.logger.log(`🔧 Updating user role for UID: ${uid} to role: ${role}`);

      // Update user data in Firestore
      await this.firebase.getFirestore().collection('users').doc(uid).set(
        {
          uid,
          role,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      this.logger.log(`✅ User role updated successfully: ${uid} -> ${role}`);
      return { success: true, uid, role };
    } catch (error) {
      this.logger.error(`❌ Failed to update user role: ${error.message}`);
      throw new Error(`Failed to update user role: ${error.message}`);
    }
  }
}
