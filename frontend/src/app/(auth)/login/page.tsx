"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email: values.email,
                password: values.password,
            });

            if (res?.error) {
                toast({
                    title: "Authentication Failed",
                    description: "Invalid email or password. Please try again.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Welcome back!",
                    description: "Successfully logged in.",
                });
                router.push("/admissions/inquiries");
                router.refresh();
            }
        } catch {
            toast({
                title: "Error",
                description: "An unexpected error occurred. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
            <Card className="w-full max-w-md z-10 border-none shadow-2xl">
                <CardHeader className="space-y-1 text-center pb-8 border-b border-border/50 bg-slate-50/50 rounded-t-xl mb-4">
                    <div className="mx-auto bg-primary text-secondary h-16 w-16 rounded-full flex items-center justify-center mb-4 shadow-inner text-2xl font-black relative overflow-hidden">
                        <span className="relative z-10">LLU</span>
                        <div className="absolute inset-0 bg-secondary/10"></div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-primary">Leads University</CardTitle>
                    <CardDescription className="text-muted-foreground font-medium">
                        Enter your credentials to access the UMS
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 px-8 pb-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="admin@ums.edu" className="h-11 bg-slate-50" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" className="h-11 bg-slate-50" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md active:scale-[0.98] transition-all" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
