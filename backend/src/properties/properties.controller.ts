import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";
import { PageQueryDto } from "../common/page.js";
import { AvailabilityQueryDto } from "./dto.js";
import { PropertiesService } from "./properties.service.js";

class PropertyListQuery extends PageQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  q?: string;
}

@ApiTags("properties")
@Controller({ path: "properties", version: "1" })
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: "List published stays" })
  list(@Query() query: PropertyListQuery) {
    return this.propertiesService.listPublic(query.page, query.pageSize, query.q);
  }

  @Get(":idOrSlug/availability")
  @ApiOperation({ summary: "Nights blocked by confirmed stays or the host" })
  availability(@Param("idOrSlug") idOrSlug: string, @Query() query: AvailabilityQueryDto) {
    return this.propertiesService.availability(idOrSlug, query.from, query.to, false);
  }

  @Get(":idOrSlug")
  @ApiOperation({ summary: "Load one published stay" })
  get(@Param("idOrSlug") idOrSlug: string) {
    return this.propertiesService.getPublic(idOrSlug);
  }
}
