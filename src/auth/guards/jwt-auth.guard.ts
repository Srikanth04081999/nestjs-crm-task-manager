import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { AuthRequest } from '../../common/auth-request.js';
import { UsersService } from '../../users/users.service.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      'public',
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const [scheme, token] =
      request.headers.authorization?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Bearer token required');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
      }>(token);

      if (!Number.isInteger(payload.sub) || payload.sub < 1) {
        throw new Error('Invalid subject');
      }

      // Read the current role from the database.
      request.user = await this.usersService.findOne(payload.sub);
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}