import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { HealthService } from "./health.service.js";

export type HealthResponse = {
  status: "ok";
  service: "backend";
  version: string;
};

@ApiTags("health")
@Controller({
  path: "health",
  version: "1",
})
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOkResponse({ description: "Backend service health metadata" })
  getHealth(): HealthResponse {
    return this.healthService.getHealth();
  }
}
