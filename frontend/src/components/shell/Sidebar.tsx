"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, BookOpen, Calculator, LogOut, GraduationCap, FileText } from "lucide-react";
import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/use-auth";

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
        title: "Applications",
        href: "/admissions/applications",
        icon: FileText,
        requiredPermission: "admissions.read",
    },
    {
        title: "Students",
        href: "/students",
        icon: GraduationCap,
        requiredPermission: "person.read",
    },
    {
        title: "Finance",
        href: "/finance",
        icon: Calculator,
        requiredPermission: "finance.read",
    },
    {
        title: "Academic Catalog",
        href: "/academic",
        icon: BookOpen,
        requiredPermission: "academic.read",
    },
    {
        title: "Admin Center",
        href: "/admin",
        icon: LayoutDashboard,
        requiredPermission: "admin.read",
    },
];

const NAVY = "#002147";
const GOLD = "#FFD700";

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const { hasPermission, isLoading } = useAuth();

    if (isLoading) {
        return <div className={cn("pb-12 min-h-screen border-r bg-[#002147] w-64", className)} />;
    }

    return (
        <div className={cn("pb-12 min-h-screen flex flex-col border-r text-white", className)} style={{ backgroundColor: NAVY }}>
            <div className="space-y-4 py-4 flex-1">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-bold tracking-tight text-white mb-6">
                        UMS Leads
                    </h2>
                    <div className="space-y-1">
                        {navItems.filter(item => hasPermission(item.requiredPermission)).map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Button
                                    key={item.href}
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start font-medium transition-colors",
                                        isActive
                                            ? "text-[#002147] hover:text-[#002147] hover:bg-[#FFD700]"
                                            : "text-slate-300 hover:text-white hover:bg-white/10"
                                    )}
                                    style={isActive ? { backgroundColor: GOLD } : {}}
                                    asChild
                                >
                                    <Link href={item.href}>
                                        <item.icon className="mr-2 h-4 w-4" />
                                        {item.title}
                                    </Link>
                                </Button>
                            )
                        })}
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
