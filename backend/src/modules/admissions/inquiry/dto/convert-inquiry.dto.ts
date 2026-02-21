import { IsUUID, IsString } from 'class-validator';

export class ConvertInquiryDto {
    @IsUUID()
    program_id: string;

    @IsString()
    batch_id: string;
}
