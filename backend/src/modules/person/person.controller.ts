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
import { PersonService } from './person.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('person')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PersonController {
    constructor(private readonly personService: PersonService) { }

    @Post()
    @Permissions('person.create')
    async create(@Body() createPersonDto: CreatePersonDto) {
        return this.personService.create(createPersonDto);
    }

    @Get(':id')
    @Permissions('person.read')
    async findOne(@Param('id') id: string) {
        return this.personService.findByIdOrFail(id);
    }

    @Get()
    @Permissions('person.read')
    async findAll(
        @Query('skip', ParseIntPipe) skip = 0,
        @Query('take', ParseIntPipe) take = 50,
    ) {
        return this.personService.findAll(skip, take);
    }

    @Delete(':id')
    @Permissions('person.delete')
    async remove(@Param('id') id: string) {
        await this.personService.softDelete(id);
        return { message: 'Person deleted successfully' };
    }
}
