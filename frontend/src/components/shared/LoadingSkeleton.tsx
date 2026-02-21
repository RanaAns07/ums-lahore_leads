export function LoadingSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="space-y-6">
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-slate-200 rounded w-1/4" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
            </div>
            <div className="rounded-lg border overflow-hidden">
                <div className="bg-slate-50 border-b px-6 py-4">
                    <div className="flex gap-8">
                        {Array.from({ length: columns }).map((_, i) => (
                            <div key={i} className="h-3 bg-slate-200 rounded w-20 animate-pulse" />
                        ))}
                    </div>
                </div>
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="px-6 py-4 border-b last:border-0">
                        <div className="flex gap-8">
                            {Array.from({ length: columns }).map((_, j) => (
                                <div key={j} className="h-4 bg-slate-100 rounded w-24 animate-pulse" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
