import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../common/database/base.entity';
import { User } from './user.entity';

@Entity('profiles')
export class Profile extends AppBaseEntity {
  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  education: string;

  @Column('simple-array', { nullable: true })
  skills: string[];

  @Column('simple-array', { nullable: true })
  interests: string[];

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'jsonb', nullable: true })
  socialLinks: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };

  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
