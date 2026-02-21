import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateApplicationDto {
    @IsUUID()
    person_id: string;

    @IsUUID()
    program_id: string;

    @IsString()
    batch_id: string;

    @IsOptional()
    @IsUUID()
    inquiry_id?: string;
}
