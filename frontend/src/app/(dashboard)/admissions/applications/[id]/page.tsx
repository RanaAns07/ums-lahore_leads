"use client";

import { useParams, useRouter } from "next/navigation";
import {
    useApplication,
    useApplicationDocuments,
    useAcceptApplication,
    useRejectApplication,
    useWaitlistApplication,
    useMoveToReview,
    useApproveDocument,
    useRejectDocument,
} from "@/hooks/use-admissions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, GraduationCap, FileText, CheckCircle2, XCircle, Clock, ShieldCheck } from "lucide-react";

export default function ApplicationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: application, isLoading: appLoading } = useApplication(id);
    const { data: documents = [], isLoading: docsLoading } = useApplicationDocuments(id);

    const acceptApp = useAcceptApplication();
    const rejectApp = useRejectApplication();
    const waitlistApp = useWaitlistApplication();
    const moveToReview = useMoveToReview();
    const approveDoc = useApproveDocument();
    const rejectDoc = useRejectDocument();

    const approvedCount = documents.filter((d) => d.status === "APPROVED").length;
    const canAccept = approvedCount >= 2;

    if (appLoading) return <LoadingSkeleton rows={6} columns={3} />;
    if (!application) return <div className="p-8 text-center text-muted-foreground">Application not found.</div>;

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/admissions/applications")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h3 className="text-2xl font-bold tracking-tight text-[#002147]">
                        Application Review
                    </h3>
                    <p className="text-muted-foreground">
                        {application.person?.legal_name} — {application.program?.name} ({application.program?.code})
                    </p>
                </div>
                <StatusBadge status={application.status} />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Applicant Info */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <User className="w-4 h-4 text-[#FFD700]" /> Applicant
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                            <p className="text-xs text-muted-foreground">Full Name</p>
                            <p className="font-medium">{application.person?.legal_name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Date of Birth</p>
                            <p className="font-medium">{application.person?.date_of_birth ? new Date(application.person.date_of_birth).toLocaleDateString() : "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Gender</p>
                            <p className="font-medium">{application.person?.gender?.replace(/_/g, " ") || "—"}</p>
                        </div>
                        {application.person?.nationality && (
                            <div>
                                <p className="text-xs text-muted-foreground">Nationality</p>
                                <p className="font-medium">{application.person.nationality}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Program Info */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-[#FFD700]" /> Program
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                            <p className="text-xs text-muted-foreground">Program</p>
                            <p className="font-medium">{application.program?.name} ({application.program?.code})</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Batch</p>
                            <p className="font-mono text-xs bg-slate-100 px-2 py-1 rounded w-max">{application.batch_id}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Submitted On</p>
                            <p className="font-medium">{application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : "Not yet submitted"}</p>
                        </div>
                        {application.reviewed_at && (
                            <div>
                                <p className="text-xs text-muted-foreground">Reviewed On</p>
                                <p className="font-medium">{new Date(application.reviewed_at).toLocaleDateString()}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Decision Panel */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#FFD700]" /> Decision
                        </CardTitle>
                        <CardDescription>
                            {approvedCount}/{documents.length} documents approved. Min 2 needed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {/* Progress */}
                        <div className="w-full bg-slate-100 rounded-full h-2.5">
                            <div
                                className={`h-2.5 rounded-full transition-all ${canAccept ? "bg-green-500" : "bg-amber-400"}`}
                                style={{ width: `${documents.length > 0 ? (approvedCount / Math.max(documents.length, 2)) * 100 : 0}%` }}
                            />
                        </div>

                        <PermissionGate permission="admissions.write">
                            <div className="space-y-2 pt-2">
                                {application.status === "SUBMITTED" && (
                                    <Button
                                        className="w-full bg-[#002147] hover:bg-[#002147]/90 text-white"
                                        onClick={() => moveToReview.mutate(id)}
                                        disabled={moveToReview.isPending}
                                    >
                                        {moveToReview.isPending ? "Processing..." : "Start Review"}
                                    </Button>
                                )}
                                {(application.status === "UNDER_REVIEW" || application.status === "SUBMITTED") && (
                                    <>
                                        <Button
                                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => acceptApp.mutate(id)}
                                            disabled={acceptApp.isPending || !canAccept}
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            {acceptApp.isPending ? "Accepting..." : "Accept Application"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full text-orange-600 hover:bg-orange-50"
                                            onClick={() => waitlistApp.mutate(id)}
                                            disabled={waitlistApp.isPending}
                                        >
                                            <Clock className="w-4 h-4 mr-2" />
                                            {waitlistApp.isPending ? "Processing..." : "Waitlist"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full text-red-600 hover:bg-red-50"
                                            onClick={() => rejectApp.mutate(id)}
                                            disabled={rejectApp.isPending}
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            {rejectApp.isPending ? "Processing..." : "Reject Application"}
                                        </Button>
                                    </>
                                )}
                                {(application.status === "ACCEPTED" || application.status === "REJECTED" || application.status === "WAITLISTED") && (
                                    <div className="text-center py-4">
                                        <StatusBadge status={application.status} />
                                        <p className="text-xs text-muted-foreground mt-2">Decision has been made</p>
                                    </div>
                                )}
                            </div>
                        </PermissionGate>
                    </CardContent>
                </Card>
            </div>

            {/* Documents */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#FFD700]" /> Documents
                    </CardTitle>
                    <CardDescription>
                        Review each document. At least 2 must be approved for acceptance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {docsLoading ? (
                        <div className="space-y-3 animate-pulse">
                            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-slate-100 rounded-lg" />)}
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center p-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg bg-slate-50">
                            No documents uploaded for this application.
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-slate-50 rounded-md border text-slate-400">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm text-slate-900">{doc.document_type.replace(/_/g, " ")}</h4>
                                            <p className="text-xs text-slate-500 mt-1">Uploaded: {new Date(doc.created_at).toLocaleDateString()}</p>
                                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                                                View Attachment ↗
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <StatusBadge status={doc.status} />
                                        <PermissionGate permission="admissions.write">
                                            {doc.status === "PENDING_REVIEW" && (
                                                <div className="flex gap-1 mt-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 text-xs border-green-200 hover:bg-green-50 text-green-700"
                                                        onClick={() => approveDoc.mutate(doc.id)}
                                                        disabled={approveDoc.isPending}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 text-xs border-red-200 hover:bg-red-50 text-red-700"
                                                        onClick={() => rejectDoc.mutate(doc.id)}
                                                        disabled={rejectDoc.isPending}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </PermissionGate>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
