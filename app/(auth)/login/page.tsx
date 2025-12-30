"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { localLogin, localRegister } from "@/lib/data-service";
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
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

const authSchema = z.object({
    email: z.string().email({ message: "อีเมลไม่ถูกต้อง" }),
    password: z.string().min(6, { message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }),
});

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof authSchema>>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const isLocal = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost') || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_USE_LOCAL_DB === 'true';

    async function onLogin(values: z.infer<typeof authSchema>) {
        setIsLoading(true);
        try {
            if (isLocal) {
                // REAL LOCAL LOGIN via Docker Postgres
                const profile = await localLogin(values.email);
                const mockUser = {
                    id: profile.id,
                    email: profile.email,
                    aud: 'authenticated',
                    role: 'authenticated',
                    created_at: profile.createdAt
                };
                localStorage.setItem('local_user', JSON.stringify(mockUser));
                toast.success("เข้าสู่ระบบเรียบร้อย (Docker Local)");
                router.push("/dashboard");
                return;
            }

            const { error } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
            });

            if (error) {
                toast.error("เข้าสู่ระบบไม่สำเร็จ: " + error.message);
                return;
            }

            toast.success("เข้าสู่ระบบสำเร็จ");
            router.push("/dashboard");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        } finally {
            setIsLoading(false);
        }
    }

    async function onRegister(values: z.infer<typeof authSchema>) {
        setIsLoading(true);
        try {
            if (isLocal) {
                // REAL LOCAL REGISTER via Docker Postgres
                await localRegister(values.email);
                toast.success("สมัครสมาชิกสำเร็จ (Docker Local)");
                await onLogin(values);
                return;
            }

            const { error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
            });

            if (error) {
                toast.error("สมัครสมาชิกไม่สำเร็จ: " + error.message);
                return;
            }

            toast.success("สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน (ถ้ามี) หรือลองเข้าสู่ระบบ");
            await onLogin(values);

        } catch (error: any) {
            toast.error(error.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">เข้าสู่ระบบ</TabsTrigger>
                <TabsTrigger value="register">สมัครสมาชิก</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
                <Card>
                    <CardHeader>
                        <CardTitle>เข้าสู่ระบบ</CardTitle>
                        <CardDescription>
                            กรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งาน
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onLogin)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>อีเมล</FormLabel>
                                            <FormControl>
                                                <Input placeholder="name@example.com" {...field} />
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
                                            <FormLabel>รหัสผ่าน</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="********" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    เข้าสู่ระบบ
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="register">
                <Card>
                    <CardHeader>
                        <CardTitle>สมัครสมาชิกใหม่</CardTitle>
                        <CardDescription>
                            สร้างบัญชีผู้ใช้ใหม่เพื่อเริ่มใช้งานระบบ
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onRegister)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>อีเมล</FormLabel>
                                            <FormControl>
                                                <Input placeholder="name@example.com" {...field} />
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
                                            <FormLabel>รหัสผ่าน</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="********" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    สมัครสมาชิก
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
