import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { RbacService } from '../../modules/rbac/rbac.service';
import { PrismaService } from '../prisma.service';

/**
 * PermissionsGuard enforces RBAC at the controller level
 * Checks if the authenticated user has the required permissions
 * 
 * BOOTSTRAP MODE: When no users exist in the database, permission checks
 * are bypassed to allow initial admin user creation. This solves the Catch-22
 * where permissions are required to create users, but users are needed to have permissions.
 * 
 * Bootstrap mode automatically disables after the first user is created.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private rbacService: RbacService,
        private prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // ============================================
        // BOOTSTRAP MODE: Bypass if no users exist
        // ============================================
        const userCount = await this.prisma.user.count();
        if (userCount === 0) {
            console.log('⚠️  BOOTSTRAP MODE: No users exist. Bypassing permission checks.');
            return true; // Allow first user creation
        }

        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true; // No permissions required
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // Check each required permission
        for (const permission of requiredPermissions) {
            const hasPermission = await this.rbacService.hasPermission(
                user.id,
                permission,
            );

            if (!hasPermission) {
                throw new ForbiddenException(
                    `Missing required permission: ${permission}`,
                );
            }
        }

        return true;
    }
}
