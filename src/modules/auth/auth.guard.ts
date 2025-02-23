import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/commons/decorators/public.decorator';
import { ROLES_KEY } from 'src/commons/decorators/roles.decorator';
import { ROLE } from 'src/commons/enums/user.enum';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is marked as public (IS_PUBLIC_KEY decorator)
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // Check user in system
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('jwtAuth').jwtTokenSecret,
      });
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException();
    }

    // Check role user
    const requiredRoles = this.reflector.getAllAndOverride<ROLE[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // console.log('required roles:', requiredRoles);
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    // console.log('user:', user);

    const result = requiredRoles.some((role) => user.role?.includes(role));
    // console.log('result:', result);

    return result;
  }

  private extractTokenFromHeader(request: Request) {
    // console.log('req', request);
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
