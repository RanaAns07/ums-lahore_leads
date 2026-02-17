import { IsString, IsNumber, IsOptional } from 'class-validator';

export class WebhookPaymentDto {
    @IsString()
    provider: string; // 'stripe', 'paypal', etc.

    @IsString()
    transaction_id: string;

    @IsString()
    invoice_reference: string; // Maps to our Invoice ID

    @IsNumber()
    amount: number;

    @IsString()
    payment_method: string;

    @IsString()
    status: string; // 'success', 'failed', etc.

    @IsOptional()
    @IsString()
    signature?: string; // HMAC signature for verification
}
