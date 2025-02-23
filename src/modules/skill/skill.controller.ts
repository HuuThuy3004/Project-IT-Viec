import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { SkillService } from "./skill.service";
import { UpsertSkillDto } from "./dtos/upsert-skill.dto";
import { Public } from "src/commons/decorators/public.decorator";
import { Roles } from "src/commons/decorators/roles.decorator";
import { ROLE } from "src/commons/enums/user.enum";
import { ApiBearerAuth } from "@nestjs/swagger";
import { UpdateSkillDto } from "./dtos/update-skill.dto";
import { SkillQueriesDto } from "./dtos/skill-query.dto";

@ApiBearerAuth()
@Controller('skill')
export class SkillController {
    constructor(private readonly skillService: SkillService) {}
    // CRUD - CREATE READ UPDATE DELETE
    // This api for ADMIN
    @Roles(ROLE.ADMIN) // Admin just use
    @Post('/create')
    async createSkill(@Body() upsertSkillDto: UpsertSkillDto) {
        return await this.skillService.create(upsertSkillDto);
    }

    @Public()
    @Get('/:id')
    async getSkill(@Param('id', ParseIntPipe) id: number) {
        return await this.skillService.get(id);
    }
    @Public()
    @Get()
    async getAllSkill(@Query() queries: SkillQueriesDto) {
        return await this.skillService.getAll(queries);
    }

    @Roles(ROLE.ADMIN)
    @Put('/update/:id')
    async updateSkill(@Param('id', ParseIntPipe) id: number, @Body() updateSkillDto: UpdateSkillDto) {
        return this.skillService.update(id, updateSkillDto);
    }

    @Roles(ROLE.ADMIN)
    @Delete('/delete/:id')
    async deleteSkill(@Param('id', ParseIntPipe) id: number) {
        return this.skillService.delete(id);
    }
}