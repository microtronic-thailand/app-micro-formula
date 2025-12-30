"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
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
import { toast } from "sonner";
import { Loader2, ShieldAlert } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";

const schema = z.object({
    password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"]
});

export default function ChangePasswordPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { profile } = useProfile();

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            password: "",
            confirmPassword: ""
        }
    });

    async function onSubmit(values: z.infer<typeof schema>) {
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: values.password
            });

            if (error) throw error;

            // Clear force change flag in profile
            if (profile) {
                await supabase
                    .from('profiles')
                    .update({ must_change_password: false })
                    .eq('id', profile.id);
            }

            toast.success("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
            router.push("/dashboard");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-md mx-auto py-12">
            <Card className="border-red-100 shadow-md">
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                        <ShieldAlert className="h-5 w-5" />
                        <span className="font-bold">บังคับเปลี่ยนรหัสผ่าน</span>
                    </div>
                    <CardTitle className="text-2xl">ตั้งค่ารหัสผ่านใหม่</CardTitle>
                    <CardDescription>
                        เพื่อความปลอดภัยของบัญชี กรุณาเปลี่ยนรหัสผ่านใหม่ก่อนเข้าใช้งานระบบ
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>รหัสผ่านใหม่</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ยืนยันรหัสผ่านใหม่</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                บันทึกรหัสผ่านใหม่
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
