import { Inbox } from "lucide-react";

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
}

export function EmptyState({
    title = "No data found",
    description = "There are no items to display.",
    icon,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="rounded-full bg-slate-100 p-4 mb-4">
                {icon || <Inbox className="h-8 w-8 text-slate-400" />}
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        </div>
    );
}
