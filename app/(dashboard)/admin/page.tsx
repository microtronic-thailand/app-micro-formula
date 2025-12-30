"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    getAllProfiles,
    updateUserRole,
    toggleForcePassword
} from "@/lib/data-service";
import { Profile, UserRole } from "@/types";
import { useProfile } from "@/hooks/use-profile";
import { SystemSettingsForm } from "./settings-form";
import { AnnouncementManager } from "./announcement-manager";
import {
    Loader2,
    Shield,
    User,
    MoreVertical,
    Check,
    X,
    ShieldCheck,
    ShieldAlert
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function AdminDashboardPage() {
    const router = useRouter();
    const { profile, loading: profileLoading } = useProfile();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profileLoading) {
            if (profile?.role !== 'super_admin') {
                router.push("/dashboard");
                return;
            }
            loadProfiles();
        }
    }, [profile, profileLoading, router]);

    async function loadProfiles() {
        setLoading(true);
        try {
            const data = await getAllProfiles();
            setProfiles(data);
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถโหลดข้อมูลผู้ใช้งานได้");
        } finally {
            setLoading(false);
        }
    }

    async function handleToggleForcePassword(userId: string, currentStatus: boolean) {
        try {
            await toggleForcePassword(userId, currentStatus);
            toast.success(!currentStatus ? "บังคับเปลี่ยนรหัสผ่านแล้ว" : "ยกเลิกการบังคับเปลี่ยนรหัสผ่านแล้ว");
            loadProfiles();
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถดำเนินการได้");
        }
    }
    async function handleRoleChange(userId: string, newRole: UserRole) {
        try {
            await updateUserRole(userId, newRole);
            toast.success("อัปเดตสิทธิ์ผู้ใช้งานสำเร็จ");
            loadProfiles();
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถอัปเดตสิทธิ์ได้");
        }
    }

    if (profileLoading || (profile?.role === 'super_admin' && loading)) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (profile?.role !== 'super_admin') {
        return null; // Redirecting...
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <ShieldCheck className="h-8 w-8 text-yellow-500" />
                        Admin Dashboard
                    </h2>
                    <p className="text-muted-foreground">
                        จัดการสิทธิ์การเข้าถึงและการใช้งานของสมาชิกในองค์กร
                    </p>
                </div>
            </div>

            <Tabs defaultValue="users" className="space-y-6">
                <TabsList className="bg-white border">
                    <TabsTrigger value="users">ผู้ใช้งาน (Users)</TabsTrigger>
                    <TabsTrigger value="announcements">ประกาศระบบ (Announcements)</TabsTrigger>
                    <TabsTrigger value="settings">ตั้งค่าระบบ (Settings)</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-6">
                    <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-[300px]">อีเมลผู้ใช้งาน</TableHead>
                                    <TableHead>สิทธิ์การใช้งาน</TableHead>
                                    <TableHead>วันที่เข้าร่วม</TableHead>
                                    <TableHead className="text-right">จัดการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {profiles.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${p.role === 'super_admin' ? 'bg-yellow-500' :
                                                    p.role === 'admin' ? 'bg-blue-500' : 'bg-slate-400'
                                                    }`}>
                                                    {p.role === 'super_admin' ? <ShieldCheck size={16} /> :
                                                        p.role === 'admin' ? <Shield size={16} /> : <User size={16} />}
                                                </div>
                                                {p.email}
                                                {p.id === profile?.id && (
                                                    <Badge variant="outline" className="ml-2 text-[10px]">YOU</Badge>
                                                )}
                                                {p.points > 0 && (
                                                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
                                                        {p.points} Pts
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    p.role === 'super_admin' ? "default" :
                                                        p.role === 'admin' ? "secondary" : "outline"
                                                }
                                                className={
                                                    p.role === 'super_admin' ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200" :
                                                        p.role === 'admin' ? "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200" : ""
                                                }
                                            >
                                                {p.role === 'super_admin' ? 'Super Admin' :
                                                    p.role === 'admin' ? 'Admin' : 'User'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-sm">
                                            {format(new Date(p.createdAt), "d MMMM yyyy", { locale: th })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {p.role !== 'super_admin' ? (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleRoleChange(p.id, 'admin')}>
                                                            <Shield className="h-4 w-4 mr-2 text-blue-500" />
                                                            เปลี่ยนเป็น Admin
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleRoleChange(p.id, 'user')}>
                                                            <User className="h-4 w-4 mr-2 text-slate-500" />
                                                            เปลี่ยนเป็น User
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggleForcePassword(p.id, p.mustChangePassword)} className="text-red-600">
                                                            <ShieldAlert className="h-4 w-4 mr-2" />
                                                            {p.mustChangePassword ? "ยกเลิกบังคับเปลี่ยนรหัส" : "บังคับเปลี่ยนรหัสผ่าน"}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : (
                                                <span className="text-xs text-slate-400 px-3 italic">System Default</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="announcements">
                    <AnnouncementManager />
                </TabsContent>

                <TabsContent value="settings">
                    <SystemSettingsForm />
                </TabsContent>
            </Tabs>
        </div>
    );
}
