import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Permission } from '@prisma/client';

/**
 * RbacService manages Role-Based Access Control
 */
@Injectable()
export class RbacService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get all permissions for a user
     */
    async getUserPermissions(userId: string): Promise<Permission[]> {
        const roleAssignments = await this.prisma.roleAssignment.findMany({
            where: {
                user_id: userId,
                OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
            },
            include: {
                role: {
                    include: {
                        role_permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });

        // Flatten permissions from all roles
        const permissions: Permission[] = [];
        const seen = new Set<string>();

        for (const assignment of roleAssignments) {
            for (const rolePermission of assignment.role.role_permissions) {
                if (!seen.has(rolePermission.permission.id)) {
                    permissions.push(rolePermission.permission);
                    seen.add(rolePermission.permission.id);
                }
            }
        }

        return permissions;
    }

    /**
     * Check if user has a specific permission
     */
    async hasPermission(userId: string, permissionName: string): Promise<boolean> {
        const permissions = await this.getUserPermissions(userId);
        return permissions.some((p) => p.name === permissionName);
    }

    /**
     * Assign a role to a user
     */
    async assignRole(
        userId: string,
        roleId: string,
        assignedBy?: string,
        expiresAt?: Date,
    ): Promise<void> {
        await this.prisma.roleAssignment.create({
            data: {
                user_id: userId,
                role_id: roleId,
                assigned_by: assignedBy,
                expires_at: expiresAt,
            },
        });
    }

    /**
     * Revoke a role from a user
     */
    async revokeRole(userId: string, roleId: string): Promise<void> {
        await this.prisma.roleAssignment.deleteMany({
            where: {
                user_id: userId,
                role_id: roleId,
            },
        });
    }

    /**
     * Create a new role
     */
    async createRole(name: string, description?: string) {
        return this.prisma.role.create({
            data: { name, description },
        });
    }

    /**
     * Create a new permission
     */
    async createPermission(
        resource: string,
        action: string,
        description?: string,
    ) {
        const name = `${resource}.${action}`;
        return this.prisma.permission.create({
            data: { name, resource, action, description },
        });
    }

    /**
     * Assign a permission to a role
     */
    async assignPermissionToRole(roleId: string, permissionId: string) {
        return this.prisma.rolePermission.create({
            data: {
                role_id: roleId,
                permission_id: permissionId,
            },
        });
    }

    /**
     * Get all roles
     */
    async getAllRoles() {
        return this.prisma.role.findMany({
            include: {
                role_permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }

    /**
     * Get all permissions
     */
    async getAllPermissions() {
        return this.prisma.permission.findMany();
    }
}
