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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    @Permissions('user.create')
    async create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Get(':id')
    @Permissions('user.read')
    async findOne(@Param('id') id: string) {
        return this.userService.findByIdOrFail(id);
    }

    @Get()
    @Permissions('user.read')
    async findAll(
        @Query('skip', ParseIntPipe) skip = 0,
        @Query('take', ParseIntPipe) take = 50,
    ) {
        return this.userService.findAll(skip, take);
    }

    @Patch(':id')
    @Permissions('user.update')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(id, updateUserDto);
    }

    @Delete(':id')
    @Permissions('user.delete')
    async remove(@Param('id') id: string) {
        await this.userService.softDelete(id);
        return { message: 'User deleted successfully' };
    }
}
