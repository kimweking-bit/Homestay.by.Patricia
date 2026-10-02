import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { LoginDto, RegisterDto } from "./dto.js";

@ApiTags("auth")
@Controller({ path: "auth", version: "1" })
@Throttle({ default: { limit: 10, ttl: 60_000 } })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Create a guest account and start a session" })
  register(@Body() body: RegisterDto, @Res({ passthrough: true }) response: Response) {
    return this.authService.register(body, response);
  }

  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Sign in with email and password" })
  login(@Body() body: LoginDto, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(body, response);
  }

  @Post("logout")
  @HttpCode(200)
  @ApiOperation({ summary: "Clear the session cookie" })
  logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    return this.authService.logout(request, response);
  }

  @Get("me")
  @ApiOperation({ summary: "Return the signed-in user" })
  async me(@Req() request: Request) {
    const user = await this.authService.userFromRequest(request);
    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }
    return user;
  }
}
