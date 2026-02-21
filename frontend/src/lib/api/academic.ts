import { api } from "../api";
import type { Department, Program, Course, CourseOffering, Semester } from "@/types";

export const academicApi = {
    // ---- Departments ----
    getDepartments: async (params?: any) => {
        const response = await api.get<Department[]>("/academic/departments", { params });
        return response.data;
    },
    getDepartment: async (id: string) => {
        const response = await api.get<Department>(`/academic/departments/${id}`);
        return response.data;
    },
    createDepartment: async (data: Partial<Department>) => {
        const response = await api.post<Department>("/academic/departments", data);
        return response.data;
    },
    updateDepartment: async (id: string, data: Partial<Department>) => {
        const response = await api.patch<Department>(`/academic/departments/${id}`, data);
        return response.data;
    },
    deleteDepartment: async (id: string) => {
        const response = await api.delete(`/academic/departments/${id}`);
        return response.data;
    },

    // ---- Programs ----
    getPrograms: async (params?: any) => {
        const response = await api.get<Program[]>("/academic/programs", { params });
        return response.data;
    },
    getProgram: async (id: string) => {
        const response = await api.get<Program>(`/academic/programs/${id}`);
        return response.data;
    },
    createProgram: async (data: Partial<Program>) => {
        const response = await api.post<Program>("/academic/programs", data);
        return response.data;
    },
    updateProgram: async (id: string, data: Partial<Program>) => {
        const response = await api.patch<Program>(`/academic/programs/${id}`, data);
        return response.data;
    },
    deleteProgram: async (id: string) => {
        const response = await api.delete(`/academic/programs/${id}`);
        return response.data;
    },

    // ---- Courses ----
    getCourses: async (params?: { department_id?: string }) => {
        const response = await api.get<Course[]>("/academic/courses", { params });
        return response.data;
    },
    getCourse: async (id: string) => {
        const response = await api.get<Course>(`/academic/courses/${id}`);
        return response.data;
    },
    createCourse: async (data: Partial<Course>) => {
        const response = await api.post<Course>("/academic/courses", data);
        return response.data;
    },
    updateCourse: async (id: string, data: Partial<Course>) => {
        const response = await api.patch<Course>(`/academic/courses/${id}`, data);
        return response.data;
    },
    deleteCourse: async (id: string) => {
        const response = await api.delete(`/academic/courses/${id}`);
        return response.data;
    },

    // ---- Prerequisites ----
    addPrerequisite: async (courseId: string, prerequisiteCourseId: string) => {
        const response = await api.post(`/academic/courses/${courseId}/prerequisites`, { prerequisite_course_id: prerequisiteCourseId });
        return response.data;
    },
    removePrerequisite: async (courseId: string, prerequisiteCourseId: string) => {
        const response = await api.delete(`/academic/courses/${courseId}/prerequisites/${prerequisiteCourseId}`);
        return response.data;
    },

    // ---- Semesters ----
    getSemesters: async (params?: { is_active?: boolean }) => {
        const response = await api.get<Semester[]>("/academic/semesters", { params });
        return response.data;
    },
    createSemester: async (data: Partial<Semester>) => {
        const response = await api.post<Semester>("/academic/semesters", data);
        return response.data;
    },
    updateSemester: async (id: string, data: Partial<Semester>) => {
        const response = await api.patch<Semester>(`/academic/semesters/${id}`, data);
        return response.data;
    },

    // ---- Course Offerings ----
    getCourseOfferings: async (params?: { semester_id?: string; course_id?: string; instructor_id?: string }) => {
        const response = await api.get<CourseOffering[]>("/academic/course-offerings", { params });
        return response.data;
    },
    createCourseOffering: async (data: Partial<CourseOffering>) => {
        const response = await api.post<CourseOffering>("/academic/course-offerings", data);
        return response.data;
    },
    updateCourseOffering: async (id: string, data: Partial<CourseOffering>) => {
        const response = await api.patch<CourseOffering>(`/academic/course-offerings/${id}`, data);
        return response.data;
    },
    deleteCourseOffering: async (id: string) => {
        const response = await api.delete(`/academic/course-offerings/${id}`);
        return response.data;
    }
};
