import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService, CreateCommentDto } from './comments.service';
import { CurrentUser, Public } from '../../common/decorators';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a comment or nested reply to a post' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateCommentDto) {
    return this.commentsService.create(userId, dto);
  }

  @Public()
  @Get('post/:postId')
  @ApiOperation({ summary: 'Get all root comments & nested replies for a post' })
  async getPostComments(@Param('postId') postId: string) {
    return this.commentsService.getPostComments(postId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.commentsService.remove(id, userId);
  }
}
