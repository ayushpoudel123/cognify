import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { Report } from '../communication/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post, Report])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
