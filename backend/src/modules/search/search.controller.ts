import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { Public } from '../../common/decorators';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Global search across users, posts, and categories' })
  @ApiQuery({ name: 'q', description: 'Search term', required: true })
  async search(@Query('q') query: string) {
    return this.searchService.globalSearch(query);
  }
}
