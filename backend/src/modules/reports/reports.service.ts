import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportReason } from '../communication/entities';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ example: 'POST' })
  @IsString()
  @IsNotEmpty()
  targetType: string; // USER or POST

  @ApiProperty({ example: 'post-uuid-123' })
  @IsString()
  @IsNotEmpty()
  targetId: string;

  @ApiProperty({ enum: ReportReason, default: ReportReason.SPAM })
  @IsEnum(ReportReason)
  reason: ReportReason;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  details?: string;
}

import { User, UserRole } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../communication/entities';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private notificationsService: NotificationsService,
  ) {}

  async createReport(reporterId: string, dto: CreateReportDto) {
    const report = this.reportRepository.create({
      reporterId,
      targetType: dto.targetType,
      targetId: dto.targetId,
      reason: dto.reason,
      details: dto.details,
    });
    const savedReport = await this.reportRepository.save(report);

    // Notify all administrators about the new report
    try {
      const reporter = await this.userRepository.findOne({ where: { id: reporterId } });
      let targetTitle = 'Content';

      if (dto.targetType === 'POST') {
        const post = await this.postRepository.findOne({ where: { id: dto.targetId } });
        if (post) {
          targetTitle = `post "${post.title}"`;
        }
      }

      const admins = await this.userRepository.find({ where: { role: UserRole.ADMIN } });
      for (const admin of admins) {
        await this.notificationsService.createNotification(
          admin.id,
          reporterId,
          NotificationType.REPORT,
          dto.targetId,
          `New report submitted on ${targetTitle} by @${reporter?.username || 'user'} for ${dto.reason}`,
        );
      }
    } catch (err) {
      console.error('Failed to notify admins of report:', err);
    }

    return savedReport;
  }

  async getAllReports() {
    return this.reportRepository.find({
      relations: ['reporter', 'reporter.profile'],
      order: { createdAt: 'DESC' },
    });
  }
}
