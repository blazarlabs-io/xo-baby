import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    const idToken = authHeader.replace('Bearer ', '');
    const decoded = await this.firebaseService.verifyIdToken(idToken);
    req.user = decoded;            // decoded.uid, decoded.email etc.
    return true;
  }
}
