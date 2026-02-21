import {
    IsUUID,
    IsString,
    IsInt,
    IsOptional,
    Min,
    MinLength,
    MaxLength,
} from 'class-validator';

export class CreateOfferingDto {
    @IsUUID()
    course_id: string;

    @IsUUID()
    semester_id: string;

    @IsOptional()
    @IsUUID()
    instructor_id?: string;

    @IsString()
    @MinLength(1)
    @MaxLength(10)
    section_code: string;

    @IsInt()
    @Min(1)
    capacity: number;
}
