import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import type { Response, Request } from "express";
import { PrismaService } from "../prisma/prisma.service.js";
import { hashPassword, verifyPassword } from "../common/auth/password.js";
import { readSession, signSession } from "../common/auth/session.js";
import { getEnv } from "../common/config/env.js";
import type { RegisterDto, LoginDto } from "./dto.js";

const publicUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
} as const;

function sessionToken(request: Request): string | undefined {
  const header = request.header("authorization");
  const bearer = header?.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : undefined;
  // cookie-parser types the jar as `any`; copy it through `unknown` before reading.
  const jar: unknown = request.cookies;
  if (!jar || typeof jar !== "object") {
    return bearer;
  }
  const value = (jar as Record<string, unknown>)[getEnv().cookieName];
  return typeof value === "string" && value.length > 0 ? value : bearer;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(input: RegisterDto, response: Response) {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
    if (existing) {
      throw new ConflictException("An account with this email already exists.");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone || null,
        role: "GUEST",
        profile: { create: {} },
      },
      select: publicUserSelect,
    });

    await this.prisma.auditLog.create({
      data: { actorId: user.id, action: "auth.register", entityType: "user", entityId: user.id },
    });
    await this.attachSession(response, user.id, user.role);
    return user;
  }

  async login(input: LoginDto, response: Response) {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    const valid = user ? await verifyPassword(input.password, user.passwordHash) : false;
    if (!user || !valid) {
      await this.prisma.auditLog.create({
        data: {
          action: "auth.login_failed",
          entityType: "user",
          note: input.email,
        },
      });
      throw new UnauthorizedException("Invalid email or password");
    }

    await this.prisma.auditLog.create({
      data: { actorId: user.id, action: "auth.login", entityType: "user", entityId: user.id },
    });
    await this.attachSession(response, user.id, user.role);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
    };
  }

  async logout(request: Request, response: Response) {
    const user = await this.userFromRequest(request);
    if (user) {
      await this.prisma.auditLog.create({
        data: { actorId: user.id, action: "auth.logout", entityType: "user", entityId: user.id },
      });
    }
    this.clearSession(response);
    return { ok: true };
  }

  async userFromRequest(request: Request) {
    const token = sessionToken(request);
    if (!token) {
      return null;
    }

    const claims = await readSession(token, getEnv().authSecret);
    if (!claims) {
      return null;
    }

    return this.prisma.user.findUnique({ where: { id: claims.userId }, select: publicUserSelect });
  }

  private async attachSession(response: Response, userId: string, role: "GUEST" | "ADMIN") {
    const env = getEnv();
    const token = await signSession(userId, role, env.authSecret, env.sessionTtl);
    response.cookie(env.cookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.cookieSecure,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearSession(response: Response) {
    const env = getEnv();
    response.clearCookie(env.cookieName, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.cookieSecure,
      path: "/",
    });
  }
}
