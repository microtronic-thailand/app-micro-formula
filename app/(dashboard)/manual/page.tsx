"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BookOpen,
    Settings,
    Package,
    Users,
    FileText,
    CreditCard,
    ShieldCheck,
    Lightbulb,
    ArrowRight
} from "lucide-react";

export default function ManualPage() {
    const sections = [
        {
            title: "1. เริ่มต้นใช้งาน (First Steps)",
            icon: <Settings className="h-5 w-5 text-blue-500" />,
            content: "กรอกข้อมูลบริษัทในเมนู 'ตั้งค่า' เพื่อใช้แสดงบนหัวเอกสาร รวมถึงอัปโหลดโลโก้บริษัทของคุณ",
        },
        {
            title: "2. จัดการสินค้าและสต็อก",
            icon: <Package className="h-5 w-5 text-orange-500" />,
            content: "เพิ่มรายการสินค้า กำหนด SKU และรันสต็อก ระบบรองรับการพิมพ์ QR Code เพื่อติดบนตัวสินค้า",
        },
        {
            title: "3. การออกเอกสารการขาย",
            icon: <FileText className="h-5 w-5 text-green-500" />,
            content: "สร้างใบเสนอราคา และแปลงเป็นใบแจ้งหนี้ได้ในคลิกเดียว ระบบคำนวณ VAT และส่วนลดให้อัตโนมัติ",
        },
        {
            title: "4. ระบบลูกหนี้และค่าใช้จ่าย",
            icon: <Users className="h-5 w-5 text-purple-500" />,
            content: "บันทึกฐานข้อมูลลูกค้า และติดตามค่าใช้จ่ายในแต่ละเดือนเพื่อสรุปกำไร-ขาดทุน",
        },
        {
            title: "5. ความปลอดภัยและ Admin",
            icon: <ShieldCheck className="h-5 w-5 text-red-500" />,
            content: "Super Admin สามารถจัดการสิทธิ์พนักงาน และทำ Backup ข้อมูลทั้งหมดเก็บไว้ได้ตลอดเวลา",
        }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl mb-4">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-4xl font-bold text-slate-900">คู่มือการใช้งาน (User Manual)</h1>
                <p className="text-slate-500 text-lg">ทุกสิ่งที่คุณจำเป็นต้องรู้เพื่อเริ่มต้นจัดการบัญชีของคุณ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section, idx) => (
                    <Card key={idx} className="border-slate-200 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className="p-2 bg-slate-50 rounded-lg">
                                {section.icon}
                            </div>
                            <CardTitle className="text-xl">{section.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-600 leading-relaxed">
                                {section.content}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-blue-600 text-white border-none shadow-xl">
                <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-2xl font-bold flex items-center gap-2 justify-center md:justify-start">
                            <Lightbulb className="h-6 w-6 text-yellow-300" />
                            เทคนิคการใช้งาน
                        </h3>
                        <p className="text-blue-100 italic">
                            "อย่าลืมกดสำรองข้อมูล (Backup) ครั้งแรกหลังตั้งค่าเสร็จ เพื่อความปลอดภัยของข้อมูลบริษัทคุณ"
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="text-center text-slate-400 text-sm">
                พบปัญหาการใช้งาน? ติดต่อทีมงานซัพพอร์ตได้ตลอด 24 ชม.
            </div>
        </div>
    );
}
