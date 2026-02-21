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
import { ProgramService } from './program.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('academic/program')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProgramController {
    constructor(private readonly programService: ProgramService) { }

    @Post()
    @Permissions('academic.program.write')
    async create(@Body() createProgramDto: CreateProgramDto) {
        return this.programService.create(createProgramDto);
    }

    @Get(':id')
    @Permissions('academic.program.read')
    async findOne(@Param('id') id: string) {
        return this.programService.findByIdOrFail(id);
    }

    @Get()
    @Permissions('academic.program.read')
    async findAll(
        @Query('skip', new ParseIntPipe({ optional: true })) skip = 0,
        @Query('take', new ParseIntPipe({ optional: true })) take = 50,
    ) {
        return this.programService.findAll(skip, take);
    }

    @Delete(':id')
    @Permissions('academic.program.write')
    async remove(@Param('id') id: string) {
        await this.programService.delete(id);
        return { message: 'Program deleted successfully' };
    }
}
