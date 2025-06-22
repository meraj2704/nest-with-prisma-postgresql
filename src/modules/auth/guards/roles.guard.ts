// src/auth/guards/roles.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {} // Remove JwtService

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    console.log('required roles', requiredRoles);

    const request = context.switchToHttp().getRequest();
    const user = request.user; // JwtAuthGuard already attached user to request
    console.log('user', user);
    if (!user) {
      return false;
    }

    const matched = requiredRoles.filter((role) => role === user.role);
    console.log('matched', matched);
    return matched.length > 0;
  }
}
