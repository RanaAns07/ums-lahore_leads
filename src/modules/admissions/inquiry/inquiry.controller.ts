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
import { InquiryStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { InquiryService } from './inquiry.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryStatusDto } from './dto/update-inquiry-status.dto';
import { ConvertInquiryDto } from './dto/convert-inquiry.dto';
import { CreateInquiryNoteDto } from '../inquiry-note/dto/create-inquiry-note.dto';

/**
 * InquiryController handles lead capture and inquiry management
 * 
 * PUBLIC:  POST /inquiries (no auth for website leads)
 * PRIVATE: All other endpoints require authentication + permissions
 */
@Controller('api/v1/admissions/inquiries')
export class InquiryController {
    constructor(private readonly inquiryService: InquiryService) { }

    /**
     * PUBLIC ENDPOINT: Submit inquiry from website
     * No authentication required
     */
    @Post()
    async submitInquiry(@Body() createInquiryDto: CreateInquiryDto) {
        return this.inquiryService.createInquiry(createInquiryDto);
    }

    /**
     * Get all inquiries with optional filters
     * Requires: admissions.read permission
     */
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('admissions.read')
    @Get()
    async findAll(
        @Query('status') status?: InquiryStatus,
        @Query('program_id') programId?: string,
    ) {
        return this.inquiryService.findAll(status, programId);
    }

    /**
     * Get inquiry by ID
     * Requires: admissions.read permission
     */
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('admissions.read')
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.inquiryService.findByIdOrFail(id);
    }

    /**
     * Update inquiry status
     * Automatically creates InquiryNote for audit trail
     * Requires: admissions.write permission
     */
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('admissions.write')
    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateInquiryStatusDto,
        @CurrentUser() user: { id: string; personId: string },
    ) {
        return this.inquiryService.updateStatus(
            id,
            updateStatusDto.status,
            user.personId,
        );
    }

    /**
     * Add manual note to inquiry
     * Requires: admissions.write permission
     */
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('admissions.write')
    @Post(':id/notes')
    async addNote(
        @Param('id') id: string,
        @Body() createNoteDto: CreateInquiryNoteDto,
        @CurrentUser() user: { id: string; personId: string },
    ) {
        return this.inquiryService.addNote(
            id,
            user.personId,
            createNoteDto.note_text,
        );
    }

    /**
     * Convert inquiry to application
     * Creates Person record if needed (transactional)
     * Requires: admissions.write permission
     */
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('admissions.write')
    @Post(':id/convert')
    async convertToApplication(
        @Param('id') id: string,
        @Body() convertDto: ConvertInquiryDto,
        @CurrentUser() user: { id: string; personId: string },
    ) {
        return this.inquiryService.convertToApplication(
            id,
            convertDto.program_id,
            convertDto.batch_id,
            user.personId,
        );
    }
}
