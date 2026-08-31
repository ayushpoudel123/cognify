import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Post, PostStatus } from '../posts/entities/post.entity';
import { Report, ReportStatus } from '../communication/entities';
import { Comment } from '../comments/entities/comment.entity';
import { Category } from '../posts/entities/category.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getPlatformStats() {
    const totalUsers = await this.userRepository.count();
    const activePosts = await this.postRepository.count();
    const pendingReports = await this.reportRepository.count({ where: { status: ReportStatus.PENDING } });
    const totalComments = await this.commentRepository.count();

    return {
      totalUsers,
      activePosts,
      pendingReports,
      totalComments,
    };
  }

  async getAllUsers() {
    return this.userRepository.find({
      relations: ['profile'],
      order: { createdAt: 'DESC' },
    });
  }

  async toggleUserStatus(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.isActive = !user.isActive;
    await this.userRepository.save(user);

    return { id: user.id, isActive: user.isActive };
  }

  async getAllPosts() {
    return this.postRepository.find({
      relations: ['author', 'author.profile', 'category', 'media'],
      order: { createdAt: 'DESC' },
    });
  }

  async updatePostStatus(postId: string, status: PostStatus) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    post.status = status;
    return this.postRepository.save(post);
  }

  async deletePost(postId: string) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    await this.postRepository.remove(post);
    return { message: 'Post removed by administrator' };
  }

  async getAllComments() {
    return this.commentRepository.find({
      relations: ['author', 'author.profile', 'post'],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async deleteComment(commentId: string) {
    const comment = await this.commentRepository.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');

    await this.commentRepository.remove(comment);
    return { message: 'Comment removed by administrator' };
  }

  async getAllReports() {
    return this.reportRepository.find({
      relations: ['reporter', 'reporter.profile'],
      order: { createdAt: 'DESC' },
    });
  }

  async resolveReport(reportId: string, status: ReportStatus) {
    const report = await this.reportRepository.findOne({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');

    report.status = status;
    return this.reportRepository.save(report);
  }

  async createCategory(name: string, description?: string) {
    const category = this.categoryRepository.create({ name, description });
    return this.categoryRepository.save(category);
  }

  async deleteCategory(categoryId: string) {
    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('Category not found');

    await this.categoryRepository.remove(category);
    return { message: 'Category removed' };
  }
}
