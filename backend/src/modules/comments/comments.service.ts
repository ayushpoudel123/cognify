import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../communication/entities';

export class CreateCommentDto {
  @ApiProperty({ example: 'Great explanation on backpropagation!' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 'post-uuid-123' })
  @IsString()
  @IsNotEmpty()
  postId: string;

  @ApiPropertyOptional({ example: 'comment-uuid-456' })
  @IsOptional()
  @IsString()
  parentId?: string;
}

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private notificationsService: NotificationsService,
  ) {}

  async create(authorId: string, dto: CreateCommentDto) {
    const post = await this.postRepository.findOne({ where: { id: dto.postId } });
    if (!post) throw new NotFoundException('Post not found');

    const comment = this.commentRepository.create({
      content: dto.content,
      postId: dto.postId,
      authorId,
      parentId: dto.parentId || null,
    });

    const saved = await this.commentRepository.save(comment);

    post.commentsCount += 1;
    await this.postRepository.save(post);

    if (dto.parentId) {
      const parentComment = await this.commentRepository.findOne({ where: { id: dto.parentId } });
      if (parentComment) {
        await this.notificationsService.createNotification(
          parentComment.authorId,
          authorId,
          NotificationType.REPLY,
          post.id,
          'replied to your comment',
        );
      }
    } else {
      await this.notificationsService.createNotification(
        post.authorId,
        authorId,
        NotificationType.COMMENT,
        post.id,
        'commented on your post',
      );
    }

    return this.commentRepository.findOne({
      where: { id: saved.id },
      relations: ['author', 'author.profile'],
    });
  }

  async getPostComments(postId: string) {
    return this.commentRepository.find({
      where: { postId, parentId: null },
      relations: ['author', 'author.profile', 'replies', 'replies.author', 'replies.author.profile'],
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string, userId: string) {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) throw new ForbiddenException('Not authorized');

    await this.commentRepository.remove(comment);
    return { message: 'Comment deleted successfully' };
  }
}
