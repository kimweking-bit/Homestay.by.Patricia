import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "./auth/auth.module.js";
import { BookingsModule } from "./bookings/bookings.module.js";
import { HealthModule } from "./health/health.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { PropertiesModule } from "./properties/properties.module.js";
import { UsersModule } from "./users/users.module.js";

const rateLimitProviders = process.env.NODE_ENV === "test" ? [] : [{ provide: APP_GUARD, useClass: ThrottlerGuard }];

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    BookingsModule,
  ],
  providers: rateLimitProviders,
})
export class AppModule {}
