import * as admin from 'firebase-admin';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';

@Injectable()
export class FirebaseService {
  private readonly firestore: FirebaseFirestore.Firestore;
  private readonly auth: admin.auth.Auth;
  private readonly logger = new Logger(FirebaseService.name);

  constructor() {
    if (!admin.apps.length) {
      try {
        // Validate required environment variables
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (!projectId) {
          throw new Error(
            'FIREBASE_PROJECT_ID environment variable is not set',
          );
        }
        if (!clientEmail) {
          throw new Error(
            'FIREBASE_CLIENT_EMAIL environment variable is not set',
          );
        }
        if (!privateKey) {
          throw new Error(
            'FIREBASE_PRIVATE_KEY environment variable is not set',
          );
        }

        // Remove quotes if present
        privateKey = privateKey.replace(/^["']|["']$/g, '');

        // Handle escaped newlines
        privateKey = privateKey.replace(/\\n/g, '\n');

        // Handle literal \n strings that might be in the env file
        privateKey = privateKey.replace(/\\n/g, '\n');

        // Clean up any extra whitespace
        privateKey = privateKey.trim();

        // Validate private key format
        if (
          !privateKey.includes('-----BEGIN PRIVATE KEY-----') ||
          !privateKey.includes('-----END PRIVATE KEY-----')
        ) {
          throw new Error('Invalid private key format');
        }

        this.logger.log('Initializing Firebase Admin SDK...');
        this.logger.log(`Project ID: ${projectId}`);
        this.logger.log(`Client Email: ${clientEmail}`);
        this.logger.log(`Private Key length: ${privateKey.length}`);

        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: projectId,
            clientEmail: clientEmail,
            privateKey: privateKey,
          }),
        });

        this.logger.log('Firebase Admin SDK initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize Firebase Admin SDK:', error);
        this.logger.error('Environment variables check:');
        this.logger.error(
          `FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID ? 'SET' : 'NOT SET'}`,
        );
        this.logger.error(
          `FIREBASE_CLIENT_EMAIL: ${process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'NOT SET'}`,
        );
        this.logger.error(
          `FIREBASE_PRIVATE_KEY: ${process.env.FIREBASE_PRIVATE_KEY ? 'SET' : 'NOT SET'}`,
        );
        throw error;
      }
    }

    this.firestore = admin.firestore();
    this.auth = admin.auth();
  }

  getFirestore() {
    return this.firestore;
  }

  getAuth() {
    return this.auth;
  }

  async verifyIdToken(idToken: string) {
    try {
      // Basic token validation
      if (!idToken || typeof idToken !== 'string') {
        throw new Error('Invalid token: token must be a non-empty string');
      }

      // Check if token has the expected JWT structure (3 parts separated by dots)
      const parts = idToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token: JWT must have 3 parts');
      }

      this.logger.log(
        `Attempting to verify token with length: ${idToken.length}`,
      );
      const decoded = await this.auth.verifyIdToken(idToken);
      this.logger.log(`Token verified successfully for user: ${decoded.uid}`);
      return decoded;
    } catch (err) {
      this.logger.error('Token verification failed:', err);
      this.logger.error('Error details:', {
        code: err.code,
        message: err.message,
        stack: err.stack,
      });
      throw new UnauthorizedException('Invalid Firebase ID token');
    }
  }
}
