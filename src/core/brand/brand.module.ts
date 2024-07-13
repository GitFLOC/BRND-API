// Dependencies
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { BrandController } from './brand.controller';

// Services
import { BrandService } from './services';
import { UserService } from '../user/services';

// Models
import { Brand, User, UserBrandVotes, UserPointActions } from '../../models';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Brand, UserBrandVotes, UserPointActions]),
  ],
  controllers: [BrandController],
  providers: [BrandService, UserService],
})
export class BrandModule {}
