import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { hashPassword, verifyPassword } from "../common/auth/password.js";
import type { UpdateProfileDto } from "./dto.js";

const publicUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  getMe(userId: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: publicUserSelect });
  }

  async updateMe(userId: string, input: UpdateProfileDto) {
    const current = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (input.newPassword) {
      if (!input.currentPassword || !(await verifyPassword(input.currentPassword, current.passwordHash))) {
        throw new UnauthorizedException("Current password is incorrect");
      }
    }

    if (input.email && input.email !== current.email) {
      const taken = await this.prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
      if (taken) {
        throw new ConflictException("An account with this email already exists.");
      }
    }

    if (
      input.firstName === undefined &&
      input.lastName === undefined &&
      input.phone === undefined &&
      input.email === undefined &&
      input.newPassword === undefined
    ) {
      throw new BadRequestException("No profile changes were provided");
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone === undefined ? undefined : input.phone || null,
        email: input.email,
        passwordHash: input.newPassword ? await hashPassword(input.newPassword) : undefined,
        profile: {
          upsert: {
            create: {},
            update: {},
          },
        },
      },
      select: publicUserSelect,
    });

    await this.prisma.auditLog.create({
      data: { actorId: userId, action: "profile.update", entityType: "user", entityId: userId },
    });

    return user;
  }

  async listForAdmin(page: number, pageSize: number) {
    const where = {};
    const [total, items] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: publicUserSelect,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { items, page, pageSize, total };
  }

  async getForAdmin(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: publicUserSelect });
    return user;
  }
}
