import { Module } from '@nestjs/common';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { PrismaService } from '../../common/prisma.service';
import { RbacModule } from '../rbac/rbac.module';

@Module({
    imports: [RbacModule],
    controllers: [PersonController],
    providers: [PersonService, PrismaService],
    exports: [PersonService],
})
export class PersonModule { }
