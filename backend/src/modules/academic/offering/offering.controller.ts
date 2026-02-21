import {
    Controller,
    Get,
    Post,
    Delete,
    Patch,
    Param,
    Body,
    UseGuards,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { OfferingService } from './offering.service';
import { CreateOfferingDto } from './dto/create-offering.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('academic/offering')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OfferingController {
    constructor(private readonly offeringService: OfferingService) { }

    @Post()
    @Permissions('academic.offering.write')
    async create(@Body() createOfferingDto: CreateOfferingDto) {
        return this.offeringService.create(createOfferingDto);
    }

    @Get('semester/:semesterId')
    @Permissions('academic.offering.read')
    async findBySemester(@Param('semesterId') semesterId: string) {
        return this.offeringService.findBySemester(semesterId);
    }

    @Get(':id')
    @Permissions('academic.offering.read')
    async findOne(@Param('id') id: string) {
        return this.offeringService.findByIdOrFail(id);
    }

    @Get()
    @Permissions('academic.offering.read')
    async findAll(
        @Query('skip', new ParseIntPipe({ optional: true })) skip = 0,
        @Query('take', new ParseIntPipe({ optional: true })) take = 50,
    ) {
        return this.offeringService.findAll(skip, take);
    }

    @Patch(':id/instructor')
    @Permissions('academic.offering.write')
    async updateInstructor(
        @Param('id') id: string,
        @Body('instructor_id') instructorId: string | null,
    ) {
        return this.offeringService.updateInstructor(id, instructorId);
    }

    @Delete(':id')
    @Permissions('academic.offering.write')
    async remove(@Param('id') id: string) {
        await this.offeringService.delete(id);
        return { message: 'Course offering deleted successfully' };
    }
}
