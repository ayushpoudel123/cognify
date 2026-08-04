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

    const searchTerm = `%${query.trim()}%`;

    const users = await this.userRepository.find({
      where: [
        { username: ILike(searchTerm), isActive: true, role: UserRole.USER },
        { email: ILike(searchTerm), isActive: true, role: UserRole.USER },
      ],
      relations: ['profile'],
      take: 10,
    });

    const posts = await this.postRepository.find({
      where: [
        { title: ILike(searchTerm), status: PostStatus.PUBLISHED },
        { content: ILike(searchTerm), status: PostStatus.PUBLISHED },
      ],
      relations: ['author', 'author.profile', 'category', 'media'],
      take: 10,
    });

    const categories = await this.categoryRepository.find({
      where: { name: ILike(searchTerm) },
      take: 8,
    });

    return { users, posts, categories };
  }
}
