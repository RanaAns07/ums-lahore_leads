```typescript
import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Inject,
    forwardRef,
    ConflictException, // Keep ConflictException as it's used later in the file
} from '@nestjs/common';
import { Application, ApplicationStatus } from '@prisma/client';
import { PrismaService } from '../../../common/prisma.service';
import { DocumentService } from '../document/document.service'; // Keep DocumentService import as it might be used elsewhere or intended for future use
import { NotificationService } from '../../infrastructure/services/notification.service';

/**
 * ApplicationService handles application lifecycle and status transitions
 */
@Injectable()
export class ApplicationService {
    constructor(
        private prisma: PrismaService,
        // private documentService: DocumentService, // Removed as per the provided constructor snippet
        @Inject(forwardRef(() => NotificationService))
        private notificationService: NotificationService,
    ) { }

    /**
     * Create a new application
     */
    async create(
        personId: string,
        programId: string,
        batchId: string,
        inquiryId?: string,
    ): Promise<Application> {
        return this.prisma.application.create({
            data: {
                person_id: personId,
                program_id: programId,
                batch_id: batchId,
                inquiry_id: inquiryId,
                status: 'DRAFT',
            },
            include: {
                person: true,
                program: true,
                inquiry: true,
            },
        });
    }

    /**
     * Get application by ID or throw NotFoundException
     */
    async findByIdOrFail(id: string): Promise<Application> {
        const application = await this.prisma.application.findUnique({
            where: { id },
            include: {
                person: true,
                program: true,
                inquiry: true,
                documents: {
                    orderBy: { created_at: 'desc' },
                },
            },
        });

        if (!application) {
            throw new NotFoundException(`Application with ID ${ id } not found`);
        }

        return application;
    }

    /**
     * Find all applications with optional filters
     */
    async findAll(
        status?: ApplicationStatus,
        programId?: string,
        batchId?: string,
    ): Promise<Application[]> {
        return this.prisma.application.findMany({
            where: {
                ...(status && { status }),
                ...(programId && { program_id: programId }),
                ...(batchId && { batch_id: batchId }),
            },
            include: {
                person: true,
                program: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }

    /**
     * Update application status with validation
     * 
     * BUSINESS RULES:
     * - SUBMITTED: Set submitted_at timestamp
     * - ACCEPTED/REJECTED: Validate documents and set reviewed_at
     * - ACCEPTED: Requires at least 2 approved documents
     */
    async updateStatus(
        applicationId: string,
        newStatus: ApplicationStatus,
    ): Promise<Application> {
        const application = await this.findByIdOrFail(applicationId);
        const oldStatus = application.status;

        // Don't update if status is the same
        if (oldStatus === newStatus) {
            return application;
        }

        // Validate status transitions
        this.validateStatusTransition(oldStatus, newStatus);

        // Special validation for ACCEPTED status
        if (newStatus === 'ACCEPTED') {
            await this.validateAcceptance(applicationId);
        }

        // Build update data
        const updateData: {
            status: ApplicationStatus;
            submitted_at?: Date;
            reviewed_at?: Date;
        } = {
            status: newStatus,
        };

        // Set submitted_at when moving to SUBMITTED
        if (newStatus === 'SUBMITTED' && !application.submitted_at) {
            updateData.submitted_at = new Date();
        }

        // Set reviewed_at when moving to final statuses
        if (
            (newStatus === 'ACCEPTED' ||
                newStatus === 'REJECTED' ||
                newStatus === 'WAITLISTED') &&
            !application.reviewed_at
        ) {
            updateData.reviewed_at = new Date();
        }

        // Update application
        const updated = await this.prisma.application.update({
            where: { id: applicationId },
            data: updateData,
            include: {
                person: true,
                program: true,
                documents: true,
            },
        });

        // Placeholder for Phase 4: Trigger enrollment process if ACCEPTED
        if (newStatus === 'ACCEPTED') {
            console.log(
                `📋 Application ${ applicationId } ACCEPTED.Enrollment process will be triggered in Phase 4.`,
            );
            // TODO: Phase 4 - Create Enrollment record
            // await this.enrollmentService.createFromApplication(updated);
        }

        return updated;
    }

    /**
     * Validate status transitions to prevent invalid state changes
     */
    private validateStatusTransition(
        oldStatus: ApplicationStatus,
        newStatus: ApplicationStatus,
    ): void {
        // Cannot change status after final decisions
        const finalStatuses: ApplicationStatus[] = ['ACCEPTED', 'REJECTED'];
        if (finalStatuses.includes(oldStatus)) {
            throw new ConflictException(
                `Cannot change status from ${ oldStatus }. Application has been finalized.`,
            );
        }

        // DRAFT can only move to SUBMITTED
        if (oldStatus === 'DRAFT' && newStatus !== 'SUBMITTED') {
            throw new BadRequestException(
                'Draft applications must be submitted before review',
            );
        }

        // Cannot go back to DRAFT
        if (newStatus === 'DRAFT' && oldStatus !== 'DRAFT') {
            throw new BadRequestException('Cannot move application back to DRAFT');
        }
    }

    /**
     * Validate that application meets requirements for ACCEPTED status
     * 
     * CRITICAL BUSINESS RULE:
     * - At least 2 ApplicationDocument records must exist
     * - Documents must be in APPROVED status
     * 
     * @throws ConflictException if requirements not met
     */
    private async validateAcceptance(applicationId: string): Promise<void> {
        const documentCount = await this.prisma.applicationDocument.count({
            where: {
                application_id: applicationId,
                status: 'APPROVED',
            },
        });

        if (documentCount < 2) {
            throw new ConflictException(
                `Cannot accept application.At least 2 approved documents required.Found ${ documentCount }.`,
            );
        }
    }

    /**
     * Submit application (move from DRAFT to SUBMITTED)
     */
    async submit(applicationId: string): Promise<Application> {
        return this.updateStatus(applicationId, 'SUBMITTED');
    }

    /**
     * Move application to under review
     */
    async moveToReview(applicationId: string): Promise<Application> {
        return this.updateStatus(applicationId, 'UNDER_REVIEW');
    }

    /**
   * Accept an application
   * Validates minimum required documents
   */
  async acceptApplication(id: string): Promise<Application> {
    // Validate has minimum 3 approved documents
    const approvedCount =
      await this.documentService.countApprovedDocuments(id);

    if (approvedCount < 3) {
      throw new BadRequestException(
        `Cannot accept application: Only ${ approvedCount }/3 required documents approved`,
      );
    }

const application = await this.updateStatus(id, 'ACCEPTED');

// Send acceptance email
try {
    const applicant = await this.prisma.application.findUnique({
        where: { id },
        include: {
            person: true,
            program: true,
        },
    });

    if (applicant && applicant.person.email) {
        await this.notificationService.sendApplicationAcceptedEmail(
            applicant.person.email,
            applicant.person.legal_name,
            applicant.program.name,
        );

        console.log(
            `📧 Acceptance email sent to: ${applicant.person.email}`,
        );
    }
} catch (emailError) {
    console.error(
        `⚠️ Failed to send acceptance email:`,
        emailError.message,
    );
    // Don't fail the acceptance if email fails
}

return application;
  }

    /**
     * Reject application
     */
    async reject(applicationId: string): Promise < Application > {
    return this.updateStatus(applicationId, 'REJECTED');
}

    /**
     * Move application to waitlist
     */
    async waitlist(applicationId: string): Promise < Application > {
    return this.updateStatus(applicationId, 'WAITLISTED');
}
}
