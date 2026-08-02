import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Post } from '../posts/entities/post.entity';
import { Follow } from '../social/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Follow])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
