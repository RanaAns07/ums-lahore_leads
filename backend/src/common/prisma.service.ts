import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService manages the Prisma client lifecycle
 * Handles connection and disconnection to the database
 */
@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

    /**
     * Enable soft delete middleware
     * Automatically filters out soft-deleted records
     */
    enableSoftDelete() {
        this.$use(async (params, next) => {
            // Check if the model has a deleted_at field
            if (params.model === 'Person' || params.model === 'User') {
                if (params.action === 'findUnique' || params.action === 'findFirst') {
                    // Add deleted_at: null to where clause
                    params.action = 'findFirst';
                    params.args.where = {
                        ...params.args.where,
                        deleted_at: null,
                    };
                }

                if (params.action === 'findMany') {
                    // Add deleted_at: null to where clause
                    if (params.args.where) {
                        if (params.args.where.deleted_at === undefined) {
                            params.args.where.deleted_at = null;
                        }
                    } else {
                        params.args.where = { deleted_at: null };
                    }
                }

                // Convert delete to update with deleted_at
                if (params.action === 'delete') {
                    params.action = 'update';
                    params.args.data = { deleted_at: new Date() };
                }

                if (params.action === 'deleteMany') {
                    params.action = 'updateMany';
                    if (params.args.data !== undefined) {
                        params.args.data.deleted_at = new Date();
                    } else {
                        params.args.data = { deleted_at: new Date() };
                    }
                }
            }

            return next(params);
        });
    }
}
