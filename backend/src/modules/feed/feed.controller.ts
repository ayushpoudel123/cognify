import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { CursorPaginationDto } from '../../common/pagination/cursor-pagination.dto';
import { CurrentUser, Public } from '../../common/decorators';

@ApiTags('Feeds')
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Public()
  @Get('latest')
  @ApiOperation({ summary: 'Get latest educational posts feed (cursor paginated)' })
  async getLatestFeed(@Query() query: CursorPaginationDto) {
    return this.feedService.getLatestFeed(query);
  }

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Get trending posts feed based on engagement' })
  async getTrendingFeed(@Query() query: CursorPaginationDto) {
    return this.feedService.getTrendingFeed(query);
  }

  @Get('following')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get post feed from users you follow' })
  async getFollowingFeed(
    @CurrentUser('id') userId: string,
    @Query() query: CursorPaginationDto,
  ) {
    return this.feedService.getFollowingFeed(userId, query);
  }
}
