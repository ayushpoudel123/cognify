import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SocialService } from './social.service';
import { TargetType } from './entities';
import { CurrentUser, Public } from '../../common/decorators';

@ApiTags('Social & Interactions')
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Post('like/post/:postId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle like on a post' })
  async toggleLikePost(
    @CurrentUser('id') userId: string,
    @Param('postId') postId: string,
  ) {
    return this.socialService.toggleLike(userId, TargetType.POST, postId);
  }

  @Post('like/comment/:commentId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle like on a comment' })
  async toggleLikeComment(
    @CurrentUser('id') userId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.socialService.toggleLike(userId, TargetType.COMMENT, commentId);
  }

  @Post('bookmark/:postId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle save/bookmark on a post' })
  async toggleBookmark(
    @CurrentUser('id') userId: string,
    @Param('postId') postId: string,
  ) {
    return this.socialService.toggleBookmark(userId, postId);
  }

  @Get('bookmarks')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user saved posts' })
  async getBookmarks(@CurrentUser('id') userId: string) {
    return this.socialService.getUserBookmarks(userId);
  }

  @Post('follow/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle follow/unfollow user' })
  async toggleFollow(
    @CurrentUser('id') followerId: string,
    @Param('userId') followingId: string,
  ) {
    return this.socialService.toggleFollow(followerId, followingId);
  }

  @Public()
  @Get('followers/:userId')
  @ApiOperation({ summary: 'Get followers of a user' })
  async getFollowers(@Param('userId') userId: string) {
    return this.socialService.getFollowers(userId);
  }

  @Public()
  @Get('following/:userId')
  @ApiOperation({ summary: 'Get users followed by a user' })
  async getFollowing(@Param('userId') userId: string) {
    return this.socialService.getFollowing(userId);
  }
}
