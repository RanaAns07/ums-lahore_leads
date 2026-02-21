import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../../common/prisma.service';
import { RbacModule } from '../rbac/rbac.module';

@Module({
    imports: [RbacModule],
    controllers: [UserController],
    providers: [UserService, PrismaService],
    exports: [UserService],
})
export class UserModule { }
