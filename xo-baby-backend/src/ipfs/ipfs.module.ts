import { Module } from '@nestjs/common';
import { IpfsService } from './ipfs.service';
import { MockIpfsService } from './mock-ipfs.service';
import { PinataService } from './pinata.service';

@Module({
  providers: [IpfsService, MockIpfsService, PinataService],
  exports: [IpfsService, PinataService],
})
export class IpfsModule {}
