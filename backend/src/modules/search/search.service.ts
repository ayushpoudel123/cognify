import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Post, PostStatus, Category } from '../posts/entities';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async globalSearch(query?: string) {
    if (!query || query.trim() === '') {
      // Default fallback when query is empty
      const categories = await this.categoryRepository.find({ take: 8 });
      const posts = await this.postRepository.find({
        where: { status: PostStatus.PUBLISHED },
        relations: ['author', 'author.profile', 'category', 'media'],
        order: { createdAt: 'DESC' },
        take: 10,
      });
      const users = await this.userRepository.find({
        where: { isActive: true, role: UserRole.USER },
        relations: ['profile'],
        order: { createdAt: 'DESC' },
        take: 6,
      });
      return { users, posts, categories };
    }

    const rawTerm = query.trim().replace(/^#/, '');
    const searchTerm = `%${rawTerm}%`;

    const users = await this.userRepository.find({
      where: [
        { username: ILike(searchTerm), isActive: true, role: UserRole.USER },
        { email: ILike(searchTerm), isActive: true, role: UserRole.USER },
      ],
      relations: ['profile'],
      take: 10,
    });

    const posts = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.media', 'media')
      .where('post.status = :status', { status: PostStatus.PUBLISHED })
      .andWhere(
        '(post.title ILike :searchTerm OR post.content ILike :searchTerm OR category.name ILike :searchTerm OR post.hashtags ILike :searchTerm)',
        { searchTerm },
      )
      .orderBy('post.createdAt', 'DESC')
      .take(15)
      .getMany();

    const categories = await this.categoryRepository.find({
      where: { name: ILike(searchTerm) },
      take: 8,
    });

    return { users, posts, categories };
  }
}
