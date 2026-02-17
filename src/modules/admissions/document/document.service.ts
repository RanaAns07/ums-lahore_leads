import { Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationDocument, DocumentStatus } from '@prisma/client';
import { PrismaService } from '../../../common/prisma.service';

/**
 * DocumentService handles application document management
 * 
 * NOTE: Currently uses file_url strings
 * Phase 6 will integrate cloud storage (S3/Cloudinary)
 */
@Injectable()
export class DocumentService {
    constructor(private prisma: PrismaService) { }

    /**
     * Upload/link a document to an application
     */
    async create(
        applicationId: string,
        documentType: string,
        fileUrl: string,
    ): Promise<ApplicationDocument> {
        // Verify application exists
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
        });

        if (!application) {
            throw new NotFoundException(
                `Application with ID ${applicationId} not found`,
            );
        }

        return this.prisma.applicationDocument.create({
            data: {
                application_id: applicationId,
                document_type: documentType as any,
                file_url: fileUrl,
                status: 'PENDING_REVIEW',
            },
        });
    }

    /**
     * Get document by ID or throw NotFoundException
     */
    async findByIdOrFail(id: string): Promise<ApplicationDocument> {
        const document = await this.prisma.applicationDocument.findUnique({
            where: { id },
            include: {
                application: {
                    include: {
                        person: true,
                        program: true,
                    },
                },
            },
        });

        if (!document) {
            throw new NotFoundException(`Document with ID ${id} not found`);
        }

        return document;
    }

    /**
     * Get all documents for an application
     */
    async findByApplicationId(applicationId: string): Promise<ApplicationDocument[]> {
        return this.prisma.applicationDocument.findMany({
            where: { application_id: applicationId },
            orderBy: { created_at: 'desc' },
        });
    }

    /**
     * Update document status (PENDING_REVIEW -> APPROVED/REJECTED)
     */
    async updateStatus(
        documentId: string,
        newStatus: DocumentStatus,
    ): Promise<ApplicationDocument> {
        const document = await this.findByIdOrFail(documentId);

        return this.prisma.applicationDocument.update({
            where: { id: documentId },
            data: { status: newStatus },
            include: {
                application: true,
            },
        });
    }

    /**
     * Approve a document
     */
    async approve(documentId: string): Promise<ApplicationDocument> {
        return this.updateStatus(documentId, 'APPROVED');
    }

    /**
     * Reject a document
     */
    async reject(documentId: string): Promise<ApplicationDocument> {
        return this.updateStatus(documentId, 'REJECTED');
    }

    /**
     * Delete a document
     */
    async delete(documentId: string): Promise<void> {
        await this.findByIdOrFail(documentId); // Verify exists

        await this.prisma.applicationDocument.delete({
            where: { id: documentId },
        });
    }

    /**
     * Count approved documents for an application
     * Used for acceptance validation
     */
    async countApprovedDocuments(applicationId: string): Promise<number> {
        return this.prisma.applicationDocument.count({
            where: {
                application_id: applicationId,
                status: 'APPROVED',
            },
        });
    }
}
