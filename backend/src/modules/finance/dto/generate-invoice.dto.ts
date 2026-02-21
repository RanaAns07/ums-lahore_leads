import { IsUUID } from 'class-validator';

export class GenerateInvoiceDto {
    @IsUUID()
    enrollment_id: string;
}
