import { Module, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { RbacModule } from '../rbac/rbac.module';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

// Services
import { InquiryService } from './inquiry/inquiry.service';
import { InquiryNoteService } from './inquiry-note/inquiry-note.service';
import { ApplicationService } from './application/application.service';
import { DocumentService } from './document/document.service';

// Controllers
import { InquiryController } from './inquiry/inquiry.controller';
import { ApplicationController } from './application/application.controller';
import { DocumentController } from './document/document.controller';

/**
 * AdmissionsModule handles inquiries and applications
 * Exports ApplicationService for Phase 4 (Enrollment)
 */
@Module({
    imports: [RbacModule, forwardRef(() => InfrastructureModule)],
    controllers: [InquiryController, ApplicationController, DocumentController],
    providers: [
        PrismaService,
        InquiryService,
        InquiryNoteService,
        ApplicationService,
        DocumentService,
    ],
    exports: [
        ApplicationService, // Exported for Phase 4 Enrollment module
    ],
})
export class AdmissionsModule { }
