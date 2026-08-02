import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { Report, ReportStatus } from '../communication/entities';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  async getPlatformStats() {
    const totalUsers = await this.userRepository.count();
    const activePosts = await this.postRepository.count();
    const pendingReports = await this.reportRepository.count({ where: { status: ReportStatus.PENDING } });

    return {
      totalUsers,
      activePosts,
      pendingReports,
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

  async resolveReport(reportId: string, status: ReportStatus) {
    const report = await this.reportRepository.findOne({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');

    report.status = status;
    return this.reportRepository.save(report);
  }
}
