import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

/**
 * ApplicationController handles application workflow
 * All endpoints require authentication + permissions
 */
@Controller('api/v1/admissions/applications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ApplicationController {
    constructor(private readonly applicationService: ApplicationService) { }

    /**
     * Get all applications with optional filters
     * Requires: admissions.read permission
     */
    @Permissions('admissions.read')
    @Get()
    async findAll(
        @Query('status') status?: ApplicationStatus,
        @Query('program_id') programId?: string,
        @Query('batch_id') batchId?: string,
    ) {
        return this.applicationService.findAll(status, programId, batchId);
    }

    /**
     * Get application by ID
     * Requires: admissions.read permission
     */
    @Permissions('admissions.read')
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.applicationService.findByIdOrFail(id);
    }

    /**
     * Create application (direct, not from inquiry)
     * Requires: admissions.write permission
     */
    @Permissions('admissions.write')
    @Post()
    async create(@Body() createApplicationDto: CreateApplicationDto) {
        return this.applicationService.create(
            createApplicationDto.person_id,
            createApplicationDto.program_id,
            createApplicationDto.batch_id,
            createApplicationDto.inquiry_id,
        );
    }

    /**
     * Update application status (generic)
     * Requires: admissions.write permission
     */
    @Permissions('admissions.write')
    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateApplicationStatusDto,
    ) {
        return this.applicationService.updateStatus(id, updateStatusDto.status);
    }

    /**
     * Submit application (DRAFT -> SUBMITTED)
     * Convenience endpoint with semantic meaning
     * Requires: admissions.write permission
     */
    @Permissions('admissions.write')
    @Patch(':id/submit')
    async submit(@Param('id') id: string) {
        return this.applicationService.submit(id);
    }

    /**
     * Move application to review (SUBMITTED -> UNDER_REVIEW)
     * Requires: admissions.write permission
     */
    @Permissions('admissions.write')
    @Patch(':id/review')
    async moveToReview(@Param('id') id: string) {
        return this.applicationService.moveToReview(id);
    }

    /**
     * Accept application (UNDER_REVIEW -> ACCEPTED)
     * Validates minimum 2 approved documents
     * Triggers Phase 4 enrollment placeholder
     * Requires: admissions.write permission
     */
    @Permissions('admissions.write')
    @Patch(':id/accept')
    async accept(@Param('id') id: string) {
        return this.applicationService.accept(id);
    }

    /**
     * Reject application (UNDER_REVIEW -> REJECTED)
     * Requires: admissions.write permission
     */
    @Permissions('admissions.write')
    @Patch(':id/reject')
    async reject(@Param('id') id: string) {
        return this.applicationService.reject(id);
    }

    /**
     * Move application to waitlist (UNDER_REVIEW -> WAITLISTED)
     * Requires: admissions.write permission
     */
    @Permissions('admissions.write')
    @Patch(':id/waitlist')
    async waitlist(@Param('id') id: string) {
        return this.applicationService.waitlist(id);
    }
}
