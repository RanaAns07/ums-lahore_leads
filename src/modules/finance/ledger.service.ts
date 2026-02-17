import {
    Injectable,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { Fund, FinancialTransaction, TransactionType } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';

/**
 * LedgerService manages university funds and financial transactions
 * 
 * Key principles:
 * - All transactions are IMMUTABLE (no updates/deletes)
 * - Fund balances updated atomically with transaction creation
 * - Insufficient funds validation for outflows
 */
@Injectable()
export class LedgerService {
    constructor(private prisma: PrismaService) { }

    /**
     * Record inflow (money coming in)
     * 
     * TRANSACTIONAL LOGIC:
     * 1. Increment fund balance
     * 2. Create INFLOW transaction record
     * 
     * @param amount Amount to add
     * @param fundId Fund to credit
     * @param category Transaction category (e.g., "STUDENT_PAYMENT")
     * @param referenceId Optional reference (e.g., Invoice ID)
     * @param referenceType Reference type (e.g., "Invoice")
     * @param description Human-readable description
     * @returns Created transaction
     */
    async recordInflow(
        amount: number,
        fundId: string,
        category: string,
        description: string,
        referenceId?: string,
        referenceType?: string,
    ): Promise<FinancialTransaction> {
        if (amount <= 0) {
            throw new BadRequestException('Inflow amount must be greater than zero');
        }

        return this.prisma.$transaction(async (tx) => {
            // 1. Increment fund balance
            const fund = await tx.fund.update({
                where: { id: fundId },
                data: {
                    balance: {
                        increment: amount,
                    },
                },
            });

            // 2. Create transaction record
            const transaction = await tx.financialTransaction.create({
                data: {
                    type: 'INFLOW',
                    fund_id: fundId,
                    amount,
                    category,
                    reference_id: referenceId,
                    reference_type: referenceType,
                    description,
                },
                include: {
                    fund: true,
                },
            });

            console.log(
                `💰 INFLOW: +$${amount} → ${fund.name} (New balance: $${fund.balance})`,
            );

            return transaction;
        });
    }

    /**
     * Record outflow (money going out)
     * 
     * TRANSACTIONAL LOGIC:
     * 1. Validate sufficient funds
     * 2. Decrement fund balance
     * 3. Create OUTFLOW transaction record
     * 
     * @throws ConflictException if insufficient funds
     */
    async recordOutflow(
        amount: number,
        fundId: string,
        category: string,
        description: string,
        referenceId?: string,
        referenceType?: string,
    ): Promise<FinancialTransaction> {
        if (amount <= 0) {
            throw new BadRequestException('Outflow amount must be greater than zero');
        }

        return this.prisma.$transaction(async (tx) => {
            // 1. Get current fund balance
            const fund = await tx.fund.findUnique({
                where: { id: fundId },
            });

            if (!fund) {
                throw new BadRequestException(`Fund ${fundId} not found`);
            }

            // 2. Validate sufficient funds
            if (Number(fund.balance) < amount) {
                throw new ConflictException(
                    `Insufficient funds in ${fund.name}. Available: $${fund.balance}, Required: $${amount}`,
                );
            }

            // 3. Decrement fund balance
            const updatedFund = await tx.fund.update({
                where: { id: fundId },
                data: {
                    balance: {
                        decrement: amount,
                    },
                },
            });

            // 4. Create transaction record
            const transaction = await tx.financialTransaction.create({
                data: {
                    type: 'OUTFLOW',
                    fund_id: fundId,
                    amount,
                    category,
                    reference_id: referenceId,
                    reference_type: referenceType,
                    description,
                },
                include: {
                    fund: true,
                },
            });

            console.log(
                `💸 OUTFLOW: -$${amount} ← ${updatedFund.name} (New balance: $${updatedFund.balance})`,
            );

            return transaction;
        });
    }

    /**
     * Create manual adjustment transaction
     * Used for corrections without reference
     */
    async recordAdjustment(
        type: TransactionType,
        amount: number,
        fundId: string,
        description: string,
    ): Promise<FinancialTransaction> {
        if (type === 'INFLOW') {
            return this.recordInflow(
                amount,
                fundId,
                'ADJUSTMENT',
                description,
                null,
                'Adjustment',
            );
        } else {
            return this.recordOutflow(
                amount,
                fundId,
                'ADJUSTMENT',
                description,
                null,
                'Adjustment',
            );
        }
    }

    /**
     * Get fund by ID
     */
    async getFundById(id: string): Promise<Fund> {
        const fund = await this.prisma.fund.findUnique({
            where: { id },
            include: {
                transactions: {
                    orderBy: { created_at: 'desc' },
                    take: 100, // Latest 100 transactions
                },
            },
        });

        if (!fund) {
            throw new BadRequestException(`Fund ${id} not found`);
        }

        return fund;
    }

    /**
     * Get fund by name
     */
    async getFundByName(name: string): Promise<Fund> {
        const fund = await this.prisma.fund.findUnique({
            where: { name },
        });

        if (!fund) {
            throw new BadRequestException(`Fund "${name}" not found`);
        }

        return fund;
    }

    /**
     * Create new fund
     */
    async createFund(
        name: string,
        initialBalance: number = 0,
        description?: string,
    ): Promise<Fund> {
        return this.prisma.fund.create({
            data: {
                name,
                balance: initialBalance,
                description,
            },
        });
    }
}
