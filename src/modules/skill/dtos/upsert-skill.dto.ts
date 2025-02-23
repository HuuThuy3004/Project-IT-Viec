import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

// Upsert = update + insert
export class UpsertSkillDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;
}
