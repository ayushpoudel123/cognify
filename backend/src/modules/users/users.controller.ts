import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser, Public } from '../../common/decorators';

@ApiTags('Users & Profiles')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get('suggested')
  @ApiOperation({ summary: 'Get real suggested users to follow' })
  async getSuggested(@CurrentUser('id') userId?: string) {
    return this.usersService.getSuggestedUsers(userId);
  }

  @Public()
  @Get('profile/:username')
  @ApiOperation({ summary: 'Get public user profile by username' })
  async getProfile(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }
}
