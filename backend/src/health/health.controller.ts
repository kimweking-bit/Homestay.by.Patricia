import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service.js";
import { HealthService } from "./health.service.js";

export type HealthResponse = {
  status: "ok";
  service: "backend";
  version: string;
  database?: "up" | "down";
};

@ApiTags("health")
@Controller({
  path: "health",
  version: "1",
})
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOkResponse({ description: "Backend service health metadata" })
  async getHealth(): Promise<HealthResponse> {
    const health = this.healthService.getHealth();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ...health, database: "up" };
    } catch {
      throw new ServiceUnavailableException({
        ...health,
        status: "ok",
        database: "down",
        message: "Database unavailable",
      });
    }
  }
}
