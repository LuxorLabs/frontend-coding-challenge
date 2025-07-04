import {Module} from '@nestjs/common';
import {BidController} from './bid.controller';
import {BidService} from './bid.service';
import {PrismaService} from '../prisma/prisma.service';

@Module({
  controllers: [BidController],
  providers: [BidService, PrismaService],
  exports: [BidService],
})
export class BidModule {}
