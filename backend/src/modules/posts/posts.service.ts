import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostStatus, PostMedia, Category, Tag } from './entities';
import { User, UserRole } from '../users/entities/user.entity';
import { CreatePostDto, UpdatePostDto } from './dto';
import { CursorPaginationDto, PaginatedResult } from '../../common/pagination/cursor-pagination.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(PostMedia)
    private mediaRepository: Repository<PostMedia>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(authorId: string, dto: CreatePostDto) {
    const author = await this.userRepository.findOne({ where: { id: authorId } });
    if (author?.role === UserRole.ADMIN) {
      throw new ForbiddenException(
        'Administrators cannot create posts. Admin accounts are restricted to platform management and moderation.',
      );
    }

    const post = this.postRepository.create({
      title: dto.title,
      content: dto.content,
      type: dto.type,
      status: dto.status || PostStatus.PUBLISHED,
      authorId,
      categoryId: dto.categoryId,
      hashtags: dto.hashtags || [],
    });

    const savedPost = await this.postRepository.save(post);

    if (dto.mediaUrls && dto.mediaUrls.length > 0) {
      const mediaEntities = dto.mediaUrls.map((url, idx) =>
        this.mediaRepository.create({
          url,
          postId: savedPost.id,
          order: idx,
        }),
      );
      await this.mediaRepository.save(mediaEntities);
    }

    return this.findOne(savedPost.id);
  }

  async findOne(id: string) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'author.profile', 'category', 'media', 'tags'],
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Increment view count asynchronously
    post.viewsCount += 1;
    await this.postRepository.save(post);

    return post;
  }

  async update(id: string, userId: string, dto: UpdatePostDto) {
    const post = await this.findOne(id);
    if (post.authorId !== userId) {
      throw new ForbiddenException('You are not authorized to edit this post');
    }

    if (dto.title !== undefined) post.title = dto.title;
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.type !== undefined) post.type = dto.type;
    if (dto.status !== undefined) post.status = dto.status;
    if (dto.categoryId !== undefined) post.categoryId = dto.categoryId;
    if (dto.hashtags !== undefined) post.hashtags = dto.hashtags;

    const savedPost = await this.postRepository.save(post);

    if (dto.mediaUrls !== undefined) {
      await this.mediaRepository.delete({ postId: post.id });
      if (dto.mediaUrls.length > 0) {
        const mediaEntities = dto.mediaUrls.map((url, idx) =>
          this.mediaRepository.create({
            url,
            postId: savedPost.id,
            order: idx,
          }),
        );
        await this.mediaRepository.save(mediaEntities);
      }
    }

    return this.findOne(savedPost.id);
  }

  async remove(id: string, userId: string, isAdmin = false) {
    const post = await this.findOne(id);
    if (post.authorId !== userId && !isAdmin) {
      throw new ForbiddenException('You are not authorized to delete this post');
    }

    await this.postRepository.remove(post);
    return { message: 'Post deleted successfully' };
  }

  async getCategories() {
    return this.categoryRepository.find();
  }

  async getTrendingTopics() {
    const posts = await this.postRepository.find({
      where: { status: PostStatus.PUBLISHED },
      select: ['hashtags'],
    });

    const tagCounts: { [tag: string]: number } = {};

    posts.forEach((p) => {
      if (Array.isArray(p.hashtags)) {
        p.hashtags.forEach((t) => {
          const cleanTag = t.trim().replace(/^#/, '');
          if (cleanTag) {
            tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
          }
        });
      }
    });

    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({
        tag: `#${tag}`,
        postsCount: count,
        postsFormatted: `${count} ${count === 1 ? 'post' : 'posts'}`,
      }));

    // Fallback default tags if no posts exist yet
    if (sortedTags.length === 0) {
      return [
        { tag: '#MachineLearning', postsCount: 1, postsFormatted: '1 post' },
        { tag: '#WebDevelopment', postsCount: 1, postsFormatted: '1 post' },
        { tag: '#DataScience', postsCount: 1, postsFormatted: '1 post' },
        { tag: '#SystemDesign', postsCount: 1, postsFormatted: '1 post' },
      ];
    }

    return sortedTags;
  }
}
