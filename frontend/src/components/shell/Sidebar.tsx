"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, BookOpen, Calculator, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarProps {
    className?: string;
}

const navItems = [
    {
        title: "Inquiries",
        href: "/admissions/inquiries",
        icon: Users,
        requiredPermission: "admissions.read",
    },
    {
        title: "Academic Catalog",
        href: "/academic",
        icon: BookOpen,
        requiredPermission: "academic.read",
    },
    {
        title: "Finance",
        href: "/finance",
        icon: Calculator,
        requiredPermission: "finance.read",
    },
    {
        title: "Admin Center",
        href: "/admin",
        icon: LayoutDashboard,
        requiredPermission: "admin.read",
    },
];

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();

    // In a real app we'd cross-check session.user.roles or a permissions array here
    // For the MVP, we show all links.

    return (
        <div className={cn("pb-12 min-h-screen flex flex-col border-r bg-primary text-primary-foreground", className)}>
            <div className="space-y-4 py-4 flex-1">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-bold tracking-tight text-white">
                        UMS Leads
                    </h2>
                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <Button
                                key={item.href}
                                variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start",
                                    pathname.startsWith(item.href)
                                        ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                        : "text-slate-300 hover:text-white hover:bg-primary/80"
                                )}
                                asChild
                            >
                                <Link href={item.href}>
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="p-4 mt-auto">
                <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:bg-destructive/10 border-none"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </Button>
            </div>
        </div>
    );
}
