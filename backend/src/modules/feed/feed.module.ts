import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { Post } from '../posts/entities/post.entity';
import { Follow } from '../social/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Follow])],
  controllers: [FeedController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
