import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class SkillQueriesDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    searchName: string;
}