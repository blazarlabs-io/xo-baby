import { Kid } from './kid.model';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { CreateKidDto } from './dto/create-kid.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { PinataService } from '../ipfs/pinata.service';
import { EncryptionService } from '../encryption/encryption.service';
// import { createChildId } from '../midnight/api';
import * as admin from 'firebase-admin';
import { createChildId } from '../midnight/index';
import { TestnetRemoteConfig } from 'src/midnight/config';
import { createLogger } from 'src/midnight/logger-utils';

@Injectable()
export class KidService {
  private readonly logger = new Logger(KidService.name);

  constructor(
    private readonly firebase: FirebaseService,
    private readonly pinataService: PinataService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async createKid(dto: CreateKidDto) {
    try {
      let childId: string;

      try {
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

        this.logger.log(`✅ ChildId created: ${childId}`);
      } catch (error) {
        this.logger.error(`❌ Failed to create childId: ${error.message}`);
        throw new Error(`Failed to create childId: ${error.message}`);
      }

      const aesKey = this.encryptionService.generateAESKey();

      const kidDataForEncryption = {
        ...dto,
        createdAt: new Date().toISOString(),
      };

      this.logger.log(`🔐 Encrypting kid data...`, kidDataForEncryption);
      const encryptedData = this.encryptionService.encryptObject(
        kidDataForEncryption,
        aesKey,
      );

      this.logger.log(`✅ Encrypted kid data...`, encryptedData);

      const ipfsHash = await this.pinataService.uploadJSON({ encryptedData });

      this.logger.log(`✅ Data uploaded to IPFS with hash: ${ipfsHash}`);

      const ipfsGatewayUrl = this.pinataService.getGatewayUrl(ipfsHash);
      // Create kid document in Firestore
      const docRef = this.firebase.getFirestore().collection('kids').doc();

      const kidData = {
        id: docRef.id,
        childId: childId,
        parentId: dto.parentId,
        adminId: dto.adminId,
        doctorId: dto.doctorId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        birthDate: dto.birthDate,
        gender: dto.gender,
        bloodType: dto.bloodType,
        ethnicity: dto.ethnicity,
        location: dto.location,
        congenitalAnomalies: dto.congenitalAnomalies || [],
        avatarUrl: dto.avatarUrl,
        createdAt: new Date().toISOString(),
        ipfsHash,
        encryptedData: encryptedData.substring(0, 100) + '...', // Store truncated version for reference
        vitals: {
          heartRate: 0,
          oximetry: 0,
          breathingRate: 0,
          temperature: 0,
          movement: 0,
          weight: 0,
          height: 0,
          feedingSchedule: '',
        },
        weightHistory: [],
        heightHistory: [],
      };

      await docRef.set(kidData);
      this.logger.log(`✅ Kid data saved to Firestore with ID: ${docRef.id}`);

      // Return success response
      const result = {
        id: docRef.id,
        childId,
        ipfsHash,
        message: 'Kid created successfully with blockchain ID and IPFS storage',
        kidData: {
          ...kidData,
          aesKey, // Include AES key in response for parent to store securely
        },
      };

      this.logger.log('🎉 Kid creation process completed successfully!');
      return result;
    } catch (error) {
      this.logger.error(`❌ Kid creation failed: ${error.message}`);
      throw new Error(`Failed to create kid: ${error.message}`);
    }
  }

  async getKidsByUserToken(token: string) {
    const decoded = await this.firebase.getAuth().verifyIdToken(token);
    const uid = decoded.uid;

    const snapshot = await this.firebase
      .getFirestore()
      .collection('kids')
      .where('parentId', '==', uid)
      .get();

    const kids = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return kids;
  }

  async findById(kidId: string): Promise<Kid | null> {
    const docRef = this.firebase.getFirestore().collection('kids').doc(kidId);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Kid;
  }

  /**
   * Retrieve and decrypt kid data from IPFS
   */
  async getDecryptedKidData(kidId: string, aesKey: string): Promise<any> {
    try {
      this.logger.log(`🔍 Retrieving decrypted data for kid: ${kidId}`);

      // Get kid document from Firestore
      const kid = await this.findById(kidId);
      if (!kid) {
        throw new Error('Kid not found');
      }

      // Type assertion to access the new fields
      const kidWithNewFields = kid as any;

      if (!kidWithNewFields.ipfsHash) {
        throw new Error('No IPFS hash found for this kid');
      }

      // Retrieve encrypted data from IPFS
      this.logger.log(
        `📥 Retrieving data from IPFS: ${kidWithNewFields.ipfsHash}`,
      );
      const encryptedData = await this.pinataService.getData(
        kidWithNewFields.ipfsHash,
      );

      // Parse the response to get the actual encrypted data
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

      // Decrypt the data
      this.logger.log('🔓 Decrypting kid data...');
      const decryptedData = this.encryptionService.decryptToObject(
        actualEncryptedData,
        aesKey,
      );

      this.logger.log('✅ Kid data decrypted successfully');
      return {
        ...kid,
        decryptedData,
        ipfsUrl: this.pinataService.getGatewayUrl(kidWithNewFields.ipfsHash),
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to retrieve decrypted kid data: ${error.message}`,
      );
      throw new Error(
        `Failed to retrieve decrypted kid data: ${error.message}`,
      );
    }
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
}
