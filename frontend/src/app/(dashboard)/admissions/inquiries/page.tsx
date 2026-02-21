"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, PhoneCall, XCircle, LayoutGrid, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type InquiryStatus = "NEW" | "CONTACTED" | "CONVERTED" | "REJECTED";

interface Inquiry {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    status: InquiryStatus;
    program_id: string;
    notes: string;
    created_at: string;
}

export default function InquiriesPage() {
    const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: inquiries = [], isLoading } = useQuery<Inquiry[]>({
        queryKey: ["inquiries"],
        queryFn: async () => {
            const res = await api.get("/admissions/inquiries");
            return res.data;
        },
    });

    const updateStatus = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: InquiryStatus }) => {
            await api.patch(`/admissions/inquiries/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inquiries"] });
            toast({ title: "Status Updated", description: "Inquiry status changed successfully." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
    });

    const getStatusIcon = (status: InquiryStatus) => {
        switch (status) {
            case "NEW": return <Clock className="w-4 h-4 text-blue-500" />;
            case "CONTACTED": return <PhoneCall className="w-4 h-4 text-gold" />;
            case "CONVERTED": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case "REJECTED": return <XCircle className="w-4 h-4 text-red-500" />;
        }
    };

    const getStatusColor = (status: InquiryStatus) => {
        switch (status) {
            case "NEW": return "bg-blue-100 text-blue-800 border-blue-200";
            case "CONTACTED": return "bg-amber-100 text-amber-800 border-amber-200";
            case "CONVERTED": return "bg-green-100 text-green-800 border-green-200";
            case "REJECTED": return "bg-red-100 text-red-800 border-red-200";
        }
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading inquiries...</div>;

    const grouped = {
        NEW: inquiries.filter(i => i.status === "NEW"),
        CONTACTED: inquiries.filter(i => i.status === "CONTACTED"),
        CONVERTED: inquiries.filter(i => i.status === "CONVERTED"),
        REJECTED: inquiries.filter(i => i.status === "REJECTED"),
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight text-primary">Inquiry Management</h3>
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

            {viewMode === "kanban" ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 items-start overflow-x-auto pb-4">
                    {(["NEW", "CONTACTED", "CONVERTED", "REJECTED"] as InquiryStatus[]).map((status) => (
                        <div key={status} className="bg-slate-50/80 rounded-xl p-4 min-w-[280px] border border-slate-200 shadow-sm flex flex-col max-h-[calc(100vh-220px)]">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                                    {getStatusIcon(status)}
                                    {status}
                                </h4>
                                <Badge variant="secondary" className="bg-white">{grouped[status].length}</Badge>
                            </div>
                            <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                                {grouped[status].map((inq) => (
                                    <Card key={inq.id} className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                                        <CardHeader className="p-4 pb-2">
                                            <CardTitle className="text-sm font-semibold">{inq.first_name} {inq.last_name}</CardTitle>
                                            <div className="text-xs text-muted-foreground font-mono">{inq.phone}</div>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0">
                                            <p className="text-xs line-clamp-2 text-slate-600 mb-3">{inq.notes || "No notes provided."}</p>

                                            {/* Action buttons based on status */}
                                            <div className="flex gap-2">
                                                {status === "NEW" && (
                                                    <Button size="sm" variant="outline" className="w-full text-xs h-8" onClick={() => updateStatus.mutate({ id: inq.id, status: "CONTACTED" })}>Mark Contacted</Button>
                                                )}
                                                {status === "CONTACTED" && (
                                                    <>
                                                        <Button size="sm" className="flex-1 text-xs h-8 bg-green-600 hover:bg-green-700" onClick={() => updateStatus.mutate({ id: inq.id, status: "CONVERTED" })}>Convert</Button>
                                                        <Button size="sm" variant="outline" className="flex-1 text-xs h-8 text-red-600 hover:bg-red-50" onClick={() => updateStatus.mutate({ id: inq.id, status: "REJECTED" })}>Reject</Button>
                                                    </>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {grouped[status].length === 0 && (
                                    <div className="text-center p-6 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
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
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inquiries.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                            No inquiries found.
                                        </td>
                                    </tr>
                                ) : (
                                    inquiries.map((inq) => (
                                        <tr key={inq.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {inq.first_name} {inq.last_name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-slate-900">{inq.phone}</div>
                                                <div className="text-xs text-muted-foreground">{inq.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className={`${getStatusColor(inq.status)} flex w-max items-center gap-1.5`}>
                                                    {getStatusIcon(inq.status)}
                                                    {inq.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                                {new Date(inq.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                {inq.status === "NEW" && (
                                                    <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: inq.id, status: "CONTACTED" })}>Contacted</Button>
                                                )}
                                                {inq.status === "CONTACTED" && (
                                                    <Button size="sm" onClick={() => updateStatus.mutate({ id: inq.id, status: "CONVERTED" })}>Convert</Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}
