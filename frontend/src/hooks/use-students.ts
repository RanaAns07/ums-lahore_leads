"use client";

import { useQuery } from "@tanstack/react-query";
import { studentsApi } from "@/lib/api/students";

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
