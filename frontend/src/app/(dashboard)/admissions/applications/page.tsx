"use client";

import { useState } from "react";
import Link from "next/link";
import { useApplications, useMoveToReview, useRejectApplication } from "@/hooks/use-admissions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatsCard } from "@/components/shared/StatsCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, CheckCircle2, XCircle, Clock, Eye, Search } from "lucide-react";
import type { ApplicationStatus } from "@/types";

const APP_STATUSES: ApplicationStatus[] = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "REJECTED", "WAITLISTED"];

export default function ApplicationsPage() {
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    const { data: applications = [], isLoading } = useApplications(
        statusFilter !== "ALL" ? { status: statusFilter as ApplicationStatus } : undefined
    );

    const moveToReview = useMoveToReview();
    const rejectApp = useRejectApplication();

    const filtered = applications.filter((app) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            app.person?.legal_name?.toLowerCase().includes(q) ||
            app.program?.name?.toLowerCase().includes(q) ||
            app.program?.code?.toLowerCase().includes(q) ||
            app.batch_id?.toLowerCase().includes(q)
        );
    });

    // Stats (computed from all when unfiltered)
    const stats = statusFilter === "ALL" ? {
        total: applications.length,
        submitted: applications.filter((a) => a.status === "SUBMITTED").length,
        underReview: applications.filter((a) => a.status === "UNDER_REVIEW").length,
        accepted: applications.filter((a) => a.status === "ACCEPTED").length,
    } : null;

    if (isLoading) return <LoadingSkeleton rows={6} columns={5} />;

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header */}
            <div>
                <h3 className="text-2xl font-bold tracking-tight text-[#002147]">Application Review</h3>
                <p className="text-muted-foreground">Verify applicant documents and make admission decisions.</p>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-4">
                    <StatsCard title="Total Applications" value={stats.total} icon={FileText} iconColor="text-[#002147]" />
                    <StatsCard title="Submitted" value={stats.submitted} icon={Clock} iconColor="text-blue-500" description="Awaiting review" />
                    <StatsCard title="Under Review" value={stats.underReview} icon={FileText} iconColor="text-amber-500" description="Being processed" />
                    <StatsCard title="Accepted" value={stats.accepted} icon={CheckCircle2} iconColor="text-green-500" description="Admitted students" />
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, program, batch..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Statuses</SelectItem>
                        {APP_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <Card className="border-none shadow-sm flex-1">
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Applicant Name</th>
                                <th className="px-6 py-4 font-semibold">Program</th>
                                <th className="px-6 py-4 font-semibold">Batch</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Submitted</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>
                                        <EmptyState title="No applications found" description="Try adjusting your filters." />
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((app) => (
                                    <tr key={app.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {app.person?.legal_name || "Unknown"}
                                        </td>
                                        <td className="px-6 py-4 text-slate-700">
                                            {app.program?.name} ({app.program?.code})
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">{app.batch_id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={app.status} />
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                            {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : "—"}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Button size="sm" className="bg-[#002147] hover:bg-[#002147]/90 text-white" asChild>
                                                <Link href={`/admissions/applications/${app.id}`}>
                                                    <Eye className="w-3.5 h-3.5 mr-1" /> Review
                                                </Link>
                                            </Button>
                                            <PermissionGate permission="admissions.write">
                                                {app.status === "SUBMITTED" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => moveToReview.mutate(app.id)}
                                                        disabled={moveToReview.isPending}
                                                    >
                                                        Start Review
                                                    </Button>
                                                )}
                                                {(app.status === "SUBMITTED" || app.status === "UNDER_REVIEW") && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 hover:bg-red-50"
                                                        onClick={() => rejectApp.mutate(app.id)}
                                                        disabled={rejectApp.isPending}
                                                    >
                                                        <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                                    </Button>
                                                )}
                                            </PermissionGate>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
