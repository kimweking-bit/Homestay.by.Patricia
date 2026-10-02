import { SetMetadata, createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Role } from "@prisma/client";
import type { Request } from "express";
import { ROLES_KEY } from "./guards.js";

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<Request>();
  return request.user;
});
