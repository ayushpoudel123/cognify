import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { Profile } from '../users/entities/profile.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingEmail = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email is already registered');
    }

    const existingUsername = await this.userRepository.findOne({
      where: { username: registerDto.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username is already taken');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      email: registerDto.email,
      username: registerDto.username,
      passwordHash,
      role: UserRole.USER,
      isVerified: true, // Auto-verify for dev
      profile: this.profileRepository.create({
        fullName: registerDto.fullName || registerDto.username,
        bio: 'Passionate learner & knowledge sharer on Cognify.',
      }),
    });

    const savedUser = await this.userRepository.save(user);
    const tokens = await this.generateTokens(savedUser);

    return {
      user: this.sanitizeUser(savedUser),
      ...tokens,
    };
  }

  async adminRegister(registerDto: RegisterDto) {
    const existingEmail = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email is already registered');
    }

    const existingUsername = await this.userRepository.findOne({
      where: { username: registerDto.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username is already taken');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      email: registerDto.email,
      username: registerDto.username,
      passwordHash,
      role: UserRole.ADMIN,
      isVerified: true,
      profile: this.profileRepository.create({
        fullName: registerDto.fullName || `Admin ${registerDto.username}`,
        bio: 'System Administrator on Cognify.',
      }),
    });

    const savedUser = await this.userRepository.save(user);
    const tokens = await this.generateTokens(savedUser);

    return {
      user: this.sanitizeUser(savedUser),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: [
        { email: loginDto.emailOrUsername },
        { username: loginDto.emailOrUsername },
      ],
      select: ['id', 'email', 'username', 'passwordHash', 'role', 'isActive'],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials or account inactive');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const fullUser = await this.userRepository.findOne({
      where: { id: user.id },
    });

    const tokens = await this.generateTokens(fullUser);

    return {
      user: this.sanitizeUser(fullUser),
      ...tokens,
    };
  }

  async adminLogin(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: [
        { email: loginDto.emailOrUsername },
        { username: loginDto.emailOrUsername },
      ],
      select: ['id', 'email', 'username', 'passwordHash', 'role', 'isActive'],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials or account inactive');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied. This portal is restricted to System Administrators.');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const fullUser = await this.userRepository.findOne({
      where: { id: user.id },
    });

    const tokens = await this.generateTokens(fullUser);

    return {
      user: this.sanitizeUser(fullUser),
      ...tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'cognify_jwt_refresh_secret_key_2026',
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub, isActive: true },
      });
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (err) {
      throw new UnauthorizedException('Expired or invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.refreshTokenRepository.delete({ userId });
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_SECRET') ||
        'cognify_jwt_secret_key_2026_super_secure',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'cognify_jwt_refresh_secret_key_2026',
      expiresIn: '7d',
    });

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepository.save({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}

