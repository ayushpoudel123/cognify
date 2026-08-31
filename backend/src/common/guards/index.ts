import {
  Injectable,
  ExecutionContext,
  CanActivate,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY, ROLES_KEY } from '../decorators';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      try {
        const res = super.canActivate(context);
        if (res instanceof Promise) {
          return res.catch(() => true);
        }
      } catch {
        return true;
      }
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context?: ExecutionContext) {
    const isPublic = context
      ? this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
          context.getHandler(),
          context.getClass(),
        ])
      : false;

    if (isPublic) {
      return user || null;
    }

    if (err || !user) {
      throw err || new UnauthorizedException('Authentication token missing or invalid');
    }
    return user;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user?.role === role);
  }
}
