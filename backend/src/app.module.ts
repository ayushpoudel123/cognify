import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Common
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './common/guards';

// Entities
import { User } from './modules/users/entities/user.entity';
import { Profile } from './modules/users/entities/profile.entity';
import { RefreshToken } from './modules/auth/entities/refresh-token.entity';
import { Post, PostMedia, Category, Tag } from './modules/posts/entities';
import { Comment } from './modules/comments/entities/comment.entity';
import { Reaction, Bookmark, Follow } from './modules/social/entities';
import { Conversation, Message, Notification, Report } from './modules/communication/entities';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { MediaModule } from './modules/media/media.module';
import { CommentsModule } from './modules/comments/comments.module';
import { SocialModule } from './modules/social/social.module';
import { FeedModule } from './modules/feed/feed.module';
import { SearchModule } from './modules/search/search.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ChatModule } from './modules/chat/chat.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
        username: configService.get<string>('DB_USERNAME') || 'cognify_user',
        password: configService.get<string>('DB_PASSWORD') || 'cognify_password',
        database: configService.get<string>('DB_NAME') || 'cognify_db',
        entities: [
          User,
          Profile,
          RefreshToken,
          Post,
          PostMedia,
          Category,
          Tag,
          Comment,
          Reaction,
          Bookmark,
          Follow,
          Conversation,
          Message,
          Notification,
          Report,
        ],
        synchronize: true, // Auto sync schema for local development setup
        logging: false,
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    UsersModule,
    PostsModule,
    MediaModule,
    CommentsModule,
    SocialModule,
    FeedModule,
    SearchModule,
    NotificationsModule,
    ChatModule,
    AnalyticsModule,
    ReportsModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
