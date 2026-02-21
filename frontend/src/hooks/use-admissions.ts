"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { admissionsApi } from "@/lib/api/admissions";
import type { InquiryStatus, ApplicationStatus } from "@/types";

// ============================================
// ADMISSIONS QUERY HOOKS
// ============================================

// ---- Inquiry Hooks ----

export function useInquiries(params?: { status?: InquiryStatus; program_id?: string }) {
    return useQuery({
        queryKey: ["inquiries", params],
        queryFn: () => admissionsApi.getInquiries(params),
    });
}

export function useInquiry(id: string) {
    return useQuery({
        queryKey: ["inquiry", id],
        queryFn: () => admissionsApi.getInquiry(id),
        enabled: !!id,
    });
}

export function useUpdateInquiryStatus() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: InquiryStatus }) =>
            admissionsApi.updateInquiryStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inquiries"] });
            queryClient.invalidateQueries({ queryKey: ["inquiry"] });
            toast({ title: "Status Updated", description: "Inquiry status changed successfully." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
        },
    });
}

export function useAddInquiryNote() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, note_text }: { id: string; note_text: string }) =>
            admissionsApi.addInquiryNote(id, note_text),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["inquiry", variables.id] });
            toast({ title: "Note Added", description: "Note added to inquiry." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to add note.", variant: "destructive" });
        },
    });
}

export function useConvertInquiry() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, program_id, batch_id }: { id: string; program_id: string; batch_id: string }) =>
            admissionsApi.convertInquiry(id, { program_id, batch_id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inquiries"] });
            queryClient.invalidateQueries({ queryKey: ["inquiry"] });
            queryClient.invalidateQueries({ queryKey: ["applications"] });
            toast({ title: "Converted", description: "Inquiry converted to application successfully." });
        },
        onError: () => {
            toast({ title: "Conversion Failed", description: "Could not convert inquiry.", variant: "destructive" });
        },
    });
}

// ---- Application Hooks ----

export function useApplications(params?: { status?: ApplicationStatus; program_id?: string; batch_id?: string }) {
    return useQuery({
        queryKey: ["applications", params],
        queryFn: () => admissionsApi.getApplications(params),
    });
}

export function useApplication(id: string) {
    return useQuery({
        queryKey: ["application", id],
        queryFn: () => admissionsApi.getApplication(id),
        enabled: !!id,
    });
}

export function useApplicationDocuments(applicationId: string) {
    return useQuery({
        queryKey: ["application-documents", applicationId],
        queryFn: () => admissionsApi.getApplicationDocuments(applicationId),
        enabled: !!applicationId,
    });
}

export function useAcceptApplication() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: string) => admissionsApi.acceptApplication(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications"] });
            queryClient.invalidateQueries({ queryKey: ["application"] });
            toast({ title: "Application Accepted", description: "The applicant has been accepted and notified." });
        },
        onError: (err: unknown) => {
            const errorObj = err as { response?: { data?: { message?: string } } };
            toast({
                title: "Acceptance Failed",
                description: errorObj?.response?.data?.message || "Could not accept. Ensure minimum documents are approved.",
                variant: "destructive",
            });
        },
    });
}

export function useRejectApplication() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: string) => admissionsApi.rejectApplication(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications"] });
            queryClient.invalidateQueries({ queryKey: ["application"] });
            toast({ title: "Application Rejected", description: "The application has been rejected." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to reject application.", variant: "destructive" });
        },
    });
}

export function useWaitlistApplication() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: string) => admissionsApi.waitlistApplication(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications"] });
            queryClient.invalidateQueries({ queryKey: ["application"] });
            toast({ title: "Waitlisted", description: "The application has been placed on waitlist." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to waitlist application.", variant: "destructive" });
        },
    });
}

export function useMoveToReview() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: string) => admissionsApi.moveToReview(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications"] });
            queryClient.invalidateQueries({ queryKey: ["application"] });
            toast({ title: "Moved to Review", description: "Application is now under review." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to move to review.", variant: "destructive" });
        },
    });
}

export function useApproveDocument() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: string) => admissionsApi.approveDocument(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["application-documents"] });
            toast({ title: "Document Approved", description: "Document has been approved." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to approve document.", variant: "destructive" });
        },
    });
}

export function useRejectDocument() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: string) => admissionsApi.rejectDocument(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["application-documents"] });
            toast({ title: "Document Rejected", description: "Document has been rejected." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to reject document.", variant: "destructive" });
        },
    });
}
