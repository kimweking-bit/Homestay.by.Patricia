import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HealthService } from "./health.service.js";

void describe("HealthService", () => {
  void it("returns backend health metadata", () => {
    const service = new HealthService();

    assert.deepEqual(service.getHealth(), {
      status: "ok",
      service: "backend",
      version: "0.1.0",
    });
  });
});
