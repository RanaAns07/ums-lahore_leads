import { Injectable, NotFoundException } from '@nestjs/common';
import { InquiryNote } from '@prisma/client';
import { PrismaService } from '../../../common/prisma.service';

/**
 * InquiryNoteService handles immutable interaction history for inquiries
 */
@Injectable()
export class InquiryNoteService {
    constructor(private prisma: PrismaService) { }

    /**
     * Create a system-generated note (auto-created on status changes)
     */
    async createSystemNote(
        inquiryId: string,
        actorId: string,
        noteText: string,
    ): Promise<InquiryNote> {
        return this.prisma.inquiryNote.create({
            data: {
                inquiry_id: inquiryId,
                actor_id: actorId,
                note_text: noteText,
                is_system_generated: true,
            },
        });
    }

    /**
     * Create a manual note (added by staff)
     */
    async createManualNote(
        inquiryId: string,
        actorId: string,
        noteText: string,
    ): Promise<InquiryNote> {
        return this.prisma.inquiryNote.create({
            data: {
                inquiry_id: inquiryId,
                actor_id: actorId,
                note_text: noteText,
                is_system_generated: false,
            },
        });
    }

    /**
     * Get all notes for an inquiry (chronological order)
     */
    async findByInquiryId(inquiryId: string): Promise<InquiryNote[]> {
        return this.prisma.inquiryNote.findMany({
            where: { inquiry_id: inquiryId },
            orderBy: { created_at: 'asc' },
            include: {
                actor: {
                    select: {
                        id: true,
                        legal_name: true,
                    },
                },
            },
        });
    }
}
