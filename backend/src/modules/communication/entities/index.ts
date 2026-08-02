import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../common/database/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('conversations')
export class Conversation extends AppBaseEntity {
  @Column()
  userOneId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userOneId' })
  userOne: User;

  @Column()
  userTwoId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userTwoId' })
  userTwo: User;

  @Column({ nullable: true })
  lastMessageContent: string;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}

@Entity('messages')
export class Message extends AppBaseEntity {
  @Column()
  conversationId: string;

  @ManyToOne(() => Conversation, (conv) => conv.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @Column()
  senderId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  mediaUrl: string;

  @Column({ default: false })
  isSeen: boolean;
}

export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  REPLY = 'REPLY',
  FOLLOW = 'FOLLOW',
  MENTION = 'MENTION',
  MESSAGE = 'MESSAGE',
}

@Entity('notifications')
export class Notification extends AppBaseEntity {
  @Column()
  recipientId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipientId' })
  recipient: User;

  @Column()
  actorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actorId' })
  actor: User;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ nullable: true })
  entityId: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ default: false })
  isRead: boolean;
}

export enum ReportReason {
  SPAM = 'SPAM',
  HARASSMENT = 'HARASSMENT',
  FALSE_INFORMATION = 'FALSE_INFORMATION',
  OTHER = 'OTHER',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  DISMISSED = 'DISMISSED',
  ACTIONED = 'ACTIONED',
}

@Entity('reports')
export class Report extends AppBaseEntity {
  @Column()
  reporterId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporterId' })
  reporter: User;

  @Column()
  targetType: string; // USER or POST

  @Column()
  targetId: string;

  @Column({ type: 'enum', enum: ReportReason, default: ReportReason.SPAM })
  reason: ReportReason;

  @Column({ type: 'text', nullable: true })
  details: string;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;
}
