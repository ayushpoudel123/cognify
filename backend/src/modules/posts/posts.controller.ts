import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto';
import { CurrentUser, Public } from '../../common/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('Posts & Content')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new educational post' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreatePostDto) {
    return this.postsService.create(userId, dto);
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'List all post categories' })
  async getCategories() {
    return this.postsService.getCategories();
  }

  @Public()
  @Get('trending-topics')
  @ApiOperation({ summary: 'Get dynamic trending topics and hashtag stats' })
  async getTrendingTopics() {
    return this.postsService.getTrendingTopics();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get post details by ID' })
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit an existing post' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.postsService.remove(id, userId);
  }
}
