import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DocumentService } from './document.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpdateDocumentStatusDto } from './dto/update-document-status.dto';

/**
 * DocumentController handles application document management
 * All endpoints require authentication + permissions
 * 
 * Phase 6 will add actual file upload with cloud storage (S3/Cloudinary)
 */
@Controller('api/v1/admissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DocumentController {
    constructor(private readonly documentService: DocumentService) { }

    /**
     * Upload/link document to application
     * Requires: admissions.write permission
     */
    @Permissions('admissions.write')
    @Post('applications/:applicationId/documents')
    async uploadDocument(
        @Param('applicationId') applicationId: string,
        @Body() uploadDocumentDto: UploadDocumentDto,
    ) {
        return this.documentService.create(
            applicationId,
            uploadDocumentDto.document_type,
            uploadDocumentDto.file_url,
        );
    }

    /**
     * Get all documents for an application
     * Requires: admissions.read permission
     */
    @Permissions('admissions.read')
    @Get('applications/:applicationId/documents')
    async getApplicationDocuments(@Param('applicationId') applicationId: string) {
        return this.documentService.findByApplicationId(applicationId);
    }

    /**
     * Get document by ID
     * Requires: admissions.read permission
     */
    @Permissions('admissions.read')
    @Get('documents/:id')
    async getDocument(@Param('id') id: string) {
        return this.documentService.findByIdOrFail(id);
    }

    /**
     * Update document status
     * Used for approval/rejection workflow
     * Requires: admissions.write permission
     */
    @Permissions('admissions.write')
    @Patch('documents/:id/status')
    async updateDocumentStatus(
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateDocumentStatusDto,
    ) {
        return this.documentService.updateStatus(id, updateStatusDto.status);
    }

    /**
     * Approve document (convenience endpoint)
     * Requires: admissions.write permission
     */
    @Permissions('admissions.write')
    @Patch('documents/:id/approve')
    async approveDocument(@Param('id') id: string) {
        return this.documentService.approve(id);
    }

    /**
     * Reject document (convenience endpoint)
     * Requires: admissions.write permission
     */
    @Permissions('admissions.write')
    @Patch('documents/:id/reject')
    async rejectDocument(@Param('id') id: string) {
        return this.documentService.reject(id);
    }

    /**
     * Delete document
     * Requires: admissions.write permission
     */
    @Permissions('admissions.write')
    @Delete('documents/:id')
    async deleteDocument(@Param('id') id: string) {
        await this.documentService.delete(id);
        return { message: 'Document deleted successfully' };
    }
}
