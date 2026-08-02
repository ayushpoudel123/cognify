import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiPropertyOptional } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CurrentUser } from '../../common/decorators';
import { IsString, IsOptional } from 'class-validator';

export class SendMessageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mediaUrl?: string;
}

@ApiTags('Direct Messaging')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user active conversation threads' })
  async getConversations(@CurrentUser('id') userId: string) {
    return this.chatService.getUserConversations(userId);
  }

  @Post('conversation/:targetUserId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get or start a 1-on-1 conversation with a user' })
  async getOrCreateConversation(
    @CurrentUser('id') userId: string,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.chatService.getOrCreateConversation(userId, targetUserId);
  }

  @Get('messages/:conversationId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get message history for a conversation' })
  async getMessages(@Param('conversationId') conversationId: string) {
    return this.chatService.getConversationMessages(conversationId);
  }

  @Post('messages/:conversationId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a message in a conversation' })
  async sendMessage(
    @CurrentUser('id') userId: string,
    @Param('conversationId') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(userId, conversationId, dto.content, dto.mediaUrl);
  }
}
