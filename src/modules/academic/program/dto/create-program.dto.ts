import {
    IsString,
    IsUUID,
    IsInt,
    Min,
    MinLength,
    MaxLength,
} from 'class-validator';

export class CreateProgramDto {
    @IsString()
    @MinLength(2)
    name: string;

    @IsString()
    @MinLength(2)
    @MaxLength(10)
    code: string;

    @IsInt()
    @Min(1)
    duration_semesters: number;

    @IsUUID()
    department_id: string;
}
