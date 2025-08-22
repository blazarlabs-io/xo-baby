import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    console.log('🔐 Auth Guard - Headers received:', req.headers);
    console.log('🔐 Auth Guard - Authorization header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Auth Guard - Missing or invalid Authorization header');
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const idToken = authHeader.replace('Bearer ', '');
    console.log(
      '🔐 Auth Guard - ID Token extracted (first 20 chars):',
      idToken.substring(0, 20) + '...',
    );

    try {
      const decoded = await this.firebaseService.verifyIdToken(idToken);
      console.log(
        '✅ Auth Guard - Token verified successfully for user:',
        decoded.uid,
      );
      req.user = decoded; // decoded.uid, decoded.email etc.
      return true;
    } catch (error) {
      console.error('❌ Auth Guard - Token verification failed:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
