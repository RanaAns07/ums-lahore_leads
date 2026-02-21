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
import { EnrollmentStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { EnrollmentService } from './enrollment.service';
import { ProvisionStudentDto } from './dto/provision-student.dto';
import { RegisterCoursesDto } from './dto/register-courses.dto';

/**
 * EnrollmentController handles student enrollment and course registration
 * All endpoints require authentication + permissions
 */
@Controller('api/v1/enrollment')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EnrollmentController {
    constructor(private readonly enrollmentService: EnrollmentService) { }

    /**
     * Provision student from accepted application
     * Creates StudentProfile with unique ID and Enrollment record
     * Requires: academic.enrollment.write permission
     */
    @Permissions('academic.enrollment.write')
    @Post('provision')
    async provisionStudent(@Body() provisionDto: ProvisionStudentDto) {
        return this.enrollmentService.provisionStudent(provisionDto.application_id);
    }

    /**
     * Activate enrollment (PROVISIONED → ACTIVE)
     * Called after payment/documentation complete
     * Requires: academic.enrollment.write permission
     */
    @Permissions('academic.enrollment.write')
    @Patch(':id/activate')
    async activateEnrollment(@Param('id') id: string) {
        return this.enrollmentService.activateEnrollment(id);
    }

    /**
     * Register student for courses
     * Validates capacity, prerequisites, and enrollment status
     * Requires: academic.enrollment.write permission
     */
    @Permissions('academic.enrollment.write')
    @Post(':id/register')
    async registerForCourses(
        @Param('id') id: string,
        @Body() registerDto: RegisterCoursesDto,
    ) {
        return this.enrollmentService.registerForCourses(id, registerDto.offering_ids);
    }

    /**
     * Get all enrollments with optional filters
     * Requires: academic.enrollment.read permission
     */
    @Permissions('academic.enrollment.read')
    @Get()
    async findAll(
        @Query('status') status?: EnrollmentStatus,
        @Query('program_id') programId?: string,
    ) {
        return this.enrollmentService.findAll(status, programId);
    }

    /**
     * Get enrollment by ID
     * Requires: academic.enrollment.read permission
     */
    @Permissions('academic.enrollment.read')
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.enrollmentService.findByIdOrFail(id);
    }

    /**
     * Update enrollment status
     * Requires: academic.enrollment.write permission
     */
    @Permissions('academic.enrollment.write')
    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: EnrollmentStatus,
    ) {
        return this.enrollmentService.updateStatus(id, status);
    }
}
