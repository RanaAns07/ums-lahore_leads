import api from '@/lib/api';
import type {
    Inquiry,
    InquiryStatus,
    Application,
    ApplicationStatus,
    ApplicationDocument,
} from '@/types';

// ============================================
// ADMISSIONS API SERVICE LAYER
// All functions map 1:1 to backend endpoints
// ============================================

export const admissionsApi = {
    // ---- Inquiries ----

    getInquiries: (params?: { status?: InquiryStatus; program_id?: string }) =>
        api.get<Inquiry[]>('/admissions/inquiries', { params }).then((r) => r.data),

    getInquiry: (id: string) =>
        api.get<Inquiry>(`/admissions/inquiries/${id}`).then((r) => r.data),

    updateInquiryStatus: (id: string, status: InquiryStatus) =>
        api.patch<Inquiry>(`/admissions/inquiries/${id}/status`, { status }).then((r) => r.data),

    addInquiryNote: (id: string, note_text: string) =>
        api.post<Inquiry>(`/admissions/inquiries/${id}/notes`, { note_text }).then((r) => r.data),

    convertInquiry: (id: string, data: { program_id: string; batch_id: string }) =>
        api.post<Application>(`/admissions/inquiries/${id}/convert`, data).then((r) => r.data),

    // ---- Applications ----

    getApplications: (params?: { status?: ApplicationStatus; program_id?: string; batch_id?: string }) =>
        api.get<Application[]>('/admissions/applications', { params }).then((r) => r.data),

    getApplication: (id: string) =>
        api.get<Application>(`/admissions/applications/${id}`).then((r) => r.data),

    submitApplication: (id: string) =>
        api.patch<Application>(`/admissions/applications/${id}/submit`).then((r) => r.data),

    moveToReview: (id: string) =>
        api.patch<Application>(`/admissions/applications/${id}/review`).then((r) => r.data),

    acceptApplication: (id: string) =>
        api.patch<Application>(`/admissions/applications/${id}/accept`).then((r) => r.data),

    rejectApplication: (id: string) =>
        api.patch<Application>(`/admissions/applications/${id}/reject`).then((r) => r.data),

    waitlistApplication: (id: string) =>
        api.patch<Application>(`/admissions/applications/${id}/waitlist`).then((r) => r.data),

    // ---- Documents ----

    getApplicationDocuments: (applicationId: string) =>
        api.get<ApplicationDocument[]>(`/admissions/applications/${applicationId}/documents`).then((r) => r.data),

    approveDocument: (id: string) =>
        api.patch(`/admissions/documents/${id}/approve`).then((r) => r.data),

    rejectDocument: (id: string) =>
        api.patch(`/admissions/documents/${id}/reject`).then((r) => r.data),
};
