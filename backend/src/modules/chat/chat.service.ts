import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, Message, NotificationType } from '../communication/entities';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeUsers = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.activeUsers.set(userId, client.id);
      this.server.emit('user_online', { userId });
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.activeUsers.entries()) {
      if (socketId === client.id) {
        this.activeUsers.delete(userId);
        this.server.emit('user_offline', { userId });
        break;
      }
    }
  }

  @SubscribeMessage('typing')
  handleTyping(@MessageBody() data: { conversationId: string; recipientId: string; isTyping: boolean }, @ConnectedSocket() client: Socket) {
    const socketId = this.activeUsers.get(data.recipientId);
    if (socketId) {
      this.server.to(socketId).emit('typing_status', data);
    }
  }

  sendDirectMessage(recipientId: string, message: any) {
    const socketId = this.activeUsers.get(recipientId);
    if (socketId) {
      this.server.to(socketId).emit('new_message', message);
    }
  }
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private chatGateway: ChatGateway,
    private notificationsService: NotificationsService,
  ) {}

  async getOrCreateConversation(userId: string, targetUserId: string) {
    let conversation = await this.conversationRepository.findOne({
      where: [
        { userOneId: userId, userTwoId: targetUserId },
        { userOneId: targetUserId, userTwoId: userId },
      ],
      relations: ['userOne', 'userOne.profile', 'userTwo', 'userTwo.profile'],
    });

    if (!conversation) {
      conversation = this.conversationRepository.create({
        userOneId: userId,
        userTwoId: targetUserId,
      });
      await this.conversationRepository.save(conversation);
      conversation = await this.getOrCreateConversation(userId, targetUserId);
    }

    return conversation;
  }

  async getUserConversations(userId: string) {
    return this.conversationRepository.find({
      where: [{ userOneId: userId }, { userTwoId: userId }],
      relations: ['userOne', 'userOne.profile', 'userTwo', 'userTwo.profile'],
      order: { lastMessageAt: 'DESC' },
    });
  }

  async sendMessage(senderId: string, conversationId: string, content: string, mediaUrl?: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const message = this.messageRepository.create({
      conversationId,
      senderId,
      content,
      mediaUrl,
    });

    const saved = await this.messageRepository.save(message);

    conversation.lastMessageContent = content || (mediaUrl ? '[Image]' : '');
    conversation.lastMessageAt = new Date();
    await this.conversationRepository.save(conversation);

    const populated = await this.messageRepository.findOne({
      where: { id: saved.id },
      relations: ['sender', 'sender.profile'],
    });

    const recipientId =
      conversation.userOneId === senderId
        ? conversation.userTwoId
        : conversation.userOneId;

    this.chatGateway.sendDirectMessage(recipientId, populated);

    await this.notificationsService.createNotification(
      recipientId,
      senderId,
      NotificationType.MESSAGE,
      conversationId,
      content ? `sent you a message: "${content.substring(0, 30)}..."` : 'sent an attachment',
    );

    return populated;
  }

  async getConversationMessages(conversationId: string) {
    return this.messageRepository.find({
      where: { conversationId },
      relations: ['sender', 'sender.profile'],
      order: { createdAt: 'ASC' },
      take: 100,
    });
  }
}
