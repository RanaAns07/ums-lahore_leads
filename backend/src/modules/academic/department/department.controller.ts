import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('academic/department')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DepartmentController {
    constructor(private readonly departmentService: DepartmentService) { }

    @Post()
    @Permissions('academic.department.write')
    async create(@Body() createDepartmentDto: CreateDepartmentDto) {
        return this.departmentService.create(createDepartmentDto);
    }

    @Get(':id')
    @Permissions('academic.department.read')
    async findOne(@Param('id') id: string) {
        return this.departmentService.findByIdOrFail(id);
    }

    @Get()
    @Permissions('academic.department.read')
    async findAll(
        @Query('skip', new ParseIntPipe({ optional: true })) skip = 0,
        @Query('take', new ParseIntPipe({ optional: true })) take = 50,
    ) {
        return this.departmentService.findAll(skip, take);
    }

    @Patch(':id')
    @Permissions('academic.department.write')
    async update(
        @Param('id') id: string,
        @Body() updateDepartmentDto: UpdateDepartmentDto,
    ) {
        return this.departmentService.update(id, updateDepartmentDto);
    }

    @Delete(':id')
    @Permissions('academic.department.write')
    async remove(@Param('id') id: string) {
        await this.departmentService.delete(id);
        return { message: 'Department deleted successfully' };
    }
}
