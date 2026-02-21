import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Body,
    UseGuards,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { AddPrerequisiteDto } from './dto/add-prerequisite.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('academic/course')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CourseController {
    constructor(private readonly courseService: CourseService) { }

    @Post()
    @Permissions('academic.course.write')
    async create(@Body() createCourseDto: CreateCourseDto) {
        return this.courseService.create(createCourseDto);
    }

    @Get(':id')
    @Permissions('academic.course.read')
    async findOne(@Param('id') id: string) {
        return this.courseService.findByIdOrFail(id);
    }

    @Get()
    @Permissions('academic.course.read')
    async findAll(
        @Query('skip', new ParseIntPipe({ optional: true })) skip = 0,
        @Query('take', new ParseIntPipe({ optional: true })) take = 50,
    ) {
        return this.courseService.findAll(skip, take);
    }

    @Post(':id/prerequisite')
    @Permissions('academic.course.write')
    async addPrerequisite(
        @Param('id') id: string,
        @Body() addPrerequisiteDto: AddPrerequisiteDto,
    ) {
        await this.courseService.addPrerequisite(
            id,
            addPrerequisiteDto.prerequisite_course_id,
        );
        return { message: 'Prerequisite added successfully' };
    }

    @Delete(':id/prerequisite/:prerequisiteId')
    @Permissions('academic.course.write')
    async removePrerequisite(
        @Param('id') id: string,
        @Param('prerequisiteId') prerequisiteId: string,
    ) {
        await this.courseService.removePrerequisite(id, prerequisiteId);
        return { message: 'Prerequisite removed successfully' };
    }

    @Delete(':id')
    @Permissions('academic.course.write')
    async remove(@Param('id') id: string) {
        await this.courseService.delete(id);
        return { message: 'Course deleted successfully' };
    }
}
