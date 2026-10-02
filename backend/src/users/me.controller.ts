import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/auth/decorators.js";
import { AuthGuard } from "../common/auth/guards.js";
import { UpdateProfileDto } from "./dto.js";
import { UsersService } from "./users.service.js";

@ApiTags("account")
@Controller({ version: "1" })
@UseGuards(AuthGuard)
export class MeController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @ApiOperation({ summary: "Load the authenticated guest profile" })
  getMe(@CurrentUser() user: Express.Request["user"]) {
    return this.usersService.getMe(user!.id);
  }

  @Patch("me")
  @ApiOperation({ summary: "Update the authenticated guest profile" })
  updateMe(@CurrentUser() user: Express.Request["user"], @Body() body: UpdateProfileDto) {
    return this.usersService.updateMe(user!.id, body);
  }
}
