"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentsApi } from "@/lib/api/students";
import { useToast } from "@/hooks/use-toast";

// ============================================
// STUDENTS QUERY HOOKS
// ============================================

export function usePersons(params?: { skip?: number; take?: number }) {
    return useQuery({
        queryKey: ["persons", params],
        queryFn: () => studentsApi.getPersons(params),
    });
}

export function usePerson(id: string) {
    return useQuery({
        queryKey: ["person", id],
        queryFn: () => studentsApi.getPerson(id),
        enabled: !!id,
    });
}

export function useEnrollments(params?: { status?: string; program_id?: string }) {
    return useQuery({
        queryKey: ["enrollments", params],
        queryFn: () => studentsApi.getEnrollments(params),
    });
}

export function useEnrollment(id: string) {
    return useQuery({
        queryKey: ["enrollment", id],
        queryFn: () => studentsApi.getEnrollment(id),
        enabled: !!id,
    });
}

export function useRegisterForCourse() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ enrollmentId, courseOfferingId }: { enrollmentId: string, courseOfferingId: string }) =>
            studentsApi.registerForCourse(enrollmentId, courseOfferingId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["enrollment", variables.enrollmentId] });
            toast({ title: "Registered", description: "Successfully registered for the course." });
        },
        onError: (err: any) => {
            toast({ title: "Registration Failed", description: err?.response?.data?.message || "Could not complete registration.", variant: "destructive" });
        }
    });
}

export function useDropCourse() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ enrollmentId, courseOfferingId }: { enrollmentId: string, courseOfferingId: string }) =>
            studentsApi.dropCourse(enrollmentId, courseOfferingId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["enrollment", variables.enrollmentId] });
            toast({ title: "Dropped", description: "Successfully dropped the course." });
        },
        onError: (err: any) => {
            toast({ title: "Drop Failed", description: err?.response?.data?.message || "Could not drop course.", variant: "destructive" });
        }
    });
}
