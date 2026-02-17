import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { Inquiry, InquiryStatus, Application } from '@prisma/client';
import { PrismaService } from '../../../common/prisma.service';
import { InquiryNoteService } from '../inquiry-note/inquiry-note.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';

/**
 * InquiryService handles lead capture and inquiry management
 * with automatic interaction history tracking
 */
@Injectable()
export class InquiryService {
    constructor(
        private prisma: PrismaService,
        private inquiryNoteService: InquiryNoteService,
    ) { }

    /**
     * Create a new inquiry (PUBLIC endpoint - website leads)
     */
    async createInquiry(dto: CreateInquiryDto): Promise<Inquiry> {
        // Check for duplicate email
        const existing = await this.prisma.inquiry.findUnique({
            where: { email: dto.email },
        });

        if (existing) {
            throw new ConflictException(
                `An inquiry with email ${dto.email} already exists`,
            );
        }

        return this.prisma.inquiry.create({
            data: {
                first_name: dto.first_name,
                last_name: dto.last_name,
                email: dto.email,
                phone: dto.phone,
                program_id: dto.program_id,
                source: dto.source,
                status: 'NEW',
            },
            include: {
                program: true,
            },
        });
    }

    /**
     * Get inquiry by ID or throw NotFoundException
     */
    async findByIdOrFail(id: string): Promise<Inquiry> {
        const inquiry = await this.prisma.inquiry.findUnique({
            where: { id },
            include: {
                program: true,
                notes: {
                    orderBy: { created_at: 'desc' },
                    include: {
                        actor: {
                            select: {
                                id: true,
                                legal_name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!inquiry) {
            throw new NotFoundException(`Inquiry with ID ${id} not found`);
        }

        return inquiry;
    }

    /**
     * Find all inquiries with optional filters
     */
    async findAll(status?: InquiryStatus, programId?: string): Promise<Inquiry[]> {
        return this.prisma.inquiry.findMany({
            where: {
                ...(status && { status }),
                ...(programId && { program_id: programId }),
            },
            include: {
                program: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }

    /**
     * Update inquiry status with automatic note creation
     * 
     * BUSINESS LOGIC: Every status change creates a system-generated InquiryNote
     * for complete audit trail
     */
    async updateStatus(
        inquiryId: string,
        newStatus: InquiryStatus,
        actorId: string,
    ): Promise<Inquiry> {
        const inquiry = await this.findByIdOrFail(inquiryId);
        const oldStatus = inquiry.status;

        // Don't update if status is the same
        if (oldStatus === newStatus) {
            return inquiry;
        }

        // Validate status transition
        if (oldStatus === 'CONVERTED') {
            throw new ConflictException(
                'Cannot change status of a converted inquiry',
            );
        }

        // Update status
        const updated = await this.prisma.inquiry.update({
            where: { id: inquiryId },
            data: { status: newStatus },
            include: {
                program: true,
            },
        });

        // Auto-create system note for audit trail
        await this.inquiryNoteService.createSystemNote(
            inquiryId,
            actorId,
            `Status changed from ${oldStatus} to ${newStatus}`,
        );

        return updated;
    }

    /**
     * Add manual note to inquiry
     */
    async addNote(
        inquiryId: string,
        actorId: string,
        noteText: string,
    ): Promise<Inquiry> {
        await this.findByIdOrFail(inquiryId); // Verify inquiry exists

        await this.inquiryNoteService.createManualNote(
            inquiryId,
            actorId,
            noteText,
        );

        return this.findByIdOrFail(inquiryId);
    }

    /**
     * Convert inquiry to application with Person creation
     * 
     * TRANSACTIONAL LOGIC:
     * 1. Find or create Person record (by email match)
     * 2. Create Application linked to Person and Inquiry
     * 3. Mark Inquiry as CONVERTED
     * 4. Create system note for audit trail
     * 
     * All operations are atomic via Prisma transaction
     */
    async convertToApplication(
        inquiryId: string,
        programId: string,
        batchId: string,
        actorId: string,
    ): Promise<Application> {
        const inquiry = await this.findByIdOrFail(inquiryId);

        // Validate inquiry status
        if (inquiry.status === 'CONVERTED') {
            throw new ConflictException('Inquiry has already been converted');
        }

        if (inquiry.status === 'CLOSED') {
            throw new ConflictException('Cannot convert a closed inquiry');
        }

        // Execute all operations in a single transaction
        return this.prisma.$transaction(async (tx) => {
            // Step 1: Find existing Person by email or create new one
            // We'll search for a User with matching email, then get their Person
            let person;

            const existingUser = await tx.user.findUnique({
                where: { email: inquiry.email },
                include: { person: true },
            });

            if (existingUser && existingUser.person) {
                // Person already exists via User record
                person = existingUser.person;
            } else {
                // Create new Person record
                person = await tx.person.create({
                    data: {
                        legal_name: `${inquiry.first_name} ${inquiry.last_name}`,
                        date_of_birth: new Date('2000-01-01'), // Placeholder - to be updated
                        gender: 'PREFER_NOT_TO_SAY',
                        nationality: 'Unknown', // To be updated during application process
                    },
                });
            }

            // Step 2: Create Application
            const application = await tx.application.create({
                data: {
                    inquiry_id: inquiryId,
                    person_id: person.id,
                    program_id: programId,
                    batch_id: batchId,
                    status: 'DRAFT',
                },
                include: {
                    person: true,
                    program: true,
                    inquiry: true,
                },
            });

            // Step 3: Mark Inquiry as CONVERTED
            await tx.inquiry.update({
                where: { id: inquiryId },
                data: { status: 'CONVERTED' },
            });

            // Step 4: Create system note
            await tx.inquiryNote.create({
                data: {
                    inquiry_id: inquiryId,
                    actor_id: actorId,
                    note_text: `Inquiry converted to Application ${application.id}`,
                    is_system_generated: true,
                },
            });

            return application;
        });
    }
}
