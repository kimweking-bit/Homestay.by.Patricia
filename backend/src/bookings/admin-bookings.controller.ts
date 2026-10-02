import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser, Roles } from "../common/auth/decorators.js";
import { AuthGuard, RolesGuard } from "../common/auth/guards.js";
import { BookingsService } from "./bookings.service.js";
import { BookingListQueryDto, UpdateBookingStatusDto } from "./dto.js";

@ApiTags("admin")
@Controller({ path: "admin/bookings", version: "1" })
@UseGuards(AuthGuard, RolesGuard)
@Roles("ADMIN")
export class AdminBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @ApiOperation({ summary: "Review booking requests" })
  list(@Query() query: BookingListQueryDto) {
    return this.bookingsService.listForAdmin(query.page, query.pageSize, query.status);
  }

  @Get(":idOrReference")
  get(@CurrentUser() user: Express.Request["user"], @Param("idOrReference") idOrReference: string) {
    return this.bookingsService.getForActor(user!, idOrReference);
  }

  @Patch(":idOrReference/status")
  @ApiOperation({ summary: "Move a request through review, confirmation, decline, or cancellation" })
  updateStatus(
    @CurrentUser() user: Express.Request["user"],
    @Param("idOrReference") idOrReference: string,
    @Body() body: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.changeStatus(user!, idOrReference, body.status, body.note);
  }
}
