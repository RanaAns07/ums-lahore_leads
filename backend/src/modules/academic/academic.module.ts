import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { RbacModule } from '../rbac/rbac.module';

// Department
import { DepartmentService } from './department/department.service';
import { DepartmentController } from './department/department.controller';

// Program
import { ProgramService } from './program/program.service';
import { ProgramController } from './program/program.controller';

// Course
import { CourseService } from './course/course.service';
import { CourseController } from './course/course.controller';

// Semester
import { SemesterService } from './semester/semester.service';
import { SemesterController } from './semester/semester.controller';

// Course Offering
import { OfferingService } from './offering/offering.service';
import { OfferingController } from './offering/offering.controller';

@Module({
    imports: [RbacModule],
    controllers: [
        DepartmentController,
        ProgramController,
        CourseController,
        SemesterController,
        OfferingController,
    ],
    providers: [
        PrismaService,
        DepartmentService,
        ProgramService,
        CourseService,
        SemesterService,
        OfferingService,
    ],
    exports: [
        DepartmentService,
        ProgramService,
        CourseService,
        SemesterService,
        OfferingService,
    ],
})
export class AcademicModule { }
