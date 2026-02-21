"use client";

import { useAuth } from "@/hooks/use-auth";

interface PermissionGateProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
    const { hasPermission, isLoading } = useAuth();

    if (isLoading) return null;
    if (!hasPermission(permission)) return <>{fallback}</>;

    return <>{children}</>;
}
