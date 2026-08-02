import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reaction, TargetType, ReactionType, Bookmark, Follow } from './entities';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../communication/entities';

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(Reaction)
    private reactionRepository: Repository<Reaction>,
    @InjectRepository(Bookmark)
    private bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  // --- Reactions / Likes ---
  async toggleLike(userId: string, targetType: TargetType, targetId: string) {
    const existing = await this.reactionRepository.findOne({
      where: { userId, targetType, targetId, type: ReactionType.LIKE },
    });

    if (existing) {
      await this.reactionRepository.remove(existing);
      if (targetType === TargetType.POST) {
        await this.postRepository.decrement({ id: targetId }, 'likesCount', 1);
      }
      return { liked: false };
    } else {
      const reaction = this.reactionRepository.create({
        userId,
        targetType,
        targetId,
        type: ReactionType.LIKE,
      });
      await this.reactionRepository.save(reaction);

      if (targetType === TargetType.POST) {
        await this.postRepository.increment({ id: targetId }, 'likesCount', 1);
        const post = await this.postRepository.findOne({ where: { id: targetId } });
        if (post) {
          await this.notificationsService.createNotification(
            post.authorId,
            userId,
            NotificationType.LIKE,
            targetId,
            'liked your post',
          );
        }
      }
      return { liked: true };
    }
  }

  // --- Bookmarks ---
  async toggleBookmark(userId: string, postId: string) {
    const existing = await this.bookmarkRepository.findOne({
      where: { userId, postId },
    });

    if (existing) {
      await this.bookmarkRepository.remove(existing);
      return { bookmarked: false };
    } else {
      const bookmark = this.bookmarkRepository.create({ userId, postId });
      await this.bookmarkRepository.save(bookmark);
      return { bookmarked: true };
    }
  }

  async getUserBookmarks(userId: string) {
    const bookmarks = await this.bookmarkRepository.find({
      where: { userId },
      relations: ['post', 'post.author', 'post.author.profile', 'post.category'],
    });
    return bookmarks.map((b) => b.post);
  }

  // --- Follow System ---
  async toggleFollow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new ConflictException('You cannot follow yourself');
    }

    const targetUser = await this.userRepository.findOne({ where: { id: followingId } });
    if (!targetUser) throw new NotFoundException('User to follow not found');

    const existing = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    if (existing) {
      await this.followRepository.remove(existing);
      return { following: false };
    } else {
      const follow = this.followRepository.create({ followerId, followingId });
      await this.followRepository.save(follow);

      await this.notificationsService.createNotification(
        followingId,
        followerId,
        NotificationType.FOLLOW,
        followerId,
        'started following you',
      );

      return { following: true };
    }
  }

  async getFollowers(userId: string) {
    const follows = await this.followRepository.find({
      where: { followingId: userId },
      relations: ['follower', 'follower.profile'],
    });
    return follows.map((f) => f.follower);
  }

  async getFollowing(userId: string) {
    const follows = await this.followRepository.find({
      where: { followerId: userId },
      relations: ['following', 'following.profile'],
    });
    return follows.map((f) => f.following);
  }
}
