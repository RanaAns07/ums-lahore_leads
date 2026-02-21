import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to specify required permissions for a route
 * @param permissions - Array of permission names (e.g., 'student.read', 'finance.write')
 * @example
 * @Permissions('student.read', 'student.write')
 */
export const Permissions = (...permissions: string[]) =>
    SetMetadata(PERMISSIONS_KEY, permissions);
