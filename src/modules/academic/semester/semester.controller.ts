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
import { SemesterService } from './semester.service';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('academic/semester')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SemesterController {
    constructor(private readonly semesterService: SemesterService) { }

    @Post()
    @Permissions('academic.semester.write')
    async create(@Body() createSemesterDto: CreateSemesterDto) {
        return this.semesterService.create(createSemesterDto);
    }

    @Get('active')
    @Permissions('academic.semester.read')
    async getActive() {
        return this.semesterService.getActive();
    }

    @Get(':id')
    @Permissions('academic.semester.read')
    async findOne(@Param('id') id: string) {
        return this.semesterService.findByIdOrFail(id);
    }

    @Get()
    @Permissions('academic.semester.read')
    async findAll(
        @Query('skip', new ParseIntPipe({ optional: true })) skip = 0,
        @Query('take', new ParseIntPipe({ optional: true })) take = 50,
    ) {
        return this.semesterService.findAll(skip, take);
    }

    @Patch(':id/activate')
    @Permissions('academic.semester.write')
    async activate(@Param('id') id: string) {
        return this.semesterService.activateSemester(id);
    }

    @Delete(':id')
    @Permissions('academic.semester.write')
    async remove(@Param('id') id: string) {
        await this.semesterService.delete(id);
        return { message: 'Semester deleted successfully' };
    }
}
