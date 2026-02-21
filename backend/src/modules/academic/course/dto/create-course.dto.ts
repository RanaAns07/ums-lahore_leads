import {
    IsString,
    IsUUID,
    IsInt,
    Min,
    MinLength,
    MaxLength,
} from 'class-validator';

export class CreateCourseDto {
    @IsString()
    @MinLength(2)
    name: string;

    @IsString()
    @MinLength(2)
    @MaxLength(15)
    code: string;

    @IsInt()
    @Min(1)
    credit_hours: number;

    @IsUUID()
    department_id: string;
}
