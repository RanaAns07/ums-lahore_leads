import {
    IsString,
    IsEmail,
    IsUUID,
    IsEnum,
    IsOptional,
    MinLength,
} from 'class-validator';
import { InquirySource } from '@prisma/client';

export class CreateInquiryDto {
    @IsString()
    @MinLength(2)
    first_name: string;

    @IsString()
    @MinLength(2)
    last_name: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsUUID()
    program_id: string;

    @IsEnum(InquirySource)
    source: InquirySource;
}
