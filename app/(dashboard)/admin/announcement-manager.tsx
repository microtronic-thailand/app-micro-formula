"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from "@/lib/data-service";
import { Announcement } from "@/types";
import { toast } from "sonner";
import { Loader2, Plus, Megaphone, Trash2, Clock } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export function AnnouncementManager() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    useEffect(() => {
        loadAnnouncements();
    }, []);

    async function loadAnnouncements() {
        try {
            const data = await getAnnouncements();
            setAnnouncements(data);
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถโหลดประกาศได้");
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate() {
        if (!title || !content) {
            toast.error("กรุณากรอกหัวข้อและเนื้อหาประกาศ");
            return;
        }

        setIsCreating(true);
        try {
            await createAnnouncement({ title, content });
            setTitle("");
            setContent("");
            toast.success("สร้างประกาศเรียบร้อยแล้ว");
            loadAnnouncements();
        } catch (error) {
            console.error(error);
            toast.error("เกิดข้อผิดพลาดในการสร้างประกาศ");
        } finally {
            setIsCreating(false);
        }
    }

    async function handleDelete(id: string) {
        try {
            await deleteAnnouncement(id);
            toast.success("ลบประกาศเรียบร้อยแล้ว");
            loadAnnouncements();
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถลบประกาศได้");
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-blue-500" />
                        สร้างประกาศใหม่
                    </CardTitle>
                    <CardDescription>ส่งข้อความแจ้งเตือนผู้ใช้งานทุกคนในระบบ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">หัวข้อประกาศ</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="เช่น: แจ้งปิดปรับปรุงระบบคืนนี้"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">เนื้อหา</Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="รายละเอียดของประกาศ..."
                            rows={4}
                        />
                    </div>
                    <Button onClick={handleCreate} disabled={isCreating} className="w-full">
                        {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        สร้างและลงประกาศ
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>รายการประกาศที่กำลังแสดง</CardTitle>
                    <CardDescription>จัดการประกาศที่ระบบกำลังแสดงผลอยู่</CardDescription>
                </CardHeader>
                <CardContent>
                    {announcements.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground italic">
                            ไม่มีประกาศที่ใช้งานอยู่
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {announcements.map((a) => (
                                <div key={a.id} className="border rounded-lg p-4 space-y-2 relative group hover:bg-slate-50 transition-colors">
                                    <div className="font-bold flex items-center justify-between">
                                        <span className="pr-8">{a.title}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50"
                                            onClick={() => handleDelete(a.id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                    <p className="text-sm text-slate-600 line-clamp-2">{a.content}</p>
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <Clock size={10} />
                                        {format(new Date(a.createdAt), "d MMM yyyy HH:mm", { locale: th })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
