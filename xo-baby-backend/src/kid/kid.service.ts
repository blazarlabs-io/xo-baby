import { Kid } from './kid.model';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { CreateKidDto } from './dto/create-kid.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { PinataService } from '../ipfs/pinata.service';
import { EncryptionService } from '../encryption/encryption.service';
// import { createChildId } from '../midnight/api';
import * as admin from 'firebase-admin';
import {
  createChildId,
  generateChildNFT,
  getDataFromChildNFT,
} from '../midnight/index';
import { TestnetRemoteConfig } from 'src/midnight/config';
import { createLogger } from 'src/midnight/logger-utils';
import { bytesToString } from 'src/midnight/api';
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

      this.logger.log(`🔐 AES key generated: ${aesKey}`);

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
      // // Create kid document in Firestore
      const config = new TestnetRemoteConfig();
      const logger = await createLogger(config.logDir);

      const kidNFT = await generateChildNFT(
        config,
        logger,
        process.env.CONTRACT_ADDRESS as string,
        process.env.PRIVATE_KEY as string,
        childId,
        ipfsHash,
        aesKey,
      );
      this.logger.log(`✅ Kid NFT created: ${kidNFT}`);

      // Create kid document in Firestore
      const docRef = this.firebase.getFirestore().collection('kids').doc();

      const kidData = {
        id: docRef.id,
        childId: childId,
        parentId: dto.parentId,
        adminId: dto.adminId || null,
        doctorId: dto.doctorId || null,
        createdAt: new Date().toISOString(),
        nftTxHash: kidNFT?.txId || null, // Store the NFT transaction hash
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

      await docRef.set(kidData);
      this.logger.log(`✅ Kid data saved to Firestore with ID: ${docRef.id}`);

      // Return success response
      const result = {
        id: docRef.id,
        childId,
        ipfsHash,
        nftTxHash: kidNFT?.txId || null,
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

  // async getKidsByUserToken(token: string) {
  //   try {
  //     const decoded = await this.firebase.getAuth().verifyIdToken(token);
  //     const uid = decoded.uid;

  //     this.logger.log(`🔍 Searching for kids for user: ${uid}`);

  //     // Search for kids where user is parent, admin, or doctor
  //     const snapshot = await this.firebase
  //       .getFirestore()
  //       .collection('kids')
  //       .where('parentId', '==', uid)
  //       .get();

  //     let kids = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  //     // Also search for kids where user is admin
  //     const adminSnapshot = await this.firebase
  //       .getFirestore()
  //       .collection('kids')
  //       .where('adminId', '==', uid)
  //       .get();

  //     const adminKids = adminSnapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));
  //     kids = [...kids, ...adminKids];

  //     // Also search for kids where user is doctor
  //     const doctorSnapshot = await this.firebase
  //       .getFirestore()
  //       .collection('kids')
  //       .where('doctorId', '==', uid)
  //       .get();

  //     const doctorKids = doctorSnapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));
  //     kids = [...kids, ...doctorKids];

  //     // Remove duplicates based on kid ID
  //     const uniqueKids = kids.filter(
  //       (kid, index, self) => index === self.findIndex((k) => k.id === kid.id),
  //     );

  //     this.logger.log(`✅ Found ${uniqueKids.length} kids for user ${uid}`);
  //     return uniqueKids;
  //   } catch (error) {
  //     this.logger.error(`❌ Failed to get kids by token: ${error.message}`);
  //     throw new Error(`Failed to get kids: ${error.message}`);
  //   }
  // }

  // async getKidsByUserId(userId: string) {
  //   try {
  //     this.logger.log(`🔍 Searching for kids for user ID: ${userId}`);

  //     // Search for kids where user is parent, admin, or doctor
  //     const parentSnapshot = await this.firebase
  //       .getFirestore()
  //       .collection('kids')
  //       .where('parentId', '==', userId)
  //       .get();

  //     let kids = parentSnapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));

  //     // Also search for kids where user is admin
  //     const adminSnapshot = await this.firebase
  //       .getFirestore()
  //       .collection('kids')
  //       .where('adminId', '==', userId)
  //       .get();

  //     const adminKids = adminSnapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));
  //     kids = [...kids, ...adminKids];

  //     // Also search for kids where user is doctor
  //     const doctorSnapshot = await this.firebase
  //       .getFirestore()
  //       .collection('kids')
  //       .where('doctorId', '==', userId)
  //       .get();

  //     const doctorKids = doctorSnapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));
  //     kids = [...kids, ...doctorKids];

  //     // Remove duplicates based on kid ID
  //     const uniqueKids = kids.filter(
  //       (kid, index, self) => index === self.findIndex((k) => k.id === kid.id),
  //     );

  //     this.logger.log(
  //       `✅ Found ${uniqueKids.length} kids for user ID ${userId}`,
  //     );
  //     return uniqueKids;
  //   } catch (error) {
  //     this.logger.error(`❌ Failed to get kids by user ID: ${error.message}`);
  //     throw new Error(`Failed to get kids: ${error.message}`);
  //   }
  // }

  // async getKidsWithRoleInfo(token: string) {
  //   try {
  //     const decoded = await this.firebase.getAuth().verifyIdToken(token);
  //     const uid = decoded.uid;

  //     this.logger.log(`🔍 Getting kids with role info for user: ${uid}`);

  //     // Get all kids the user has access to
  //     const kids = await this.getKidsByUserId(uid);

  //     // Enhance each kid with role information
  //     const kidsWithRoles = kids.map((kid: any) => {
  //       let userRole = 'viewer';
  //       if (kid.parentId === uid) {
  //         userRole = 'parent';
  //       } else if (kid.adminId === uid) {
  //         userRole = 'admin';
  //       } else if (kid.doctorId === uid) {
  //         userRole = 'doctor';
  //       }

  //       return {
  //         ...kid,
  //         userRole,
  //         canEdit: userRole === 'parent' || userRole === 'admin',
  //         canDelete: userRole === 'admin',
  //         canViewVitals:
  //           userRole === 'parent' ||
  //           userRole === 'admin' ||
  //           userRole === 'doctor',
  //       };
  //     });

  //     this.logger.log(
  //       `✅ Enhanced ${kidsWithRoles.length} kids with role information`,
  //     );
  //     return kidsWithRoles;
  //   } catch (error) {
  //     this.logger.error(
  //       `❌ Failed to get kids with role info: ${error.message}`,
  //     );
  //     throw new Error(`Failed to get kids with role info: ${error.message}`);
  //   }
  // }

  async getKidsBasicInfo(uid: string) {
    this.logger.log('🔍🔍🔍🔍🔍 Getting kids basic info for user:', uid);

    try {
      // Let the operation complete naturally without artificial timeouts
      return await this.performKidsDataRetrieval(uid);
    } catch (error) {
      this.logger.error(`❌ Failed to get basic kids info: ${error.message}`);
      throw new Error(`Failed to get basic kids info: ${error.message}`);
    }
  }

  private async performKidsDataRetrieval(uid: string) {
    try {
      this.logger.log(
        '📋 Step 1: Fetching kids from Firestore for parentId:',
        uid,
      );
      const parentSnapshot = await this.firebase
        .getFirestore()
        .collection('kids')
        .where('parentId', '==', uid)
        .get();

      let kids = parentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        userRole: 'parent',
      }));

      this.logger.log(
        '📋 Step 2: Fetching kids from Firestore for adminId:',
        uid,
      );
      const adminSnapshot = await this.firebase
        .getFirestore()
        .collection('kids')
        .where('adminId', '==', uid)
        .get();

      const adminKids = adminSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        userRole: 'admin',
      }));
      kids = [...kids, ...adminKids];

      this.logger.log(
        '📋 Step 3: Fetching kids from Firestore for doctorId:',
        uid,
      );
      const doctorSnapshot = await this.firebase
        .getFirestore()
        .collection('kids')
        .where('doctorId', '==', uid)
        .get();

      const doctorKids = doctorSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        userRole: 'doctor',
      }));
      kids = [...kids, ...doctorKids];

      this.logger.log('🔍 Step 4: Found', kids);

      const uniqueKids = kids.filter(
        (kid, index, self) => index === self.findIndex((k) => k.id === kid.id),
      );

      this.logger.log(
        '🔍 Step 4: Found',
        uniqueKids.length,
        'unique kids:',
        uniqueKids.map((k) => k.id),
      );

      this.logger.log('⛓️ Step 5: Initializing blockchain configuration...');
      const config = new TestnetRemoteConfig();
      const logger = await createLogger(config.logDir);

      this.logger.log(
        '⛓️ Step 6: Starting sequential blockchain data retrieval for',
        uniqueKids.length,
        'kids...',
      );

      // Process kids sequentially instead of simultaneously
      const decryptedKidsData: any[] = [];
      for (let index = 0; index < uniqueKids.length; index++) {
        const kid = uniqueKids[index];

        // Use the correct property - check if it's childId or id
        const childId = (kid as any).childId || kid.id;

        try {
          this.logger.log(
            `⛓️ Processing kid ${index + 1}/${uniqueKids.length}: ${childId}`,
          );

          const decyptedDataInfo = await getDataFromChildNFT(
            config,
            logger,
            process.env.CONTRACT_ADDRESS as string,
            process.env.PRIVATE_KEY as string,
            childId,
          );

          let decryptedKidData = {};

          // Check if decyptedDataInfo is valid before processing
          if (
            decyptedDataInfo &&
            Array.isArray(decyptedDataInfo) &&
            decyptedDataInfo.length > 0
          ) {
            this.logger.log(
              `✅ Successfully retrieved blockchain data for kid ${childId}, processing ${decyptedDataInfo.length} values`,
            );

            decyptedDataInfo.forEach((value: any, valueIndex: number) => {
              if (value instanceof Uint8Array) {
                const stringValue = bytesToString(value);
                decryptedKidData[valueIndex] = stringValue;
                this.logger.log(`  String [${valueIndex}]: "${stringValue}"`);
              } else {
                this.logger.log(`Value [${valueIndex}]: ${value}`);
                decryptedKidData[valueIndex] = value;
              }
            });
          } else {
            this.logger.warn(
              `⚠️ Invalid or empty blockchain data for kid ${childId}:`,
              decyptedDataInfo,
            );
            // Set default fallback values
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
          this.logger.log(
            `✅ Completed blockchain processing for kid ${index + 1}/${uniqueKids.length}: ${kid.id}`,
          );
        } catch (error) {
          this.logger.warn(
            `Failed to get blockchain data for kid ${kid.id}:`,
            error.message,
          );
          // Add fallback data if blockchain operations fail
          decryptedKidsData.push({
            kidId: kid.id,
            '1': null, // ipfsHash
            '2': null, // aesKey
            blockchainError: error.message,
          });
        }
      }

      this.logger.log(
        '🔗 Step 7: Starting IPFS data retrieval and decryption...',
        decryptedKidsData,
      );

      const completeKidsData = await Promise.all(
        decryptedKidsData.map(async (decryptedData: any, index: number) => {
          try {
            this.logger.log(
              `🔗 Processing IPFS for kid ${index + 1}/${decryptedKidsData.length}`,
            );
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

            this.logger.log('🔍 Decrypted kid data:', decryptedKidData);

            return {
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
              ipfsHash: ipfsHash,
              encryptedData: aesKey, // Store AES key as encryptedData for frontend
              vitals: (kid as any).vitals,
              weightHistory: (kid as any).weightHistory || [],
              heightHistory: (kid as any).heightHistory || [],
              headCircumferenceHistory:
                (kid as any).headCircumferenceHistory || [],
              userRole: kid.userRole,
              // canEdit: kid.userRole === 'parent' || kid.userRole === 'admin',
              // canDelete: kid.userRole === 'admin',
              // canViewVitals: true,
            };
          } catch (error) {
            console.error(`Error processing kid ${index}:`, error);
            const kid = uniqueKids[index];
            return {
              id: kid.id,
              childId: (kid as any).childId,
              parentId: (kid as any).parentId,
              adminId: (kid as any).adminId,
              doctorId: (kid as any).doctorId,
              firstName: 'Error',
              lastName: 'Loading...',
              birthDate: '',
              gender: 'Unknown',
              bloodType: '',
              ethnicity: '',
              location: '',
              congenitalAnomalies: [],
              avatarUrl: '',
              createdAt: (kid as any).createdAt,
              ipfsHash: '',
              encryptedData: '',
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
        }),
      );

      this.logger.log(
        '✅ Step 8: Successfully processed all kids data. Returning',
        completeKidsData.length,
        'kids',
      );
      return completeKidsData;
    } catch (error) {
      this.logger.error(
        `❌ Failed in performKidsDataRetrieval: ${error.message}`,
      );
      throw error;
    }
  }

  async findById(kidId: string): Promise<Kid | null> {
    const docRef = this.firebase.getFirestore().collection('kids').doc(kidId);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Kid;
  }

  async checkUserAccessToKid(
    userId: string,
    kidId: string,
  ): Promise<{
    hasAccess: boolean;
    role: string;
    permissions: {
      canEdit: boolean;
      canDelete: boolean;
      canViewVitals: boolean;
    };
  }> {
    try {
      const kid = await this.findById(kidId);
      if (!kid) {
        return {
          hasAccess: false,
          role: 'none',
          permissions: {
            canEdit: false,
            canDelete: false,
            canViewVitals: false,
          },
        };
      }

      let role = 'viewer';
      if (kid.parentId === userId) {
        role = 'parent';
      } else if (kid.adminId === userId) {
        role = 'admin';
      } else if (kid.doctorId === userId) {
        role = 'doctor';
      } else {
        return {
          hasAccess: false,
          role: 'none',
          permissions: {
            canEdit: false,
            canDelete: false,
            canViewVitals: false,
          },
        };
      }

      return {
        hasAccess: true,
        role,
        permissions: {
          canEdit: role === 'parent' || role === 'admin',
          canDelete: role === 'admin',
          canViewVitals:
            role === 'parent' || role === 'admin' || role === 'doctor',
        },
      };
    } catch (error) {
      this.logger.error(`❌ Failed to check user access: ${error.message}`);
      return {
        hasAccess: false,
        role: 'none',
        permissions: { canEdit: false, canDelete: false, canViewVitals: false },
      };
    }
  }

  async findByChildId(childId: string): Promise<Kid | null> {
    const snapshot = await this.firebase
      .getFirestore()
      .collection('kids')
      .where('childId', '==', childId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Kid;
  }

  async getDecryptedKidData(kidId: string, aesKey: string): Promise<any> {
    try {
      const kid = await this.findById(kidId);
      if (!kid) {
        throw new Error('Kid not found');
      }

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
    // Check user access first
    const access = await this.checkUserAccessToKid(userId, kidId);
    if (!access.hasAccess || !access.permissions.canEdit) {
      throw new UnauthorizedException(
        'You do not have permission to update this kid',
      );
    }

    const docRef = this.firebase.getFirestore().collection('kids').doc(kidId);
    const doc = await docRef.get();

    if (!doc.exists) throw new UnauthorizedException('Kid not found');

    await docRef.update({
      'vitals.weight': weight,
      weightHistory: admin.firestore.FieldValue.arrayUnion({
        value: weight,
        date,
      }),
    });

    return { success: true, weight, date, role: access.role };
  }

  async updateHeight(
    kidId: string,
    userId: string,
    height: number,
    date: string,
  ) {
    // Check user access first
    const access = await this.checkUserAccessToKid(userId, kidId);
    if (!access.hasAccess || !access.permissions.canEdit) {
      throw new UnauthorizedException(
        'You do not have permission to update this kid',
      );
    }

    const docRef = this.firebase.getFirestore().collection('kids').doc(kidId);
    const doc = await docRef.get();

    if (!doc.exists) throw new UnauthorizedException('Kid not found');

    await docRef.update({
      'vitals.height': height,
      heightHistory: admin.firestore.FieldValue.arrayUnion({
        value: height,
        date,
      }),
    });

    return { success: true, height, date, role: access.role };
  }

  async updateHeadCircumference(
    kidId: string,
    userId: string,
    headCircumference: number,
    date: string,
  ) {
    // Check user access first
    const access = await this.checkUserAccessToKid(userId, kidId);
    if (!access.hasAccess || !access.permissions.canEdit) {
      throw new UnauthorizedException(
        'You do not have permission to update this kid',
      );
    }

    const docRef = this.firebase.getFirestore().collection('kids').doc(kidId);
    const doc = await docRef.get();

    if (!doc.exists) throw new UnauthorizedException('Kid not found');

    await docRef.update({
      'vitals.headCircumference': headCircumference,
      headCircumferenceHistory: admin.firestore.FieldValue.arrayUnion({
        value: headCircumference,
        date,
      }),
    });

    return { success: true, headCircumference, date, role: access.role };
  }

  async getWeightHistory(kidId: string, userId: string) {
    // Check user access first
    const access = await this.checkUserAccessToKid(userId, kidId);
    if (!access.hasAccess || !access.permissions.canViewVitals) {
      throw new UnauthorizedException(
        "You do not have permission to view this kid's vitals",
      );
    }

    const docRef = this.firebase.getFirestore().collection('kids').doc(kidId);
    const doc = await docRef.get();

    if (!doc.exists) throw new UnauthorizedException('Kid not found');

    const kid = doc.data() as Kid;
    const history = kid.weightHistory || [];
    return { kidId: kidId, weightHistory: history, role: access.role };
  }

  async getHeightHistory(kidId: string, userId: string) {
    // Check user access first
    const access = await this.checkUserAccessToKid(userId, kidId);
    if (!access.hasAccess || !access.permissions.canViewVitals) {
      throw new UnauthorizedException(
        "You do not have permission to view this kid's vitals",
      );
    }

    const docRef = this.firebase.getFirestore().collection('kids').doc(kidId);
    const doc = await docRef.get();

    if (!doc.exists) throw new UnauthorizedException('Kid not found');

    const kid = doc.data() as Kid;
    const history = kid.heightHistory || [];
    return { kidId: kidId, heightHistory: history, role: access.role };
  }

  async getHeadCircumferenceHistory(kidId: string, userId: string) {
    // Check user access first
    const access = await this.checkUserAccessToKid(userId, kidId);
    if (!access.hasAccess || !access.permissions.canViewVitals) {
      throw new UnauthorizedException(
        "You do not have permission to view this kid's vitals",
      );
    }

    const docRef = this.firebase.getFirestore().collection('kids').doc(kidId);
    const doc = await docRef.get();

    if (!doc.exists) throw new UnauthorizedException('Kid not found');

    const kid = doc.data() as Kid;
    const history = kid.headCircumferenceHistory || [];
    return {
      kidId: kidId,
      headCircumferenceHistory: history,
      role: access.role,
    };
  }
}
