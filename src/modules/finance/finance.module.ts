import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { RbacModule } from '../rbac/rbac.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { BillingService } from './billing.service';
import { PaymentService } from './payment.service';
import { LedgerService } from './ledger.service';
import { ReportingService } from './reporting.service';
import { BillingController } from './billing.controller';
import { PaymentController } from './payment.controller';
import { FinanceReportController } from './finance-report.controller';

/**
 * FinanceModule handles billing, payments, and general ledger
 * 
 * Key Integration:
 * - Imports EnrollmentModule to activate enrollments on payment
 * - Auto-records inflows to TUITION_POOL fund on payment success
 */
@Module({
    imports: [RbacModule, EnrollmentModule],
    controllers: [BillingController, PaymentController, FinanceReportController],
    providers: [
        PrismaService,
        BillingService,
        PaymentService,
        LedgerService,
        ReportingService,
    ],
    exports: [BillingService, PaymentService, LedgerService, ReportingService],
})
export class FinanceModule { }
