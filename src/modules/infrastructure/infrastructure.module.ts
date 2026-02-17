import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import { FinanceModule } from '../finance/finance.module';
import { StorageService } from './services/storage.service';
import { NotificationService } from './services/notification.service';
import { LmsSyncService } from './services/lms-sync.service';
import { WebhookController } from './controllers/webhook.controller';

/**
 * InfrastructureModule provides integrations with external systems
 * 
 * Services:
 * - StorageService: S3/Cloudinary file uploads
 * - NotificationService: Email/SMS notifications
 * - LmsSyncService: Moodle/Canvas LMS sync
 * 
 * Controllers:
 * - WebhookController: External payment webhooks
 */
@Module({
    imports: [ConfigModule, FinanceModule],
    controllers: [WebhookController],
    providers: [
        PrismaService,
        StorageService,
        NotificationService,
        LmsSyncService,
    ],
    exports: [StorageService, NotificationService, LmsSyncService],
})
export class InfrastructureModule { }
