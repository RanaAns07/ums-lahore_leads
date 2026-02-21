// ============================================
// SHARED TYPESCRIPT INTERFACES
// Derived from Prisma schema + backend service responses
// ============================================

// ---- Enums ----

export type InquiryStatus = 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'CONVERTED' | 'CLOSED';
export type InquirySource = 'WEB' | 'WALK_IN' | 'PHONE' | 'EMAIL' | 'REFERRAL';
export type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'WAITLISTED';
export type DocumentType = 'TRANSCRIPT' | 'ID_PROOF' | 'DEGREE_CERTIFICATE' | 'RECOMMENDATION_LETTER' | 'PERSONAL_STATEMENT' | 'OTHER';
export type DocumentStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
export type InvoiceStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'VOID';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
export type EnrollmentStatus = 'PROVISIONED' | 'ACTIVE' | 'ON_HOLD' | 'WITHDRAWN' | 'GRADUATED';
export type TransactionType = 'INFLOW' | 'OUTFLOW';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

// ---- Identity Models ----

export interface Person {
    id: string;
    legal_name: string;
    date_of_birth: string;
    gender: Gender;
    nationality?: string;
    created_at: string;
    updated_at: string;
    user?: User;
    student_profile?: StudentProfile;
}

export interface User {
    id: string;
    person_id: string;
    email: string;
    status: string;
    last_login_at?: string;
    created_at: string;
    person?: Person;
    role_assignments?: RoleAssignment[];
}

export interface RoleAssignment {
    id: string;
    user_id: string;
    role_id: string;
    role: {
        id: string;
        name: string;
    };
}

// ---- Academic Models ----

export interface Program {
    id: string;
    name: string;
    code: string;
    duration_semesters: number;
    department_id: string;
    department?: { id: string; name: string; code: string };
}

export interface Semester {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
}

// ---- Admissions Models ----

export interface Inquiry {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    program_id: string;
    source: InquirySource;
    status: InquiryStatus;
    created_at: string;
    updated_at: string;
    program?: Program;
    notes?: InquiryNote[];
}

export interface InquiryNote {
    id: string;
    inquiry_id: string;
    actor_id: string;
    note_text?: string;
    is_system_generated: boolean;
    created_at: string;
    actor?: {
        id: string;
        legal_name: string;
    };
}

export interface Application {
    id: string;
    inquiry_id?: string;
    person_id: string;
    program_id: string;
    batch_id: string;
    status: ApplicationStatus;
    created_at: string;
    updated_at: string;
    submitted_at?: string;
    reviewed_at?: string;
    person: Person;
    program: Program;
    inquiry?: Inquiry;
    documents?: ApplicationDocument[];
}

export interface ApplicationDocument {
    id: string;
    application_id: string;
    document_type: DocumentType;
    file_url: string;
    status: DocumentStatus;
    created_at: string;
}

// ---- Enrollment Models ----

export interface StudentProfile {
    id: string;
    person_id: string;
    student_id_number: string;
    status: EnrollmentStatus;
    created_at: string;
    person?: Person;
    enrollments?: Enrollment[];
}

export interface Enrollment {
    id: string;
    student_profile_id: string;
    program_id: string;
    batch_id: string;
    semester_id: string;
    status: EnrollmentStatus;
    created_at: string;
    student_profile?: StudentProfile;
    program?: Program;
    semester?: Semester;
    invoices?: Invoice[];
}

// ---- Finance Models ----

export interface Invoice {
    id: string;
    enrollment_id: string;
    total_amount: number;
    paid_amount: number;
    due_date: string;
    status: InvoiceStatus;
    created_at: string;
    items?: InvoiceItem[];
    payments?: Payment[];
    enrollment?: Enrollment;
}

export interface InvoiceItem {
    id: string;
    invoice_id: string;
    fee_type: string;
    amount: number;
    description: string;
}

export interface Payment {
    id: string;
    invoice_id: string;
    amount_paid: number;
    payment_method: string;
    transaction_reference?: string;
    status: PaymentStatus;
    notes?: string;
    created_at: string;
    invoice?: Invoice;
}

export interface Fund {
    id: string;
    name: string;
    balance: number;
    description?: string;
    created_at: string;
}

export interface FinancialTransaction {
    id: string;
    type: TransactionType;
    fund_id: string;
    amount: number;
    category: string;
    reference_id?: string;
    reference_type?: string;
    description: string;
    created_at: string;
    fund?: Fund;
}

export interface FinancialSummary {
    totalInflows: number;
    totalOutflows: number;
    netPosition: number;
    fundBalances: Record<string, number>;
}
