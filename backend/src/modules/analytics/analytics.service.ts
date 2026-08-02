import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../posts/entities/post.entity';
import { Follow } from '../social/entities';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
  ) {}

  async getCreatorDashboard(userId: string) {
    const posts = await this.postRepository.find({
      where: { authorId: userId },
      relations: ['category'],
    });

    const totalViews = posts.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
    const totalLikes = posts.reduce((sum, p) => sum + (p.likesCount || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0);
    const followersCount = await this.followRepository.count({ where: { followingId: userId } });

    const topPosts = posts
      .sort((a, b) => (b.viewsCount + b.likesCount * 2) - (a.viewsCount + a.likesCount * 2))
      .slice(0, 5);

    return {
      totalPosts: posts.length,
      totalViews,
      totalLikes,
      totalComments,
      followersCount,
      topPosts,
    };
  }
}
