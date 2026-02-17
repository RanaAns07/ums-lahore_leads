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
import { BillingService } from './billing.service';
import { GenerateInvoiceDto } from './dto/generate-invoice.dto';

/**
 * BillingController handles invoice management
 */
@Controller('api/v1/finance/billing')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BillingController {
    constructor(private readonly billingService: BillingService) { }

    /**
     * Generate semester invoice for enrollment
     * Requires: finance.write permission
     */
    @Permissions('finance.write')
    @Post('generate-invoice')
    async generateInvoice(@Body() generateInvoiceDto: GenerateInvoiceDto) {
        return this.billingService.generateSemesterInvoice(
            generateInvoiceDto.enrollment_id,
        );
    }

    /**
     * Get all invoices
     * Requires: finance.read permission
     */
    @Permissions('finance.read')
    @Get('invoices')
    async findAll(@Query('status') status?: string) {
        return this.billingService.findAll(status);
    }

    /**
     * Get invoice by ID
     * Requires: finance.read permission
     */
    @Permissions('finance.read')
    @Get('invoices/:id')
    async findOne(@Param('id') id: string) {
        return this.billingService.findByIdOrFail(id);
    }

    /**
     * Get invoices for an enrollment
     * Requires: finance.read permission
     */
    @Permissions('finance.read')
    @Get('enrollments/:enrollmentId/invoices')
    async findByEnrollment(@Param('enrollmentId') enrollmentId: string) {
        return this.billingService.findByEnrollmentId(enrollmentId);
    }
}
