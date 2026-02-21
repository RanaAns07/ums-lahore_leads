import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PaymentService } from './payment.service';
import { RecordPaymentDto } from './dto/record-payment.dto';

/**
 * PaymentController handles payment recording and tracking
 */
@Controller('api/v1/finance/payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    /**
     * Record payment for an invoice
     * Auto-activates enrollment if invoice is fully paid
     * Requires: finance.write permission
     */
    @Permissions('finance.write')
    @Post('invoices/:invoiceId/pay')
    async recordPayment(
        @Param('invoiceId') invoiceId: string,
        @Body() recordPaymentDto: RecordPaymentDto,
    ) {
        return this.paymentService.recordPayment(
            invoiceId,
            recordPaymentDto.amount_paid,
            recordPaymentDto.payment_method,
            recordPaymentDto.transaction_reference,
            recordPaymentDto.notes,
        );
    }

    /**
     * Get all payments
     * Requires: finance.read permission
     */
    @Permissions('finance.read')
    @Get()
    async findAll(@Query('status') status?: string) {
        return this.paymentService.findAll(status);
    }

    /**
     * Get payment by ID
     * Requires: finance.read permission
     */
    @Permissions('finance.read')
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.paymentService.findByIdOrFail(id);
    }

    /**
     * Get payments for an invoice
     * Requires: finance.read permission
     */
    @Permissions('finance.read')
    @Get('invoices/:invoiceId/payments')
    async findByInvoice(@Param('invoiceId') invoiceId: string) {
        return this.paymentService.findByInvoiceId(invoiceId);
    }
}
