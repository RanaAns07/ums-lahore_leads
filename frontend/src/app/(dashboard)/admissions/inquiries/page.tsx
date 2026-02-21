"use client";

import { useState } from "react";
import Link from "next/link";
import { useInquiries, useUpdateInquiryStatus, useConvertInquiry } from "@/hooks/use-admissions";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Users, PhoneCall, CheckCircle2, Eye, Search, LayoutGrid, List } from "lucide-react";
import type { Inquiry, InquiryStatus } from "@/types";

const INQUIRY_STATUSES: InquiryStatus[] = ["NEW", "CONTACTED", "IN_PROGRESS", "CONVERTED", "CLOSED"];

export default function InquiriesPage() {
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
    const [convertDialogOpen, setConvertDialogOpen] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [batchId, setBatchId] = useState("FALL-2026");

    const { data: inquiries = [], isLoading } = useInquiries(
        statusFilter !== "ALL" ? { status: statusFilter as InquiryStatus } : undefined
    );

    const updateStatus = useUpdateInquiryStatus();
    const convertInquiry = useConvertInquiry();

    // Client-side search filter
    const filtered = inquiries.filter((inq) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            inq.first_name.toLowerCase().includes(q) ||
            inq.last_name.toLowerCase().includes(q) ||
            inq.email.toLowerCase().includes(q) ||
            (inq.phone && inq.phone.includes(q))
        );
    });

    // Stats computed from all inquiries (when unfiltered)
    const stats = {
        total: statusFilter === "ALL" ? inquiries.length : 0,
        new: (statusFilter === "ALL" ? inquiries : []).filter((i) => i.status === "NEW").length,
        contacted: (statusFilter === "ALL" ? inquiries : []).filter((i) => i.status === "CONTACTED").length,
        converted: (statusFilter === "ALL" ? inquiries : []).filter((i) => i.status === "CONVERTED").length,
    };

    const handleConvertClick = (inq: Inquiry) => {
        setSelectedInquiry(inq);
        setConvertDialogOpen(true);
    };

    // Group for kanban
    const grouped = INQUIRY_STATUSES.reduce(
        (acc, status) => {
            acc[status] = filtered.filter((i) => i.status === status);
            return acc;
        },
        {} as Record<InquiryStatus, Inquiry[]>
    );

    if (isLoading) return <LoadingSkeleton rows={6} columns={5} />;

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight text-[#002147]">Inquiry Management</h3>
                    <p className="text-muted-foreground">Process and convert prospective student inquiries.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <Button
                        variant={viewMode === "table" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("table")}
                        className={viewMode === "table" ? "shadow-sm" : ""}
                    >
                        <List className="h-4 w-4 mr-2" /> Table
                    </Button>
                    <Button
                        variant={viewMode === "kanban" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("kanban")}
                        className={viewMode === "kanban" ? "shadow-sm" : ""}
                    >
                        <LayoutGrid className="h-4 w-4 mr-2" /> Kanban
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            {statusFilter === "ALL" && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard title="Total Inquiries" value={stats.total} icon={Users} iconColor="text-[#002147]" />
                    <StatsCard title="New / Uncontacted" value={stats.new} icon={Users} iconColor="text-blue-500" description="Awaiting first contact" />
                    <StatsCard title="Contacted" value={stats.contacted} icon={PhoneCall} iconColor="text-amber-500" description="In follow-up pipeline" />
                    <StatsCard title="Converted" value={stats.converted} icon={CheckCircle2} iconColor="text-green-500" description="Now applicants" />
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email, phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Statuses</SelectItem>
                        {INQUIRY_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Content */}
            {viewMode === "kanban" ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1 items-start overflow-x-auto pb-4">
                    {INQUIRY_STATUSES.map((status) => (
                        <div key={status}
                            className="bg-slate-50/80 rounded-xl p-4 min-w-[240px] border border-slate-200 shadow-sm flex flex-col max-h-[calc(100vh-360px)]"
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = "move";
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                const id = e.dataTransfer.getData("text/plain");
                                if (id) {
                                    const inquiry = inquiries.find(i => i.id === id);
                                    if (inquiry && inquiry.status !== status) {
                                        updateStatus.mutate({ id, status });
                                    }
                                }
                            }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <StatusBadge status={status} />
                                <span className="text-xs font-medium text-slate-500 bg-white rounded-full px-2 py-0.5 border">
                                    {grouped[status]?.length || 0}
                                </span>
                            </div>
                            <div className="space-y-3 overflow-y-auto pr-1">
                                {(grouped[status] || []).map((inq) => (
                                    <Card
                                        key={inq.id}
                                        className="shadow-sm border-slate-200 hover:shadow-md transition-shadow p-4 cursor-grab active:cursor-grabbing"
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData("text/plain", inq.id);
                                            e.dataTransfer.effectAllowed = "move";
                                        }}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-sm font-semibold text-slate-900">{inq.first_name} {inq.last_name}</h4>
                                        </div>
                                        <div className="text-xs text-muted-foreground mb-1">{inq.email}</div>
                                        {inq.phone && <div className="text-xs text-muted-foreground font-mono mb-3">{inq.phone}</div>}
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" className="flex-1 text-xs h-7" asChild>
                                                <Link href={`/admissions/inquiries/${inq.id}`}><Eye className="w-3 h-3 mr-1" />View</Link>
                                            </Button>
                                            <PermissionGate permission="admissions.write">
                                                {status === "NEW" && (
                                                    <Button size="sm" variant="outline" className="flex-1 text-xs h-7" onClick={() => updateStatus.mutate({ id: inq.id, status: "CONTACTED" })}>
                                                        Contacted
                                                    </Button>
                                                )}
                                                {status === "CONTACTED" && (
                                                    <Button size="sm" className="flex-1 text-xs h-7 bg-[#FFD700] hover:bg-yellow-500 text-[#002147]" onClick={() => handleConvertClick(inq)}>
                                                        Convert
                                                    </Button>
                                                )}
                                            </PermissionGate>
                                        </div>
                                    </Card>
                                ))}
                                {(grouped[status] || []).length === 0 && (
                                    <div className="text-center p-6 text-xs text-muted-foreground border-2 border-dashed rounded-lg">
                                        No inquiries
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Card className="border-none shadow-sm flex-1">
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Name</th>
                                    <th className="px-6 py-4 font-semibold">Contact</th>
                                    <th className="px-6 py-4 font-semibold">Source</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6}>
                                            <EmptyState title="No inquiries found" description="Try adjusting your search or filters." />
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((inq) => (
                                        <tr key={inq.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {inq.first_name} {inq.last_name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-slate-900">{inq.email}</div>
                                                {inq.phone && <div className="text-xs text-muted-foreground font-mono">{inq.phone}</div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{inq.source}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={inq.status} />
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                                {new Date(inq.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link href={`/admissions/inquiries/${inq.id}`}>
                                                        <Eye className="w-3.5 h-3.5 mr-1" /> Details
                                                    </Link>
                                                </Button>
                                                <PermissionGate permission="admissions.write">
                                                    {inq.status === "NEW" && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => updateStatus.mutate({ id: inq.id, status: "CONTACTED" })}
                                                            disabled={updateStatus.isPending}
                                                        >
                                                            Mark Contacted
                                                        </Button>
                                                    )}
                                                    {inq.status === "CONTACTED" && (
                                                        <Button
                                                            size="sm"
                                                            className="bg-[#FFD700] hover:bg-yellow-500 text-[#002147]"
                                                            onClick={() => handleConvertClick(inq)}
                                                        >
                                                            Convert
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
            )}

            {/* Convert Dialog */}
            <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Convert Inquiry to Application</DialogTitle>
                        <DialogDescription>
                            Convert {selectedInquiry?.first_name} {selectedInquiry?.last_name} into an active applicant.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="batch_id" className="text-right">Batch</Label>
                            <Input
                                id="batch_id"
                                value={batchId}
                                onChange={(e) => setBatchId(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g. FALL-2026"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-[#002147] text-white hover:bg-[#002147]/90"
                            disabled={convertInquiry.isPending}
                            onClick={() => {
                                if (selectedInquiry) {
                                    convertInquiry.mutate({
                                        id: selectedInquiry.id,
                                        program_id: selectedInquiry.program_id,
                                        batch_id: batchId,
                                    });
                                    setConvertDialogOpen(false);
                                }
                            }}
                        >
                            {convertInquiry.isPending ? "Converting..." : "Confirm Conversion"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
