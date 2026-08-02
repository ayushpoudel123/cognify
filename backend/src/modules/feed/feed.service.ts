import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { Post, PostStatus } from '../posts/entities/post.entity';
import { Follow } from '../social/entities';
import { CursorPaginationDto, PaginatedResult } from '../../common/pagination/cursor-pagination.dto';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
  ) {}

  async getLatestFeed(query: CursorPaginationDto): Promise<PaginatedResult<Post>> {
    const limit = query.limit || 10;
    const where: any = { status: PostStatus.PUBLISHED };

    if (query.cursor) {
      where.createdAt = LessThan(new Date(query.cursor));
    }

    const posts = await this.postRepository.find({
      where,
      relations: ['author', 'author.profile', 'category', 'media'],
      order: { createdAt: 'DESC' },
      take: limit + 1,
    });

    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore && items.length > 0
      ? items[items.length - 1].createdAt.toISOString()
      : undefined;

    return { items, hasMore, nextCursor };
  }

  async getTrendingFeed(query: CursorPaginationDto): Promise<PaginatedResult<Post>> {
    const limit = query.limit || 10;
    const posts = await this.postRepository.find({
      where: { status: PostStatus.PUBLISHED },
      relations: ['author', 'author.profile', 'category', 'media'],
      order: { likesCount: 'DESC', viewsCount: 'DESC', createdAt: 'DESC' },
      take: limit,
    });

    return { items: posts, hasMore: false };
  }

  async getFollowingFeed(userId: string, query: CursorPaginationDto): Promise<PaginatedResult<Post>> {
    const limit = query.limit || 10;
    const follows = await this.followRepository.find({ where: { followerId: userId } });
    const followingIds = follows.map((f) => f.followingId);

    if (followingIds.length === 0) {
      return { items: [], hasMore: false };
    }

    const where: any = { status: PostStatus.PUBLISHED, authorId: In(followingIds) };
    if (query.cursor) {
      where.createdAt = LessThan(new Date(query.cursor));
    }

    const posts = await this.postRepository.find({
      where,
      relations: ['author', 'author.profile', 'category', 'media'],
      order: { createdAt: 'DESC' },
      take: limit + 1,
    });

    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore && items.length > 0
      ? items[items.length - 1].createdAt.toISOString()
      : undefined;

    return { items, hasMore, nextCursor };
  }
}
