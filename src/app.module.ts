import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {AppController} from './app.controller';
import {PrismaModule} from './prisma/prisma.module';
import {AuthModule} from './auth/auth.module';
import {UserModule} from './user/user.module';
import {CollectionModule} from './collection/collection.module';
import {BidModule} from './bid/bid.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    CollectionModule,
    BidModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
