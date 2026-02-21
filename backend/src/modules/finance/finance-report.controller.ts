import {
    Controller,
    Get,
    Query,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ReportingService } from './reporting.service';
import { LedgerService } from './ledger.service';

/**
 * FinanceReportController provides financial reports for admins
 * All endpoints require finance.admin permission
 */
@Controller('api/v1/finance/reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FinanceReportController {
    constructor(
        private readonly reportingService: ReportingService,
        private readonly ledgerService: LedgerService,
    ) { }

    /**
     * Get general ledger - chronological list of all transactions
     * Shows complete money trail
     * Requires: finance.admin permission
     */
    @Permissions('finance.admin')
    @Get('general-ledger')
    async getGeneralLedger(
        @Query('start_date') startDate?: string,
        @Query('end_date') endDate?: string,
        @Query('fund_id') fundId?: string,
    ) {
        return this.reportingService.getGeneralLedger(
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
            fundId,
        );
    }

    /**
     * Get balance sheet - current fund balances
     * Shows liquid state of all university accounts
     * Requires: finance.admin permission
     */
    @Permissions('finance.admin')
    @Get('fund-balances')
    async getFundBalances() {
        return this.reportingService.getFundBalances();
    }

    /**
     * Get financial summary - total inflows, outflows, net position
     * Requires: finance.admin permission
     */
    @Permissions('finance.admin')
    @Get('summary')
    async getFinancialSummary(
        @Query('start_date') startDate?: string,
        @Query('end_date') endDate?: string,
    ) {
        return this.reportingService.getFinancialSummary(
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
        );
    }

    /**
     * Get transactions by category
     * Requires: finance.admin permission
     */
    @Permissions('finance.admin')
    @Get('by-category')
    async getTransactionsByCategory(
        @Query('category') category: string,
        @Query('start_date') startDate?: string,
        @Query('end_date') endDate?: string,
    ) {
        if (!category) {
            return { error: 'Category parameter is required' };
        }

        return this.reportingService.getTransactionsByCategory(
            category,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
        );
    }

    /**
     * Get fund detail by ID
     * Requires: finance.admin permission
     */
    @Permissions('finance.admin')
    @Get('funds/:id')
    async getFundDetail(@Query('id') id: string) {
        return this.ledgerService.getFundById(id);
    }
}
