"use client";

import { useParams, useRouter } from "next/navigation";
import { usePerson, useEnrollments } from "@/hooks/use-students";
import { useInvoices } from "@/hooks/use-finance";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatsCard } from "@/components/shared/StatsCard";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, GraduationCap, Receipt, DollarSign, Calendar, Globe } from "lucide-react";
import Link from "next/link";

export default function StudentProfilePage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: person, isLoading: personLoading } = usePerson(id);
    const { data: enrollments = [], isLoading: enrollLoading } = useEnrollments();
    const { data: allInvoices = [], isLoading: invoicesLoading } = useInvoices();

    // Filter enrollments for this person (via student_profile)
    const studentEnrollments = enrollments.filter(
        (e) => e.student_profile?.person_id === id
    );

    // Find invoices for this student's enrollments
    const enrollmentIds = studentEnrollments.map((e) => e.id);
    const studentInvoices = allInvoices.filter((inv) => enrollmentIds.includes(inv.enrollment_id));

    const totalInvoiced = studentInvoices.reduce((acc, i) => acc + Number(i.total_amount), 0);
    const totalPaid = studentInvoices.reduce((acc, i) => acc + Number(i.paid_amount), 0);
    const totalOutstanding = totalInvoiced - totalPaid;

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

    if (personLoading || enrollLoading || invoicesLoading) return <LoadingSkeleton rows={6} columns={3} />;
    if (!person) return <div className="p-8 text-center text-muted-foreground">Student not found.</div>;

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/students")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h3 className="text-2xl font-bold tracking-tight text-[#002147]">{person.legal_name}</h3>
                    <p className="text-muted-foreground">Student Profile & Financial Summary</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Personal Info */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <User className="w-4 h-4 text-[#FFD700]" /> Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div>
                            <p className="text-xs text-muted-foreground">Full Name</p>
                            <p className="font-medium">{person.legal_name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Date of Birth</p>
                                <p className="font-medium">{person.date_of_birth ? new Date(person.date_of_birth).toLocaleDateString() : "—"}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Gender</p>
                            <p className="font-medium">{person.gender?.replace(/_/g, " ") || "—"}</p>
                        </div>
                        {person.nationality && (
                            <div className="flex items-center gap-3">
                                <Globe className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Nationality</p>
                                    <p className="font-medium">{person.nationality}</p>
                                </div>
                            </div>
                        )}
                        {person.student_profile && (
                            <div className="pt-2 border-t">
                                <p className="text-xs text-muted-foreground">Student ID</p>
                                <p className="font-mono font-semibold text-[#002147]">{person.student_profile.student_id_number}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Financial Summary */}
                <div className="md:col-span-2 space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <StatsCard title="Total Invoiced" value={formatCurrency(totalInvoiced)} icon={Receipt} iconColor="text-blue-500" />
                        <StatsCard title="Total Paid" value={formatCurrency(totalPaid)} icon={DollarSign} iconColor="text-green-500" />
                        <StatsCard title="Outstanding" value={formatCurrency(totalOutstanding)} icon={DollarSign} iconColor="text-amber-500" />
                    </div>

                    {/* Enrollments */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-[#FFD700]" /> Enrollments
                            </CardTitle>
                            <CardDescription>{studentEnrollments.length} enrollment(s)</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {studentEnrollments.length === 0 ? (
                                <div className="text-center py-8 text-sm text-muted-foreground">No enrollments found.</div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold">Program</th>
                                            <th className="px-4 py-3 text-left font-semibold">Batch</th>
                                            <th className="px-4 py-3 text-left font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentEnrollments.map((enr) => (
                                            <tr key={enr.id} className="border-b last:border-0 hover:bg-slate-50/50">
                                                <td className="px-4 py-3 font-medium">{enr.program?.name} ({enr.program?.code})</td>
                                                <td className="px-4 py-3 font-mono text-xs">{enr.batch_id}</td>
                                                <td className="px-4 py-3"><StatusBadge status={enr.status} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Invoices for this student */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-[#FFD700]" /> Invoices
                            </CardTitle>
                            <CardDescription>{studentInvoices.length} invoice(s)</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {studentInvoices.length === 0 ? (
                                <div className="text-center py-8 text-sm text-muted-foreground">No invoices found.</div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold">Invoice</th>
                                            <th className="px-4 py-3 text-left font-semibold">Due Date</th>
                                            <th className="px-4 py-3 text-left font-semibold">Status</th>
                                            <th className="px-4 py-3 text-right font-semibold">Total</th>
                                            <th className="px-4 py-3 text-right font-semibold">Paid</th>
                                            <th className="px-4 py-3 text-right font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentInvoices.map((inv) => (
                                            <tr key={inv.id} className="border-b last:border-0 hover:bg-slate-50/50">
                                                <td className="px-4 py-3 font-mono text-xs text-slate-500">{inv.id.slice(0, 8)}...</td>
                                                <td className="px-4 py-3 text-slate-500">{new Date(inv.due_date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                                                <td className="px-4 py-3 text-right font-medium">{formatCurrency(Number(inv.total_amount))}</td>
                                                <td className="px-4 py-3 text-right text-green-600">{formatCurrency(Number(inv.paid_amount))}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button size="sm" variant="ghost" asChild>
                                                        <Link href={`/finance/invoices/${inv.id}`}>View</Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
