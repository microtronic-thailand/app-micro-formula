"use client";

import { useProfile } from "@/hooks/use-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Shield, Calendar, Award, LogOut } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";

export default function ProfilePage() {
    const { profile, loading } = useProfile();

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!profile) return null;

    const roleMap = {
        'super_admin': { label: 'ผู้ดูแลระบบสูงสุด', color: 'bg-red-100 text-red-700 border-red-200' },
        'admin': { label: 'ผู้ดูแลระบบ', color: 'bg-orange-100 text-orange-700 border-orange-200' },
        'user': { label: 'พนักงานทั่วไป', color: 'bg-blue-100 text-blue-700 border-blue-200' }
    };

    const currentRole = roleMap[profile.role] || roleMap['user'];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">โปรไฟล์ส่วนตัว (Profile)</h2>
                <p className="text-muted-foreground">
                    ข้อมูลบัญชีและระดับการเข้าถึงระบบของคุณ
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Summary Card */}
                <Card className="md:col-span-1 shadow-sm border-slate-200">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <Avatar className="h-24 w-24 mb-4 ring-4 ring-white shadow-lg">
                            <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold">
                                {profile.email[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-xl text-slate-800">{profile.email.split('@')[0]}</h3>
                        <Badge variant="outline" className={`mt-2 ${currentRole.color}`}>
                            {currentRole.label}
                        </Badge>

                        <div className="w-full mt-6 pt-6 border-t border-slate-100 space-y-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Award className="h-4 w-4 text-amber-500" />
                                <span className="font-medium">คะแนนสะสม: {profile.points} แต้ม</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <span>เป็นสมาชิกเมื่อ: {format(new Date(profile.createdAt), 'd MMM yyyy', { locale: th })}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Details Card */}
                <Card className="md:col-span-2 shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle>ข้อมูลบัญชี</CardTitle>
                        <CardDescription>รายละเอียดเชิงลึกของบัญชีผู้ใช้</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">อีเมลล็อกอิน</p>
                                <div className="flex items-center gap-2 text-slate-700">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                    <span className="font-medium">{profile.email}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">บทบาทในระบบ</p>
                                <div className="flex items-center gap-2 text-slate-700">
                                    <Shield className="h-4 w-4 text-slate-400" />
                                    <span className="font-medium">{currentRole.label}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-4">สมาขิกภาพและแต้มสะสม</h4>
                            <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100 transition-all hover:shadow-md">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-xl font-bold">
                                        ✨
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{profile.points} Points</p>
                                        <p className="text-xs text-slate-500">สะสมแต้มจากการใช้งานระบบเป็นประจำ</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-blue-600">ดูสิทธิพิเศษ</Button>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
                            <Link href="/settings/password" className="flex-1">
                                <Button variant="outline" className="w-full">
                                    เปลี่ยนรหัสผ่าน
                                </Button>
                            </Link>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={async () => {
                                    const { supabase } = await import('@/lib/supabase');
                                    await supabase.auth.signOut();
                                    window.location.href = '/login';
                                }}
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                ออกจากระบบ
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
