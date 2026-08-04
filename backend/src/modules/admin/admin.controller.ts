import { Controller, Get, Patch, Delete, Param, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../../common/decorators';
import { UserRole } from '../users/entities/user.entity';
import { RolesGuard } from '../../common/guards';
import { ReportStatus } from '../communication/entities';

@ApiTags('Admin Controls')
@Controller('admin')
@Roles(UserRole.ADMIN)
@UseGuards(RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get high-level platform statistics' })
  async getStats() {
    return this.adminService.getPlatformStats();
  }

  @Get('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all platform users' })
  async getUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id/toggle-status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate or Deactivate a user account' })
  async toggleUserStatus(@Param('id') userId: string) {
    return this.adminService.toggleUserStatus(userId);
  }

  @Get('posts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all platform posts for moderation' })
  async getPosts() {
    return this.adminService.getAllPosts();
  }

  @Delete('posts/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post as administrator' })
  async deletePost(@Param('id') postId: string) {
    return this.adminService.deletePost(postId);
  }

  @Get('comments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List recent comments for moderation' })
  async getComments() {
    return this.adminService.getAllComments();
  }

  @Delete('comments/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment as administrator' })
  async deleteComment(@Param('id') commentId: string) {
    return this.adminService.deleteComment(commentId);
  }

  @Patch('reports/:id/resolve')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resolve or dismiss a user/post report' })
  async resolveReport(
    @Param('id') reportId: string,
    @Body('status') status: ReportStatus,
  ) {
    return this.adminService.resolveReport(reportId, status);
  }
}
