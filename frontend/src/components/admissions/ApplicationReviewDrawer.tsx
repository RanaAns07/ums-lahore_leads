"use client";

import { useApplicationDocuments, useApproveDocument, useRejectDocument } from "@/hooks/use-admissions";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, FileText } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export function ApplicationReviewDrawer({
    applicationId,
    open,
    onOpenChange,
}: {
    applicationId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { data: documents = [], isLoading } = useApplicationDocuments(applicationId || "");
    const approveDoc = useApproveDocument();
    const rejectDoc = useRejectDocument();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Review Documents</SheetTitle>
                    <SheetDescription>Verify the documents submitted by the applicant.</SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                    {!applicationId ? null : isLoading ? (
                        <LoadingSkeleton rows={3} columns={1} />
                    ) : documents.length === 0 ? (
                        <div className="text-center p-6 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                            No documents uploaded yet.
                        </div>
                    ) : (
                        documents.map((doc) => (
                            <div key={doc.id} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-[#002147]" />
                                        <div>
                                            <p className="font-semibold text-sm">{doc.document_type.replace(/_/g, " ")}</p>
                                            <p className="text-xs text-muted-foreground">Uploaded: {new Date(doc.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={doc.status} />
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="flex-1" asChild>
                                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">View File</a>
                                    </Button>
                                </div>
                                {doc.status === "PENDING_REVIEW" && (
                                    <div className="flex gap-2 pt-2 border-t">
                                        <Button
                                            size="sm"
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => approveDoc.mutate(doc.id)}
                                            disabled={approveDoc.isPending}
                                        >
                                            <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 text-red-600 hover:bg-red-50"
                                            onClick={() => rejectDoc.mutate(doc.id)}
                                            disabled={rejectDoc.isPending}
                                        >
                                            <XCircle className="h-4 w-4 mr-1" /> Reject
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
