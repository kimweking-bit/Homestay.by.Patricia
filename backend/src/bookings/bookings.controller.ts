import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/auth/decorators.js";
import { AuthGuard } from "../common/auth/guards.js";
import { BookingsService } from "./bookings.service.js";
import { BookingListQueryDto, CancelBookingDto, CreateBookingDto, QuoteBookingDto, UpdateBookingDto } from "./dto.js";

@ApiTags("bookings")
@Controller({ path: "bookings", version: "1" })
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post("quote")
  @HttpCode(200)
  @ApiOperation({ summary: "Server-calculated stay estimate and availability" })
  quote(@Body() body: QuoteBookingDto) {
    return this.bookingsService.quote(body);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Submit a booking request" })
  create(@CurrentUser() user: Express.Request["user"], @Body() body: CreateBookingDto) {
    return this.bookingsService.create(user!, body);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "List the signed-in guest's booking requests" })
  list(@CurrentUser() user: Express.Request["user"], @Query() query: BookingListQueryDto) {
    return this.bookingsService.listForUser(user!.id, query.page, query.pageSize);
  }

  @Get(":idOrReference")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Open one booking the guest owns" })
  get(@CurrentUser() user: Express.Request["user"], @Param("idOrReference") idOrReference: string) {
    return this.bookingsService.getForActor(user!, idOrReference);
  }

  @Patch(":idOrReference")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Modify an open booking request" })
  update(
    @CurrentUser() user: Express.Request["user"],
    @Param("idOrReference") idOrReference: string,
    @Body() body: UpdateBookingDto,
  ) {
    return this.bookingsService.updateForGuest(user!, idOrReference, body);
  }

  @Post(":idOrReference/cancel")
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Cancel a booking when its status allows it" })
  cancel(
    @CurrentUser() user: Express.Request["user"],
    @Param("idOrReference") idOrReference: string,
    @Body() body: CancelBookingDto,
  ) {
    return this.bookingsService.cancel(user!, idOrReference, body.note);
  }
}
