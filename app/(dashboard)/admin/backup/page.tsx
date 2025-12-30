"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Download,
    Upload,
    Database,
    AlertTriangle,
    Loader2,
    CheckCircle2,
    History,
    FileJson
} from "lucide-react";
import { exportData, importData } from "@/lib/data-service";
import { Separator } from "@/components/ui/separator";

const TABLES = [
    "profiles",
    "customers",
    "products",
    "invoices",
    "invoice_items",
    "expenses",
    "quotations",
    "quotation_items",
    "settings",
    "announcements"
];

export default function BackupPage() {
    const { profile } = useProfile();
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    if (profile?.role !== 'super_admin') {
        return (
            <div className="flex h-[400px] items-center justify-center text-slate-500">
                คุณไม่มีสิทธิ์เข้าถึงหน้านี้
            </div>
        );
    }

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const backupData = await exportData();

            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `backup-microaccount-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success("ส่งออกข้อมูลสำรองเรียบร้อยแล้ว");
        } catch (error: any) {
            console.error(error);
            toast.error("เกิดข้อผิดพลาดในการส่งออก: " + error.message);
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const confirmRestore = confirm("คำเตือน: การนำเข้าข้อมูลสำรองจะทำการเขียนทับข้อมูลเดิมที่มี ID ตรงกัน คุณต้องการดำเนินการต่อหรือไม่?");
        if (!confirmRestore) {
            event.target.value = "";
            return;
        }

        setIsImporting(true);
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target?.result as string);
                    toast.loading(`กำลังนำเข้าข้อมูล...`, { id: 'import-status' });

                    await importData(data);

                    toast.success("นำเข้าข้อมูลสำรองสำเร็จแล้ว ระบบจะรีโหลดเพื่อความถูกต้อง", { id: 'import-status' });
                    setTimeout(() => window.location.reload(), 2000);
                } catch (err: any) {
                    toast.error("ไฟล์ข้อมูลไม่ถูกต้อง: " + err.message, { id: 'import-status' });
                    setIsImporting(false);
                }
            };
            reader.readAsText(file);
        } catch (error) {
            setIsImporting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">สำรองและกู้คืนข้อมูล (Backup & Restore)</h2>
                    <p className="text-muted-foreground">
                        จัดการความปลอดภัยของข้อมูลบริษัทของคุณ
                    </p>
                </div>
                <Database className="h-10 w-10 text-blue-500 opacity-20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Backup Card */}
                <Card className="border-blue-100 shadow-sm overflow-hidden group hover:border-blue-300 transition-all">
                    <div className="h-2 bg-blue-500" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-blue-600" />
                            สำรองข้อมูล (Backup)
                        </CardTitle>
                        <CardDescription>ดาวน์โหลดข้อมูลทั้งหมดในระบบเป็นไฟล์ JSON</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-slate-600 leading-relaxed">
                            ระบบจะรวบรวมข้อมูล ลูกค้า, สินค้า, ใบแจ้งหนี้ และการตั้งค่าทั้งหมดของคุณ
                            เก็บไว้เป็นไฟล์เดียวเพื่อความปลอดภัย
                        </p>
                        <ul className="text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-lg">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-3 w-3 text-green-500" /> รวมข้อมูล 10 ตารางหลัก
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-3 w-3 text-green-500" /> ฟอร์แมต JSON มาตรฐาน
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-3 w-3 text-green-500" /> สามารถนำมา Restore ได้ภายหลัง
                            </li>
                        </ul>
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 h-12"
                            onClick={handleExport}
                            disabled={isExporting}
                        >
                            {isExporting ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> กำลังประมวลผล...</>
                            ) : (
                                <><Download className="mr-2 h-5 w-5" /> สร้างไฟล์สำรองข้อมูล</>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Restore Card */}
                <Card className="border-orange-100 shadow-sm overflow-hidden group hover:border-orange-300 transition-all">
                    <div className="h-2 bg-orange-500" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-orange-600" />
                            กู้คืนข้อมูล (Restore)
                        </CardTitle>
                        <CardDescription>อัปโหลดไฟล์สำรองเพื่อกู้คืนฐานข้อมูล</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                            <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-orange-800">
                                <span className="font-bold underline">ข้อควรระวัง</span>:
                                การกู้คืนจะเขียนทับข้อมูลที่มี ID เดียวกัน และอาจทำให้เกิดความซ้ำซ้อน
                                แนะนำให้สำรองข้อมูลปัจจุบันไว้ก่อนเสมอ
                            </p>
                        </div>
                        <p className="text-sm text-slate-600">
                            เลือกไฟล์ `.json` ที่คุณเคยดาวน์โหลดไว้จากระบบเพื่อเริ่มการกู้คืน
                        </p>

                        <div className="relative">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                disabled={isImporting}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            />
                            <Button
                                variant="outline"
                                className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 h-12"
                                disabled={isImporting}
                            >
                                {isImporting ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> กำลังนำเข้าข้อมูล...</>
                                ) : (
                                    <><FileJson className="mr-2 h-5 w-5" /> เลือกไฟล์สำรองและกู้คืน</>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Information Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <History className="h-5 w-5 text-slate-500" />
                        คำแนะนำการใช้งาน
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-2">
                    <p>1. <strong>ความปลอดภัย</strong>: ข้อมูลสำรองจะเก็บรหัสผ่านที่เข้ารหัสไว้ แต่ไม่รวมถึงเซสชั่นการล็อกอินปัจจุบัน</p>
                    <p>2. <strong>ความต่อเนื่อง</strong>: หากมีการนำเข้าข้อมูล ยอดคงเหลือในสต็อกและประวัติเอกสารจะถูกอัปเดตตามไฟล์ที่เลือก</p>
                    <p>3. <strong>การย้ายเครื่อง</strong>: คุณสามารถใช้ฟีเจอร์นี้ในการย้ายข้อมูลจาก Local Dev ไปยัง Production ได้อย่างง่ายดาย</p>
                </CardContent>
            </Card>
        </div>
    );
}
