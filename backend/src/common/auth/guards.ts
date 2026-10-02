import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Role } from "@prisma/client";
import type { Request } from "express";
import { AuthService } from "../../auth/auth.service.js";

export const ROLES_KEY = "roles";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const user = await this.authService.userFromRequest(request);
    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }
    request.user = user;
    return true;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!roles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    if (!request.user || !roles.includes(request.user.role)) {
      throw new ForbiddenException("You do not have access to this resource");
    }
    return true;
  }
}
