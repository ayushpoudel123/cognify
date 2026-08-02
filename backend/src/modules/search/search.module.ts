import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { User } from '../users/entities/user.entity';
import { Post, Category } from '../posts/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post, Category])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
