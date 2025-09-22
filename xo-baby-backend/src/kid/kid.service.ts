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

@Injectable()
export class KidService {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly encryptionService: EncryptionService,
    private readonly pinataService: PinataService,
  ) { }

  async createKid(dto: CreateKidDto) {
    try {
      let childId: string;

      // Create child ID on blockchain 
      const config = new TestnetRemoteConfig();
      const logger = await createLogger(config.logDir);

      console.log("😀", dto.birthDate, dto.gender);
      childId = await createChildId(
        config,
        logger,
        process.env.CONTRACT_ADDRESS as string,
        process.env.PRIVATE_KEY as string,
        dto.firstName + ' ' + dto.lastName,
        dto.birthDate,
        dto.gender,
      );

      console.log('✅Child ID created:', childId);

      // Validate that childId was created successfully
      if (!childId) {
        throw new Error('Failed to generate child ID');
      }

      const aesKey = this.encryptionService.generateAESKey();
      console.log('🔑 AES Key generated:', aesKey);

      const kidDataForEncryption = {
        ...dto,
        createdAt: new Date().toISOString(),
      };

      console.log('🔑 kidDataForEncryption', kidDataForEncryption);

      const encryptedKidData = this.encryptionService.encryptObject
        (
          kidDataForEncryption,
          aesKey
        );

      console.log('🔑 encryptedKidData', encryptedKidData);

      // Wrap encrypted string in JSON object for Pinata upload
      const jsonDataForPinata = {
        encryptedData: encryptedKidData,
        dataType: 'kid-profile',
        timestamp: new Date().toISOString(),
        version: '1.0'
      };

      const ipfsHash = await this.pinataService.uploadJSON(jsonDataForPinata);

      console.log('📌 Pinata IPFS Hash generated:', ipfsHash);

      // Generate NFT (this might fail but we still want to save the kid)
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
        console.log('✅ NFT generated successfully');

        // Extract only the serializable data we need for Firestore
        nftTxHash = kidNFT?.txId || null;
        console.log('✅ NFT Transaction ID:', nftTxHash);
      } catch (nftError) {
        console.warn('⚠️ NFT generation failed, but continuing with kid creation:', nftError);
      }

      const docRef = this.firebase.getFirestore().collection('kids').doc();

      // Prepare kid data for Firestore
      const kidData = {
        id: docRef.id,
        childId: childId, // This should now be defined
        parentId: dto.parentId,
        adminId: dto.adminId || null,
        doctorId: dto.doctorId || null,
        createdAt: new Date().toISOString(),
        nftTxHash: nftTxHash, // Store only the transaction hash string
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

      // Validate required fields before saving
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
          avatarUrl: kidDataForEncryption.avatarUrl,
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

      console.log('🎉 Kid creation process completed successfully!', result);

      return result;
    } catch (error) {
      console.error('Error creating kid:', error);
      throw new Error('Failed to create kid');
    }
  }



  async getKidsByUserToken(token: string) {
    console.log('😂 here is the get kid part');
    console.log('🔍 Getting kids by user token:', token);
    const decoded = await this.firebase.getAuth().verifyIdToken(token);

    const uid = decoded.uid;

    const parentSnapshot = await this.firebase
      .getFirestore()
      .collection('kids')
      .where('parentId', '==', uid)
      .get();

    let kids = parentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), userRole: 'parent' }));

    const adminSnapshot = await this.firebase
      .getFirestore()
      .collection('kids')
      .where('adminId', '==', uid)
      .get();

    let adminKids = adminSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), userRole: 'admin' }));
    kids = [...kids, ...adminKids];

    const doctorSnapshot = await this.firebase
      .getFirestore()
      .collection('kids')
      .where('doctorId', '==', uid)
      .get();

    const doctorKids = doctorSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), userRole: 'doctor' }));
    kids = [...kids, ...doctorKids];

    const uniqueKids = kids.filter((kid, index, self) =>
      index === self.findIndex((t) => t.id === kid.id)
    );

    // If no kids found, return empty array
    if (uniqueKids.length === 0) {
      console.log('No kids found for user:', uid);
      return [];
    }

    console.log('🔍 Unique kids:', uniqueKids);

    const config = new TestnetRemoteConfig();
    const logger = await createLogger(config.logDir);

    // Process all kids and get their blockchain data
    const decryptedKidsData: any[] = [];
    
    console.log(`🔄 Processing ${uniqueKids.length} kids from midnight blockchain...`);
    
    for (let index = 0; index < uniqueKids.length; index++) {
      const kid = uniqueKids[index];
      const childId = (kid as any).childId || kid.id;

      console.log(`🔍 Processing kid ${index + 1}/${uniqueKids.length} - childId: ${childId}`);

      try {
        const decyptedDataInfo = await getDataFromChildNFT(
          config,
          logger,
          process.env.CONTRACT_ADDRESS as string,
          process.env.PRIVATE_KEY as string,
          childId,
        );

        let decryptedKidData = {};

        if (
          decyptedDataInfo &&
          Array.isArray(decyptedDataInfo) &&
          decyptedDataInfo.length > 0
        ) {
          decyptedDataInfo.forEach((value: any, valueIndex: number) => {
            if (value instanceof Uint8Array) {
              const stringValue = bytesToString(value);
              decryptedKidData[valueIndex] = stringValue;
            } else {
              decryptedKidData[valueIndex] = value;
            }
          });
        } else {
          console.log(`⚠️ No blockchain data found for kid ${childId}`);
          decryptedKidData = {
            '1': null, // ipfsHash
            '2': null, // aesKey
          };
        }

        const kidBlockchainData = {
          kidId: kid.id,
          ...decryptedKidData,
        };

        decryptedKidsData.push(kidBlockchainData);
        console.log(`✅ Successfully processed blockchain data for kid ${index + 1}`);
      } catch (error) {
        console.error(`❌ Error getting blockchain data for kid ${childId}:`, error);
        decryptedKidsData.push({
          kidId: kid.id,
          '1': null, // ipfsHash
          '2': null, // aesKey
          blockchainError: error.message,
        });
      }
    }

    console.log(`🎯 Collected ${decryptedKidsData.length} blockchain data entries, now processing IPFS data...`);

    // Now process all the collected blockchain data
    const completeKidsData = await Promise.all(
      decryptedKidsData.map(async (decryptedData: any, index: number): Promise<any> => {
        try {
          const ipfsHash = decryptedData['1']; // IPFS hash
          const aesKey = decryptedData['2']; // AES key
          const kid = uniqueKids[index]; // Corresponding kid from uniqueKids

          console.log(`🔄 Processing IPFS data for kid ${index + 1}: ipfsHash=${ipfsHash ? 'present' : 'missing'}, aesKey=${aesKey ? 'present' : 'missing'}`);

          if (!ipfsHash || !aesKey) {
            console.log(`⚠️ Missing IPFS data for kid ${kid.id}, returning default data`);
            return {
              id: kid.id,
              childId: (kid as any).childId,
              parentId: (kid as any).parentId,
              adminId: (kid as any).adminId,
              doctorId: (kid as any).doctorId,
              firstName: 'Unknown',
              lastName: 'Unknown',
              birthDate: '',
              gender: 'Unknown',
              bloodType: '',
              ethnicity: '',
              location: '',
              congenitalAnomalies: [],
              avatarUrl: '',
              createdAt: (kid as any).createdAt,
              vitals: (kid as any).vitals,
              weightHistory: (kid as any).weightHistory || [],
              heightHistory: (kid as any).heightHistory || [],
              headCircumferenceHistory:
                (kid as any).headCircumferenceHistory || [],
              userRole: kid.userRole,
              canEdit: kid.userRole === 'parent' || kid.userRole === 'admin',
              canDelete: kid.userRole === 'admin',
              canViewVitals: true,
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

          console.log(`🔍 Decrypted kid data for ${kid.id}:`, decryptedKidData);

          const result = {
            id: kid.id,
            childId: (kid as any).childId,
            parentId: (kid as any).parentId,
            adminId: (kid as any).adminId,
            doctorId: (kid as any).doctorId,
            firstName: decryptedKidData.firstName || 'Unknown',
            lastName: decryptedKidData.lastName || 'Unknown',
            birthDate: decryptedKidData.birthDate || '',
            gender: decryptedKidData.gender || 'Unknown',
            bloodType: decryptedKidData.bloodType || '',
            ethnicity: decryptedKidData.ethnicity || '',
            location: decryptedKidData.location || '',
            congenitalAnomalies: decryptedKidData.congenitalAnomalies || [],
            avatarUrl: decryptedKidData.avatarUrl || '',
            createdAt: (kid as any).createdAt,
            vitals: (kid as any).vitals || {},
            weightHistory: (kid as any).weightHistory || [],
            heightHistory: (kid as any).heightHistory || [],
            headCircumferenceHistory:
              (kid as any).headCircumferenceHistory || [],
            userRole: kid.userRole,
            canEdit: kid.userRole === 'parent' || kid.userRole === 'admin',
            canDelete: kid.userRole === 'admin',
            canViewVitals: true,
          };

          console.log(`✅ Successfully processed complete data for kid ${kid.id}:`, result);
          return result;
        } catch (error) {
          console.error(`❌ Error processing kid ${index + 1}:`, error);
          const kid = uniqueKids[index];
          // Return a valid kid object even on error instead of empty array
          return {
            id: kid.id,
            childId: (kid as any).childId,
            parentId: (kid as any).parentId,
            adminId: (kid as any).adminId,
            doctorId: (kid as any).doctorId,
            firstName: 'Error Loading',
            lastName: 'Error Loading',
            birthDate: '',
            gender: 'Unknown',
            bloodType: '',
            ethnicity: '',
            location: '',
            congenitalAnomalies: [],
            avatarUrl: '',
            createdAt: (kid as any).createdAt,
            vitals: (kid as any).vitals,
            weightHistory: (kid as any).weightHistory || [],
            heightHistory: (kid as any).heightHistory || [],
            headCircumferenceHistory:
              (kid as any).headCircumferenceHistory || [],
            userRole: kid.userRole,
            canEdit: kid.userRole === 'parent' || kid.userRole === 'admin',
            canDelete: kid.userRole === 'admin',
            canViewVitals: true,
            error: error.message,
          };
        }
      }),
    );

    // Type guard function to check if item is a valid kid object
    const isValidKidObject = (item: any): item is any => {
      return item &&
        typeof item === 'object' &&
        !Array.isArray(item) &&
        'id' in item &&
        item.id;
    };

    // Filter out any null/undefined/empty array results
    const filteredKidsData = completeKidsData.filter(isValidKidObject);

    console.log('🎉 Final kids data being returned to frontend:', {
      originalCount: completeKidsData.length,
      filteredCount: filteredKidsData.length,
      data: filteredKidsData
    });

    return filteredKidsData;
  }

  async findById(kidId: string): Promise<Kid | null> {
    const docRef = this.firebase.getFirestore().collection('kids').doc(kidId);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Kid;
  }

  async updateWeight(kidId: string, userId: string, weight: number, date: string) {
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

  async updateHeight(kidId: string, userId: string, height: number, date: string) {
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
