import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../communication/entities';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSockets.set(userId, client.id);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  sendNotificationToUser(recipientId: string, notification: any) {
    const socketId = this.userSockets.get(recipientId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    }
  }
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private gateway: NotificationsGateway,
  ) {}

  async createNotification(
    recipientId: string,
    actorId: string,
    type: NotificationType,
    entityId?: string,
    message?: string,
  ) {
    if (recipientId === actorId) return; // Don't notify self

    const notif = this.notificationRepository.create({
      recipientId,
      actorId,
      type,
      entityId,
      message,
    });

    const saved = await this.notificationRepository.save(notif);
    const populated = await this.notificationRepository.findOne({
      where: { id: saved.id },
      relations: ['actor', 'actor.profile'],
    });

    this.gateway.sendNotificationToUser(recipientId, populated);
    return populated;
  }

  async getUserNotifications(userId: string) {
    return this.notificationRepository.find({
      where: { recipientId: userId },
      relations: ['actor', 'actor.profile'],
      order: { createdAt: 'DESC' },
      take: 30,
    });
  }

  async markAsRead(id: string, userId: string) {
    await this.notificationRepository.update({ id, recipientId: userId }, { isRead: true });
    return { success: true };
  }
}
