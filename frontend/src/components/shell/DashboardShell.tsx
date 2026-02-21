import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Breadcrumbs } from "./Breadcrumbs";

interface DashboardShellProps {
    children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[240px_1fr]">
            <Sidebar className="hidden lg:block" />
            <div className="flex flex-col">
                <TopBar />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    <Breadcrumbs />
                    <div className="flex-1 w-full flex flex-col rounded-lg border border-dashed shadow-sm h-full p-4 overflow-hidden bg-background">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
