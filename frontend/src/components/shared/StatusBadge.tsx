import { Badge } from "@/components/ui/badge";
import {
    Clock,
    PhoneCall,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileText,
    Loader2,
    ArrowRight,
} from "lucide-react";

// ============================================
// STATUS BADGE — Reusable colored badge for any enum status
// ============================================

type StatusVariant = {
    className: string;
    icon: React.ReactNode;
};

const STATUS_MAP: Record<string, StatusVariant> = {
    // Inquiry statuses
    NEW: { className: "bg-blue-100 text-blue-800 border-blue-200", icon: <Clock className="w-3.5 h-3.5" /> },
    CONTACTED: { className: "bg-amber-100 text-amber-800 border-amber-200", icon: <PhoneCall className="w-3.5 h-3.5" /> },
    IN_PROGRESS: { className: "bg-purple-100 text-purple-800 border-purple-200", icon: <Loader2 className="w-3.5 h-3.5" /> },
    CONVERTED: { className: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    CLOSED: { className: "bg-slate-100 text-slate-600 border-slate-200", icon: <XCircle className="w-3.5 h-3.5" /> },

    // Application statuses
    DRAFT: { className: "bg-slate-100 text-slate-600 border-slate-200", icon: <FileText className="w-3.5 h-3.5" /> },
    SUBMITTED: { className: "bg-blue-100 text-blue-800 border-blue-200", icon: <ArrowRight className="w-3.5 h-3.5" /> },
    UNDER_REVIEW: { className: "bg-amber-100 text-amber-800 border-amber-200", icon: <AlertCircle className="w-3.5 h-3.5" /> },
    ACCEPTED: { className: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    REJECTED: { className: "bg-red-100 text-red-800 border-red-200", icon: <XCircle className="w-3.5 h-3.5" /> },
    WAITLISTED: { className: "bg-orange-100 text-orange-800 border-orange-200", icon: <Clock className="w-3.5 h-3.5" /> },

    // Document statuses
    PENDING_REVIEW: { className: "bg-blue-100 text-blue-800 border-blue-200", icon: <Clock className="w-3.5 h-3.5" /> },
    APPROVED: { className: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },

    // Invoice statuses
    UNPAID: { className: "bg-red-100 text-red-800 border-red-200", icon: <AlertCircle className="w-3.5 h-3.5" /> },
    PARTIAL: { className: "bg-amber-100 text-amber-800 border-amber-200", icon: <Clock className="w-3.5 h-3.5" /> },
    PAID: { className: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    VOID: { className: "bg-slate-100 text-slate-500 border-slate-200", icon: <XCircle className="w-3.5 h-3.5" /> },

    // Payment statuses
    PENDING: { className: "bg-blue-100 text-blue-800 border-blue-200", icon: <Clock className="w-3.5 h-3.5" /> },
    SUCCESS: { className: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    FAILED: { className: "bg-red-100 text-red-800 border-red-200", icon: <XCircle className="w-3.5 h-3.5" /> },

    // Enrollment statuses
    PROVISIONED: { className: "bg-blue-100 text-blue-800 border-blue-200", icon: <Clock className="w-3.5 h-3.5" /> },
    ACTIVE: { className: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    ON_HOLD: { className: "bg-amber-100 text-amber-800 border-amber-200", icon: <AlertCircle className="w-3.5 h-3.5" /> },
    WITHDRAWN: { className: "bg-red-100 text-red-800 border-red-200", icon: <XCircle className="w-3.5 h-3.5" /> },
    GRADUATED: { className: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

interface StatusBadgeProps {
    status: string;
    showIcon?: boolean;
}

export function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
    const variant = STATUS_MAP[status] || {
        className: "bg-slate-100 text-slate-600 border-slate-200",
        icon: <AlertCircle className="w-3.5 h-3.5" />,
    };

    const label = status.replace(/_/g, " ");

    return (
        <Badge className={`${variant.className} flex w-max items-center gap-1.5 font-medium`}>
            {showIcon && variant.icon}
            {label}
        </Badge>
    );
}
