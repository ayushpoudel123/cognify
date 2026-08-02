import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostStatus, PostMedia, Category, Tag } from './entities';
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
  ) {}

  async create(authorId: string, dto: CreatePostDto) {
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

    Object.assign(post, dto);
    return this.postRepository.save(post);
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
}
