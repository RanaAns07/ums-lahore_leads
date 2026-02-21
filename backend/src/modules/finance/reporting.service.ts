import { Injectable } from '@nestjs/common';
import { FinancialTransaction, Fund } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';

/**
 * ReportingService provides financial reports and analytics
 */
@Injectable()
export class ReportingService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get general ledger - chronological list of ALL transactions
     * Shows complete money trail: where it came from -> where it went
     * 
     * @param startDate Optional start date filter
     * @param endDate Optional end date filter
     * @param fundId Optional fund filter
     * @returns Transactions with fund details
     */
    async getGeneralLedger(
        startDate?: Date,
        endDate?: Date,
        fundId?: string,
    ): Promise<FinancialTransaction[]> {
        return this.prisma.financialTransaction.findMany({
            where: {
                ...(fundId && { fund_id: fundId }),
                ...(startDate && {
                    created_at: {
                        gte: startDate,
                    },
                }),
                ...(endDate && {
                    created_at: {
                        lte: endDate,
                    },
                }),
            },
            include: {
                fund: true,
            },
            orderBy: {
                created_at: 'desc',
            },
        });
    }

    /**
     * Get all fund balances - current liquid state of university accounts
     * 
     * @returns All funds with current balances
     */
    async getFundBalances(): Promise<Fund[]> {
        return this.prisma.fund.findMany({
            orderBy: {
                name: 'asc',
            },
        });
    }

    /**
     * Get financial summary
     * Total inflows, outflows, and net position
     */
    async getFinancialSummary(startDate?: Date, endDate?: Date): Promise<{
        totalInflows: number;
        totalOutflows: number;
        netPosition: number;
        fundBalances: { [fundName: string]: number };
    }> {
        const transactions = await this.prisma.financialTransaction.findMany({
            where: {
                ...(startDate && {
                    created_at: {
                        gte: startDate,
                    },
                }),
                ...(endDate && {
                    created_at: {
                        lte: endDate,
                    },
                }),
            },
        });

        const inflows = transactions
            .filter((t) => t.type === 'INFLOW')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const outflows = transactions
            .filter((t) => t.type === 'OUTFLOW')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const funds = await this.getFundBalances();
        const fundBalances = funds.reduce(
            (acc, fund) => {
                acc[fund.name] = Number(fund.balance);
                return acc;
            },
            {} as { [key: string]: number },
        );

        return {
            totalInflows: inflows,
            totalOutflows: outflows,
            netPosition: inflows - outflows,
            fundBalances,
        };
    }

    /**
     * Get transactions by category
     * Useful for expense categorization reports
     */
    async getTransactionsByCategory(
        category: string,
        startDate?: Date,
        endDate?: Date,
    ): Promise<FinancialTransaction[]> {
        return this.prisma.financialTransaction.findMany({
            where: {
                category,
                ...(startDate && {
                    created_at: {
                        gte: startDate,
                    },
                }),
                ...(endDate && {
                    created_at: {
                        lte: endDate,
                    },
                }),
            },
            include: {
                fund: true,
            },
            orderBy: {
                created_at: 'desc',
            },
        });
    }
}
