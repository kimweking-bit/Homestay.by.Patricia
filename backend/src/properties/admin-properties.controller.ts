import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser, Roles } from "../common/auth/decorators.js";
import { AuthGuard, RolesGuard } from "../common/auth/guards.js";
import { PageQueryDto } from "../common/page.js";
import { AvailabilityQueryDto, CreateBlockDto, CreatePropertyDto, PropertyImageInput, ReplaceAmenitiesDto, UpdatePropertyDto } from "./dto.js";
import { PropertiesService } from "./properties.service.js";

@ApiTags("admin")
@Controller({ path: "admin/properties", version: "1" })
@UseGuards(AuthGuard, RolesGuard)
@Roles("ADMIN")
export class AdminPropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: "List every stay, including drafts and archived homes" })
  list(@Query() query: PageQueryDto) {
    return this.propertiesService.listAdmin(query.page, query.pageSize);
  }

  @Post()
  @ApiOperation({ summary: "Create a stay" })
  create(@CurrentUser() user: Express.Request["user"], @Body() body: CreatePropertyDto) {
    return this.propertiesService.create(body, user!.id);
  }

  @Get(":idOrSlug/availability")
  @ApiOperation({ summary: "Availability with open requests for host review" })
  availability(@Param("idOrSlug") idOrSlug: string, @Query() query: AvailabilityQueryDto) {
    return this.propertiesService.availability(idOrSlug, query.from, query.to, true);
  }

  @Get(":idOrSlug")
  get(@Param("idOrSlug") idOrSlug: string) {
    return this.propertiesService.getAdmin(idOrSlug);
  }

  @Patch(":idOrSlug")
  update(@Param("idOrSlug") idOrSlug: string, @CurrentUser() user: Express.Request["user"], @Body() body: UpdatePropertyDto) {
    return this.propertiesService.update(idOrSlug, body, user!.id);
  }

  @Delete(":idOrSlug")
  @ApiOperation({ summary: "Archive a stay. Confirmed history is kept." })
  archive(@Param("idOrSlug") idOrSlug: string, @CurrentUser() user: Express.Request["user"]) {
    return this.propertiesService.archive(idOrSlug, user!.id);
  }

  @Post(":idOrSlug/amenities")
  replaceAmenities(
    @Param("idOrSlug") idOrSlug: string,
    @CurrentUser() user: Express.Request["user"],
    @Body() body: ReplaceAmenitiesDto,
  ) {
    return this.propertiesService.replaceAmenityNames(idOrSlug, body.names, user!.id);
  }

  @Post(":idOrSlug/images")
  addImage(@Param("idOrSlug") idOrSlug: string, @CurrentUser() user: Express.Request["user"], @Body() body: PropertyImageInput) {
    return this.propertiesService.addImage(idOrSlug, body, user!.id);
  }

  @Delete(":idOrSlug/images/:imageId")
  removeImage(
    @Param("idOrSlug") idOrSlug: string,
    @Param("imageId") imageId: string,
    @CurrentUser() user: Express.Request["user"],
  ) {
    return this.propertiesService.removeImage(idOrSlug, imageId, user!.id);
  }

  @Post(":idOrSlug/blocks")
  addBlock(@Param("idOrSlug") idOrSlug: string, @CurrentUser() user: Express.Request["user"], @Body() body: CreateBlockDto) {
    return this.propertiesService.addBlock(idOrSlug, body, user!.id);
  }

  @Delete(":idOrSlug/blocks/:date")
  removeBlock(@Param("idOrSlug") idOrSlug: string, @Param("date") date: string, @CurrentUser() user: Express.Request["user"]) {
    return this.propertiesService.removeBlock(idOrSlug, date, user!.id);
  }
}
