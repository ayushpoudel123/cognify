import { Entity, Column } from 'typeorm';
import { AppBaseEntity } from '../../../common/database/base.entity';

@Entity('categories')
export class Category extends AppBaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  description: string;
}

@Entity('tags')
export class Tag extends AppBaseEntity {
  @Column({ unique: true })
  name: string;
}
