import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../common/database/base.entity';
import type { Post } from './post.entity';

export enum PostType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

@Entity('post_media')
export class PostMedia extends AppBaseEntity {
  @Column()
  url: string;

  @Column({ type: 'enum', enum: PostType, default: PostType.IMAGE })
  type: PostType;

  @Column({ default: 0 })
  order: number;

  @Column()
  postId: string;

  @ManyToOne('Post', 'media', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;
}
