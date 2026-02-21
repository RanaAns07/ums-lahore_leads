import api from '@/lib/api';
import type { Person, Enrollment, CourseRegistration } from '@/types';

// ============================================
// STUDENTS API SERVICE LAYER
// Note: Person/User routes lack /api/v1/ prefix
// ============================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
const BASE_URL = API_URL.replace('/api/v1', '');

export const studentsApi = {
    // ---- Person ----
    // Person controller is mounted at /person (no /api/v1/ prefix)

    getPersons: (params?: { skip?: number; take?: number }) =>
        api.get<Person[]>('/person', { baseURL: BASE_URL, params }).then((r) => r.data),

    getPerson: (id: string) =>
        api.get<Person>(`/person/${id}`, { baseURL: BASE_URL }).then((r) => r.data),

    // ---- Enrollments ----

    getEnrollments: (params?: { status?: string; program_id?: string }) =>
        api.get<Enrollment[]>('/enrollment', { params }).then((r) => r.data),

    getEnrollment: (id: string) =>
        api.get<Enrollment>(`/enrollment/${id}`).then((r) => r.data),

    // ---- Course Registration ----

    registerForCourse: (enrollmentId: string, courseOfferingId: string) =>
        api.post<CourseRegistration>(`/enrollment/${enrollmentId}/courses`, { course_offering_id: courseOfferingId }).then(r => r.data),

    dropCourse: (enrollmentId: string, courseOfferingId: string) =>
        api.delete(`/enrollment/${enrollmentId}/courses/${courseOfferingId}`).then(r => r.data),
};
