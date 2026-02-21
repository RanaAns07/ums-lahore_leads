import {
    IsString,
    IsDate,
    IsEnum,
    IsOptional,
    MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '@prisma/client';

export class CreatePersonDto {
    @IsString()
    @MinLength(2)
    legal_name: string;

    @IsDate()
    @Type(() => Date)
    date_of_birth: Date;

    @IsEnum(Gender)
    gender: Gender;

    @IsOptional()
    @IsString()
    nationality?: string;
}
