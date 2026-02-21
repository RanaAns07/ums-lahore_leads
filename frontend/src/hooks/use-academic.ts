"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { academicApi } from "@/lib/api/academic";
import type { Department, Program, Course, CourseOffering, Semester } from "@/types";

// ============================================
// ACADEMIC QUERY HOOKS
// ============================================

// ---- Departments ----
export function useDepartments() {
    return useQuery({
        queryKey: ["departments"],
        queryFn: () => academicApi.getDepartments(),
    });
}

export function useCreateDepartment() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: Partial<Department>) => academicApi.createDepartment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            toast({ title: "Success", description: "Department created successfully." });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err?.response?.data?.message || "Failed to create department.", variant: "destructive" });
        },
    });
}

// ---- Programs ----
export function usePrograms(params?: { department_id?: string }) {
    return useQuery({
        queryKey: ["programs", params],
        queryFn: () => academicApi.getPrograms(params),
    });
}

export function useCreateProgram() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: Partial<Program>) => academicApi.createProgram(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["programs"] });
            toast({ title: "Success", description: "Program created successfully." });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err?.response?.data?.message || "Failed to create program.", variant: "destructive" });
        },
    });
}

// ---- Courses ----
export function useCourses(params?: { department_id?: string }) {
    return useQuery({
        queryKey: ["courses", params],
        queryFn: () => academicApi.getCourses(params),
    });
}

export function useCourse(id: string) {
    return useQuery({
        queryKey: ["course", id],
        queryFn: () => academicApi.getCourse(id),
        enabled: !!id,
    });
}

export function useCreateCourse() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: Partial<Course>) => academicApi.createCourse(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            toast({ title: "Success", description: "Course created successfully." });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err?.response?.data?.message || "Failed to create course.", variant: "destructive" });
        },
    });
}

// ---- Prerequisites ----
export function useAddPrerequisite() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ courseId, prerequisiteCourseId }: { courseId: string; prerequisiteCourseId: string }) =>
            academicApi.addPrerequisite(courseId, prerequisiteCourseId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["course", variables.courseId] });
            toast({ title: "Success", description: "Prerequisite added successfully." });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err?.response?.data?.message || "Failed to add prerequisite.", variant: "destructive" });
        },
    });
}

export function useRemovePrerequisite() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ courseId, prerequisiteCourseId }: { courseId: string; prerequisiteCourseId: string }) =>
            academicApi.removePrerequisite(courseId, prerequisiteCourseId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["course", variables.courseId] });
            toast({ title: "Success", description: "Prerequisite removed successfully." });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err?.response?.data?.message || "Failed to remove prerequisite.", variant: "destructive" });
        },
    });
}

// ---- Semesters ----
export function useSemesters(params?: { is_active?: boolean }) {
    return useQuery({
        queryKey: ["semesters", params],
        queryFn: () => academicApi.getSemesters(params),
    });
}

// ---- Course Offerings ----
export function useCourseOfferings(params?: { semester_id?: string; course_id?: string; instructor_id?: string }) {
    return useQuery({
        queryKey: ["course-offerings", params],
        queryFn: () => academicApi.getCourseOfferings(params),
    });
}

export function useCreateCourseOffering() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: Partial<CourseOffering>) => academicApi.createCourseOffering(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["course-offerings"] });
            toast({ title: "Success", description: "Course offering created successfully." });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err?.response?.data?.message || "Failed to create course offering.", variant: "destructive" });
        },
    });
}
