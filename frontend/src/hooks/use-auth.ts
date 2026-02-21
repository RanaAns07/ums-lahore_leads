import { useSession } from 'next-auth/react';

export function useAuth() {
    const { data: session, status } = useSession();

    const user = session?.user;
    const roles = user?.roles || [];
    const isAuthenticated = status === 'authenticated';
    const isLoading = status === 'loading';

    const hasRole = (role: string) => {
        return roles.includes(role);
    };

    // Roles like 'Super Admin' typically have all access.
    // In a real system, you might decode permissions from the JWT.
    // We'll mimic role/permission checking here.
    const hasPermission = (permission: string) => {
        if (hasRole('Super Admin')) return true;

        // Fallback simple checks based on typical role names if full permissions aren't in JWT
        const resource = permission.split('.')[0];
        if (roles.includes(`${resource.charAt(0).toUpperCase() + resource.slice(1)} Admin`)) {
            return true;
        }

        return false;
    };

    return {
        user,
        roles,
        isAuthenticated,
        isLoading,
        hasRole,
        hasPermission,
    };
}
