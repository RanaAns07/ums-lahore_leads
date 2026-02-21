"use client";

import { useParams, useRouter } from "next/navigation";
import { useInquiry, useUpdateInquiryStatus, useAddInquiryNote, useConvertInquiry } from "@/hooks/use-admissions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Mail, Phone, Calendar, Globe, User, MessageSquare, Bot, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import type { InquiryStatus } from "@/types";

const addNoteSchema = z.object({
    note_text: z.string().min(1, "Note text is required"),
});

type AddNoteForm = z.infer<typeof addNoteSchema>;

const STATUSES: InquiryStatus[] = ["NEW", "CONTACTED", "IN_PROGRESS", "CONVERTED", "CLOSED"];

export default function InquiryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: inquiry, isLoading } = useInquiry(id);
    const updateStatus = useUpdateInquiryStatus();
    const addNote = useAddInquiryNote();
    const convertInquiry = useConvertInquiry();

    const [convertDialogOpen, setConvertDialogOpen] = useState(false);
    const [batchId, setBatchId] = useState("FALL-2026");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<AddNoteForm>({ resolver: zodResolver(addNoteSchema) as any, defaultValues: { note_text: "" } });

    const onSubmitNote = (data: AddNoteForm) => {
        addNote.mutate({ id, note_text: data.note_text });
        form.reset();
    };

    if (isLoading) return <LoadingSkeleton rows={8} columns={3} />;
    if (!inquiry) return <div className="p-8 text-center text-muted-foreground">Inquiry not found.</div>;

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/admissions/inquiries")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h3 className="text-2xl font-bold tracking-tight text-[#002147]">
                        {inquiry.first_name} {inquiry.last_name}
                    </h3>
                    <p className="text-muted-foreground">Inquiry submitted on {new Date(inquiry.created_at).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={inquiry.status} />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Contact Info */}
                <Card className="md:col-span-1 border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <User className="w-4 h-4 text-[#FFD700]" /> Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <a href={`mailto:${inquiry.email}`} className="text-blue-600 hover:underline">{inquiry.email}</a>
                        </div>
                        {inquiry.phone && (
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span className="font-mono">{inquiry.phone}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-sm">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{inquiry.source}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{new Date(inquiry.created_at).toLocaleString()}</span>
                        </div>
                        {inquiry.program && (
                            <div className="pt-2 border-t">
                                <p className="text-xs text-muted-foreground mb-1">Interested Program</p>
                                <p className="font-medium text-sm">{inquiry.program.name} ({inquiry.program.code})</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Actions + Notes */}
                <div className="md:col-span-2 space-y-6">
                    {/* Actions */}
                    <PermissionGate permission="admissions.write">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Change status:</span>
                                    <Select
                                        value={inquiry.status}
                                        onValueChange={(value) => updateStatus.mutate({ id, status: value as InquiryStatus })}
                                        disabled={updateStatus.isPending}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STATUSES.map((s) => (
                                                <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {inquiry.status === "CONTACTED" && (
                                    <Button
                                        className="bg-[#FFD700] hover:bg-yellow-500 text-[#002147] font-semibold"
                                        onClick={() => setConvertDialogOpen(true)}
                                    >
                                        Convert to Application
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </PermissionGate>

                    {/* Notes Timeline */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-[#FFD700]" /> Notes & Activity
                            </CardTitle>
                            <CardDescription>{inquiry.notes?.length || 0} entries</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Add Note Form */}
                            <PermissionGate permission="admissions.write">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmitNote)} className="flex gap-2 mb-6">
                                        <FormField
                                            control={form.control}
                                            name="note_text"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input placeholder="Add a note..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" disabled={addNote.isPending} className="bg-[#002147] hover:bg-[#002147]/90">
                                            <Send className="w-4 h-4 mr-1" /> Send
                                        </Button>
                                    </form>
                                </Form>
                            </PermissionGate>

                            {/* Notes List */}
                            <div className="space-y-3">
                                {(!inquiry.notes || inquiry.notes.length === 0) ? (
                                    <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                                        No notes yet. Add the first note above.
                                    </div>
                                ) : (
                                    [...inquiry.notes].reverse().map((note) => (
                                        <div key={note.id} className="flex gap-3 p-3 rounded-lg border bg-white hover:bg-slate-50/50 transition-colors">
                                            <div className={`rounded-full p-2 h-max ${note.is_system_generated ? "bg-slate-100" : "bg-blue-50"}`}>
                                                {note.is_system_generated ? (
                                                    <Bot className="w-4 h-4 text-slate-500" />
                                                ) : (
                                                    <MessageSquare className="w-4 h-4 text-blue-500" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-medium text-slate-700">
                                                        {note.is_system_generated ? "System" : note.actor?.legal_name || "Staff"}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">{new Date(note.created_at).toLocaleString()}</span>
                                                </div>
                                                <p className="text-sm text-slate-600">{note.note_text || "Status change recorded."}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Convert Dialog */}
            <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Convert Inquiry to Application</DialogTitle>
                        <DialogDescription>
                            Convert {inquiry.first_name} {inquiry.last_name} into an active applicant.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="batch_id" className="text-right">Batch</Label>
                            <Input
                                id="batch_id" value={batchId} onChange={(e) => setBatchId(e.target.value)}
                                className="col-span-3" placeholder="e.g. FALL-2026"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-[#002147] text-white hover:bg-[#002147]/90"
                            disabled={convertInquiry.isPending}
                            onClick={() => {
                                convertInquiry.mutate({ id, program_id: inquiry.program_id, batch_id: batchId });
                                setConvertDialogOpen(false);
                            }}
                        >
                            {convertInquiry.isPending ? "Converting..." : "Confirm Conversion"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
