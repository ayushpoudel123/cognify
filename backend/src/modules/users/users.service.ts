import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
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
    if (!currentUserId) {
      return [];
    }

    let excludeIds: string[] = [currentUserId];
    const follows = await this.followRepository.find({ where: { followerId: currentUserId } });
    const followingIds = follows.map((f) => f.followingId);
    excludeIds = [...excludeIds, ...followingIds];

    const users = await this.userRepository.find({
      where: {
        isActive: true,
        role: UserRole.USER,
        id: Not(In(excludeIds)),
      },
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
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateProfileDto.username) {
      const cleanUsername = updateProfileDto.username.trim().toLowerCase();
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
        throw new BadRequestException(
          'Username must be between 3 and 30 characters and can only contain letters, numbers, and underscores',
        );
      }

      if (cleanUsername !== user.username) {
        const existing = await this.userRepository.findOne({
          where: { username: cleanUsername, id: Not(userId) },
        });
        if (existing) {
          throw new ConflictException('Username is already taken');
        }
        user.username = cleanUsername;
        await this.userRepository.save(user);
      }
    }

    let profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepository.create({ userId });
    }

    const { username, ...profileData } = updateProfileDto;
    Object.assign(profile, profileData);
    await this.profileRepository.save(profile);

    return this.findById(userId);
  }
}
