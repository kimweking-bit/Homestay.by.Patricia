import { Injectable } from "@nestjs/common";
import type { HealthResponse } from "./health.controller.js";

@Injectable()
export class HealthService {
  getHealth(): HealthResponse {
    return {
      status: "ok",
      service: "backend",
      version: "0.1.0",
    };
  }
}
