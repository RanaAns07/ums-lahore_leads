"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, FileText, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type ApplicationStatus = "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED" | "WAITLISTED";
type DocumentStatus = "PENDING" | "APPROVED" | "REJECTED";

interface ApplicationDocument {
    id: string;
    document_type: string;
    file_url: string;
    status: DocumentStatus;
    created_at: string;
}

interface Application {
    id: string;
    status: ApplicationStatus;
    submitted_at: string | null;
    person: {
        first_name: string;
        last_name: string;
        legal_name: string;
    };
    program: {
        name: string;
        code: string;
    };
}

export default function ApplicationReviewPage() {
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: applications = [], isLoading: appsLoading } = useQuery<Application[]>({
        queryKey: ["applications"],
        queryFn: async () => {
            const res = await api.get("/admissions/applications?status=UNDER_REVIEW");
            // Also fetch SUBMITTED if you want them all in review
            const resSubmitted = await api.get("/admissions/applications?status=SUBMITTED");
            return [...res.data, ...resSubmitted.data];
        },
    });

    const { data: documents = [], isLoading: docsLoading } = useQuery<ApplicationDocument[]>({
        queryKey: ["application_documents", selectedApp?.id],
        queryFn: async () => {
            if (!selectedApp) return [];
            const res = await api.get(`/admissions/applications/${selectedApp.id}/documents`);
            return res.data;
        },
        enabled: !!selectedApp,
    });

    const updateDocMutation = useMutation({
        mutationFn: async ({ id, action }: { id: string, action: "approve" | "reject" }) => {
            await api.patch(`/admissions/documents/${id}/${action}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["application_documents", selectedApp?.id] });
            toast({ title: "Updated", description: "Document status updated successfully" });
        },
        onError: () => {
            toast({ title: "Error", description: "Could not update document", variant: "destructive" });
        }
    });

    const acceptAppMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.patch(`/admissions/applications/${id}/accept`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications"] });
            toast({ title: "Application Accepted", description: "The applicant has been accepted and notified." });
            setSelectedApp(null);
        },
        onError: (err: unknown) => {
            const errorObj = err as { response?: { data?: { message?: string } } };
            toast({
                title: "Acceptance Failed",
                description: errorObj?.response?.data?.message || "Could not accept application. Ensure minimum documents are approved.",
                variant: "destructive"
            });
        }
    });

    const getDocIcon = (status: DocumentStatus) => {
        switch (status) {
            case "PENDING": return <Clock className="w-4 h-4 text-blue-500" />;
            case "APPROVED": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case "REJECTED": return <XCircle className="w-4 h-4 text-red-500" />;
        }
    };

    const getDocColor = (status: DocumentStatus) => {
        switch (status) {
            case "PENDING": return "bg-blue-100 text-blue-800 border-blue-200";
            case "APPROVED": return "bg-green-100 text-green-800 border-green-200";
            case "REJECTED": return "bg-red-100 text-red-800 border-red-200";
        }
    };

    if (appsLoading) return (
        <div className="space-y-6 h-full flex flex-col">
            <div>
                <h3 className="text-2xl font-bold tracking-tight text-primary">Application Review</h3>
                <p className="text-muted-foreground">Verify applicant documents and make admission decisions.</p>
            </div>
            <Card className="border-none shadow-sm flex-1 animate-pulse">
                <div className="h-96 bg-slate-100 rounded-lg"></div>
            </Card>
        </div>
    );

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight text-[#002147]">Application Review</h3>
                    <p className="text-muted-foreground">Verify applicant documents and make admission decisions.</p>
                </div>
            </div>

            <Card className="border-none shadow-sm flex-1">
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Applicant Name</th>
                                <th className="px-6 py-4 font-semibold">Program</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Submitted On</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        No applications currently under review.
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app) => (
                                    <tr key={app.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {app.person.legal_name || `${app.person.first_name} ${app.person.last_name}`}
                                        </td>
                                        <td className="px-6 py-4 text-slate-700">
                                            {app.program.name} ({app.program.code})
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="bg-slate-100">
                                                {app.status.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                            {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                size="sm"
                                                className="bg-[#002147] hover:bg-[#002147]/90 text-white"
                                                onClick={() => setSelectedApp(app)}
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                Review Specs
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
                <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-[#002147] flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[#FFD700]" />
                            Review Documents for {selectedApp?.person.first_name}
                        </DialogTitle>
                        <DialogDescription>
                            Review all uploaded documents. At least 2 approved documents are required for acceptance.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        {docsLoading ? (
                            <div className="space-y-3 animate-pulse">
                                {[1, 2].map(i => <div key={i} className="h-20 bg-slate-100 rounded-lg"></div>)}
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="text-center p-6 text-sm text-muted-foreground border-2 border-dashed rounded-lg bg-slate-50">
                                No documents have been uploaded for this application yet.
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-slate-50 rounded-md border text-slate-400">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-sm text-slate-900">{doc.document_type.replace(/_/g, ' ')}</h4>
                                                <p className="text-xs text-slate-500 mt-1">Uploaded: {new Date(doc.created_at).toLocaleDateString()}</p>
                                                <div className="mt-2 text-xs">
                                                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                        View Attachment ↗
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge className={`${getDocColor(doc.status)} flex w-max items-center gap-1.5`}>
                                                {getDocIcon(doc.status)}
                                                {doc.status}
                                            </Badge>

                                            {doc.status === "PENDING" && (
                                                <div className="flex gap-1 mt-1">
                                                    <Button size="sm" variant="outline" className="h-7 text-xs border-green-200 hover:bg-green-50 text-green-700" onClick={() => updateDocMutation.mutate({ id: doc.id, action: "approve" })}>
                                                        Approve
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="h-7 text-xs border-red-200 hover:bg-red-50 text-red-700" onClick={() => updateDocMutation.mutate({ id: doc.id, action: "reject" })}>
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-4 mt-4 flex justify-between items-center">
                        <div className="text-sm text-slate-500">
                            Approved: {documents.filter(d => d.status === "APPROVED").length} / {documents.length}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setSelectedApp(null)}>Cancel</Button>
                            <Button
                                className="bg-[#FFD700] hover:bg-yellow-500 text-[#002147] font-semibold"
                                onClick={() => selectedApp && acceptAppMutation.mutate(selectedApp.id)}
                                disabled={acceptAppMutation.isPending || documents.filter(d => d.status === "APPROVED").length < 2}
                            >
                                {acceptAppMutation.isPending ? "Processing..." : "Accept Application"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
