import {
    IsNumber,
    IsString,
    IsOptional,
    Min,
} from 'class-validator';

export class RecordPaymentDto {
    @IsNumber()
    @Min(0.01)
    amount_paid: number;

    @IsString()
    payment_method: string;

    @IsOptional()
    @IsString()
    transaction_reference?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
