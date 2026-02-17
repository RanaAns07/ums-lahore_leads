```typescript
import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Inject,
    forwardRef,
} from '@nestjs/common';
import { Invoice, FeeType } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { EnrollmentService } from '../enrollment/enrollment.service';
import { NotificationService } from '../infrastructure/services/notification.service';

/**
 * BillingService handles invoice generation and management
 */
@Injectable()
export class BillingService {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => NotificationService))
        private notificationService: NotificationService,
        private enrollmentService: EnrollmentService,
    ) { }

    /**
     * Generate semester invoice for an enrollment
     * 
     * BUSINESS LOGIC:
     * 1. Look up FeeStructure for the program/semester
     * 2. Create Invoice with InvoiceItems
     * 3. Set due date (default: 30 days from creation)
     * 
     * @returns Invoice with related items
     */
    async generateSemesterInvoice(enrollmentId: string): Promise<Invoice> {
        const enrollment = await this.enrollmentService.findByIdOrFail(enrollmentId);

        // Check if invoice already exists for this enrollment
        const existingInvoice = await this.prisma.invoice.findFirst({
            where: { enrollment_id: enrollmentId },
        });

        if (existingInvoice) {
            throw new ConflictException(
                `Invoice already exists for this enrollment: ${ existingInvoice.id } `,
            );
        }

        // Look up fee structures for this program and semester
        const feeStructures = await this.prisma.feeStructure.findMany({
            where: {
                program_id: enrollment.program_id,
                semester_id: enrollment.semester_id,
            },
        });

        if (feeStructures.length === 0) {
            throw new NotFoundException(
                `No fee structures found for program ${ enrollment.program.code } in semester ${ enrollment.semester.code } `,
            );
        }

        // Calculate total amount
        const totalAmount = feeStructures.reduce(
            (sum, fee) => sum + Number(fee.amount),
            0,
        );

        // Set due date (30 days from now)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);

        // Create invoice with items in transaction
        return this.prisma.$transaction(async (tx) => {
            // Create invoice
            const invoice = await tx.invoice.create({
                data: {
                    enrollment_id: enrollmentId,
                    total_amount: totalAmount,
                    due_date: dueDate,
                    status: 'UNPAID',
                },
            });

            // Create invoice items
            const itemsData = feeStructures.map((fee) => ({
                invoice_id: invoice.id,
                fee_type: fee.fee_type,
                amount: fee.amount,
                description: fee.description || `${ fee.fee_type } Fee`,
            }));

            await tx.invoiceItem.createMany({
                data: itemsData,
            });

            // Return invoice with items
            const completeInvoice = await tx.invoice.findUnique({
                where: { id: invoice.id },
                include: {
                    items: true,
                    enrollment: {
                        include: {
                            student_profile: {
                                include: {
                                    person: true,
                                },
                            },
                            program: true,
                        },
                    },
                },
            });

            console.log(
                `💰 Invoice generated: ${ invoice.id } for ${ enrollment.student_profile.student_id_number } - $${ totalAmount }`,
            );

            return completeInvoice;
        });
    }

    /**
     * Get invoice by ID or throw NotFoundException
     */
    async findByIdOrFail(id: string): Promise<Invoice> {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: {
                items: true,
                payments: {
                    orderBy: { created_at: 'desc' },
                },
                enrollment: {
                    include: {
                        student_profile: {
                            include: {
                                person: true,
                            },
                        },
                        program: true,
                    },
                },
            },
        });

        if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${ id } not found`);
        }

        return invoice;
    }

    /**
     * Find all invoices for an enrollment
     */
    async findByEnrollmentId(enrollmentId: string): Promise<Invoice[]> {
        return this.prisma.invoice.findMany({
            where: { enrollment_id: enrollmentId },
            include: {
                items: true,
                payments: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }

    /**
     * Find all invoices (admin view)
     */
    async findAll(status?: string): Promise<Invoice[]> {
        return this.prisma.invoice.findMany({
            where: status ? { status: status as any } : undefined,
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
                items: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }
}
