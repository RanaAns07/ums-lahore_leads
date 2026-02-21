import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FinancePage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-bold tracking-tight text-primary">Finance Ledger</h3>
                <p className="text-muted-foreground">View fund balances, invoices, and expense tracking.</p>
            </div>

            <Card className="border-dashed bg-slate-50/50">
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        Fund Balance visualization, Invoice generation, and Expense tracking will be available here.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
