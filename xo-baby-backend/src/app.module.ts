import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase/firebase.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
  ],
  controllers: [UserController],
  providers: [FirebaseService, UserService],
})
export class AppModule {}
