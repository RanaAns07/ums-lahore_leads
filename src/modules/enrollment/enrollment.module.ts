import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { RbacModule } from '../rbac/rbac.module';
import { AdmissionsModule } from '../admissions/admissions.module';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';
import { StudentIdGenerator } from './utils/student-id.generator';

/**
 * EnrollmentModule handles student enrollment and course registration
 * 
 * Imports:
 * - AdmissionsModule: For ApplicationService to verify ACCEPTED status
 */
@Module({
    imports: [RbacModule, AdmissionsModule],
    controllers: [EnrollmentController],
    providers: [PrismaService, EnrollmentService, StudentIdGenerator],
    exports: [EnrollmentService], // For future modules
})
export class EnrollmentModule { }
