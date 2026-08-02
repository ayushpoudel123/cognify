import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { AppBaseEntity } from '../../../common/database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';

export enum TargetType {
  POST = 'POST',
  COMMENT = 'COMMENT',
}

export enum ReactionType {
  LIKE = 'LIKE',
}

@Entity('reactions')
@Unique(['userId', 'targetType', 'targetId'])
export class Reaction extends AppBaseEntity {
  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.reactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: TargetType, default: TargetType.POST })
  targetType: TargetType;

  @Column()
  targetId: string;

  @Column({ type: 'enum', enum: ReactionType, default: ReactionType.LIKE })
  type: ReactionType;
}

@Entity('bookmarks')
@Unique(['userId', 'postId'])
export class Bookmark extends AppBaseEntity {
  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.bookmarks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  postId: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;
}

@Entity('follows')
@Unique(['followerId', 'followingId'])
export class Follow extends AppBaseEntity {
  @Column()
  followerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followerId' })
  follower: User;

  @Column()
  followingId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followingId' })
  following: User;
}
