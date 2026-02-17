import {
    IsString,
    IsDate,
    IsBoolean,
    IsOptional,
    MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSemesterDto {
    @IsString()
    @MinLength(2)
    name: string;

    @IsDate()
    @Type(() => Date)
    start_date: Date;

    @IsDate()
    @Type(() => Date)
    end_date: Date;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}
