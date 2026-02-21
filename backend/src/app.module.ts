import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './common/prisma.service';
import { PersonModule } from './modules/person/person.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { AcademicModule } from './modules/academic/academic.module';
import { AdmissionsModule } from './modules/admissions/admissions.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { FinanceModule } from './modules/finance/finance.module';
import { InfrastructureModule } from './modules/infrastructure/infrastructure.module';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Feature modules
    PersonModule,
    UserModule,
    AuthModule,
    RbacModule,
    AcademicModule,
    AdmissionsModule,
    EnrollmentModule,
    FinanceModule,
    InfrastructureModule,
  ],
  providers: [
    PrismaService,
  ],
})
export class AppModule { }
