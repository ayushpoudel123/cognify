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

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  async createReport(reporterId: string, dto: CreateReportDto) {
    const report = this.reportRepository.create({
      reporterId,
      targetType: dto.targetType,
      targetId: dto.targetId,
      reason: dto.reason,
      details: dto.details,
    });
    return this.reportRepository.save(report);
  }

  async getAllReports() {
    return this.reportRepository.find({
      relations: ['reporter', 'reporter.profile'],
      order: { createdAt: 'DESC' },
    });
  }
}
