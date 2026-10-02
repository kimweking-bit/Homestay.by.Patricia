import { Controller, Get, NotFoundException, Param, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles } from "../common/auth/decorators.js";
import { AuthGuard, RolesGuard } from "../common/auth/guards.js";
import { PageQueryDto } from "../common/page.js";
import { UsersService } from "./users.service.js";

@ApiTags("admin")
@Controller({ path: "admin/users", version: "1" })
@UseGuards(AuthGuard, RolesGuard)
@Roles("ADMIN")
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: "List guest and admin accounts" })
  list(@Query() query: PageQueryDto) {
    return this.usersService.listForAdmin(query.page, query.pageSize);
  }

  @Get(":id")
  @ApiOperation({ summary: "Load one account without secrets" })
  async get(@Param("id") id: string) {
    const user = await this.usersService.getForAdmin(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }
}
