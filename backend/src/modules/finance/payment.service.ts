import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { Payment, InvoiceStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { BillingService } from './billing.service';
import { EnrollmentService } from '../enrollment/enrollment.service';
import { LedgerService } from './ledger.service';

/**
 * PaymentService handles payment processing and invoice status updates
 * 
 * Key features:
 * - Activates enrollment when invoice is fully paid
 * - Records inflow in General Ledger automatically
 */
@Injectable()
export class PaymentService {
    constructor(
        private prisma: PrismaService,
        private billingService: BillingService,
        private enrollmentService: EnrollmentService,
        private ledgerService: LedgerService,
    ) { }

    /**
     * Record payment for an invoice
     * 
     * TRANSACTIONAL LOGIC:
     * 1. Create Payment record
     * 2. Update Invoice paid_amount and status
     * 3. If Invoice is PAID and Enrollment is PROVISIONED, activate enrollment
     * 4. Record inflow in General Ledger (TUITION_POOL fund)
     * 
     * @returns Payment record with updated invoice
     */
    async recordPayment(
        invoiceId: string,
        amountPaid: number,
        paymentMethod: string,
        transactionReference?: string,
        notes?: string,
    ): Promise<Payment> {
        const invoice = await this.billingService.findByIdOrFail(invoiceId);

        // Validate payment amount
        if (amountPaid <= 0) {
            throw new BadRequestException('Payment amount must be greater than zero');
        }

        const remainingAmount = Number(invoice.total_amount) - Number(invoice.paid_amount);

        if (amountPaid > remainingAmount) {
            throw new BadRequestException(
                `Payment amount ($${amountPaid}) exceeds remaining balance ($${remainingAmount})`,
            );
        }

        // Validate invoice status
        if (invoice.status === 'VOID') {
            throw new BadRequestException('Cannot pay a voided invoice');
        }

        if (invoice.status === 'PAID') {
            throw new BadRequestException('Invoice is already fully paid');
        }

        // Process payment in transaction
        return this.prisma.$transaction(async (tx) => {
            // 1. Create payment record
            const payment = await tx.payment.create({
                data: {
                    invoice_id: invoiceId,
                    amount_paid: amountPaid,
                    payment_method: paymentMethod,
                    transaction_reference: transactionReference,
                    status: 'SUCCESS',
                    notes,
                },
            });

            // 2. Update invoice
            const newPaidAmount = Number(invoice.paid_amount) + amountPaid;
            const newStatus: InvoiceStatus =
                newPaidAmount >= Number(invoice.total_amount)
                    ? 'PAID'
                    : 'PARTIAL';

            const updatedInvoice = await tx.invoice.update({
                where: { id: invoiceId },
                data: {
                    paid_amount: newPaidAmount,
                    status: newStatus,
                },
                include: {
                    enrollment: true,
                },
            });

            console.log(
                `💳 Payment recorded: $${amountPaid} for invoice ${invoiceId} (Status: ${newStatus})`,
            );

            // 3. Activate enrollment if invoice is fully paid and enrollment is provisioned
            if (
                newStatus === 'PAID' &&
                updatedInvoice.enrollment.status === 'PROVISIONED'
            ) {
                await this.enrollmentService.activateEnrollment(
                    updatedInvoice.enrollment_id,
                );

                console.log(
                    `🎓 Enrollment auto-activated after full payment: ${updatedInvoice.enrollment_id}`,
                );
            }

            // 4. Record inflow in General Ledger
            // Find or create TUITION_POOL fund
            try {
                const tuitionFund = await this.ledgerService.getFundByName('TUITION_POOL');

                await this.ledgerService.recordInflow(
                    amountPaid,
                    tuitionFund.id,
                    'STUDENT_PAYMENT',
                    `Student payment for invoice ${invoiceId} via ${paymentMethod}`,
                    payment.id,
                    'Payment',
                );

                console.log(
                    `📊 Ledger updated: $${amountPaid} inflow to TUITION_POOL`,
                );
            } catch (error) {
                console.warn(
                    `⚠️ Could not record ledger inflow: ${error.message}. Ensure TUITION_POOL fund exists.`,
                );
            }

            return payment;
        });
    }

    /**
     * Get payment by ID or throw NotFoundException
     */
    async findByIdOrFail(id: string): Promise<Payment> {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
            include: {
                invoice: {
                    include: {
                        enrollment: {
                            include: {
                                student_profile: {
                                    include: {
                                        person: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!payment) {
            throw new NotFoundException(`Payment with ID ${id} not found`);
        }

        return payment;
    }

    /**
     * Get all payments for an invoice
     */
    async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
        return this.prisma.payment.findMany({
            where: { invoice_id: invoiceId },
            orderBy: { created_at: 'desc' },
        });
    }

    /**
     * Find all payments (admin view)
     */
    async findAll(status?: string): Promise<Payment[]> {
        return this.prisma.payment.findMany({
            where: status ? { status: status as any } : undefined,
            include: {
                invoice: {
                    include: {
                        enrollment: {
                            include: {
                                student_profile: {
                                    include: {
                                        person: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }
}
