import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Follow } from '../social/entities';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
  ) {}

  async findByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: { username, isActive: true },
      relations: ['profile'],
    });
    if (!user) {
      throw new NotFoundException(`User @${username} not found`);
    }

    const followersCount = await this.followRepository.count({ where: { followingId: user.id } });
    const followingCount = await this.followRepository.count({ where: { followerId: user.id } });

    return {
      ...user,
      followersCount,
      followingCount,
    };
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
      relations: ['profile'],
    });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    const followersCount = await this.followRepository.count({ where: { followingId: user.id } });
    const followingCount = await this.followRepository.count({ where: { followerId: user.id } });

    return {
      ...user,
      followersCount,
      followingCount,
    };
  }

  async getSuggestedUsers(currentUserId?: string) {
    let excludeIds: string[] = [];
    if (currentUserId) {
      excludeIds.push(currentUserId);
      const follows = await this.followRepository.find({ where: { followerId: currentUserId } });
      const followingIds = follows.map((f) => f.followingId);
      excludeIds = [...excludeIds, ...followingIds];
    }

    const where: any = { isActive: true, role: UserRole.USER };
    if (excludeIds.length > 0) {
      where.id = Not(In(excludeIds));
    }

    const users = await this.userRepository.find({
      where,
      relations: ['profile'],
      take: 5,
      order: { createdAt: 'DESC' },
    });

    return Promise.all(
      users.map(async (u) => {
        const followersCount = await this.followRepository.count({ where: { followingId: u.id } });
        return { ...u, followersCount };
      }),
    );
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    let profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepository.create({ userId });
    }

    Object.assign(profile, updateProfileDto);
    await this.profileRepository.save(profile);

    return this.findById(userId);
  }
}
