import "@nestjs/platform-express";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { pathToFileURL } from "node:url";
import { AppModule } from "./app.module.js";
import { getEnv } from "./common/config/env.js";
import { AllExceptionsFilter } from "./common/http.js";

export async function createApp() {
  const app = await NestFactory.create(AppModule, { logger: process.env.NODE_ENV === "test" ? ["error"] : undefined });
  const env = getEnv();

  app.use(cookieParser());
  app.enableCors({
    origin: env.corsOrigins,
    credentials: true,
  });
  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Homestay.by.Patricia API")
    .setDescription("Booking requests, stays, guest accounts, and host review. Prices are estimates until Patricia confirms a stay. Payments are not collected here.")
    .setVersion("1.0.0")
    .addCookieAuth("hbp_session")
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document);

  return app;
}

async function bootstrap() {
  const app = await createApp();
  await app.listen(getEnv().port, "0.0.0.0");
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entry) {
  void bootstrap();
}
