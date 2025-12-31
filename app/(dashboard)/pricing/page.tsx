"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Shield, Crown, Terminal, Laptop, Settings, Globe, HardDrive, GraduationCap, Wrench } from "lucide-react";

export default function PricingPage() {
    const plans = [
        {
            name: "Standard (เริ่มต้น)",
            price: "30,000.-",
            description: "สำหรับผู้ที่ต้องการติดตั้งและดูแลเอง",
            features: [
                "ซื้อขาดได้ Source Code 100%",
                "ติดตั้งเองได้ถาวร",
                "คู่มือการติดตั้งละเอียด",
                "ไม่มีค่ารายเดือน"
            ],
            icon: <Terminal className="h-6 w-6 text-slate-500" />,
            buttonText: "สั่งซื้อเฉพาะ Code",
            variant: "outline"
        },
        {
            name: "Professional",
            price: "50,000.-",
            description: "พร้อมใช้งานทันที มีคนดูแล",
            features: [
                "Software ครบทุกโมดูล",
                "บริการติดตั้งให้พร้อมใช้งาน",
                "ปรับแก้ข้อมูลเบื้องต้นให้",
                "รับประกันระบบ 1 เดือน"
            ],
            icon: <Zap className="h-6 w-6 text-orange-500" />,
            buttonText: "สั่งซื้อพร้อมติดตั้ง",
            variant: "default",
            popular: true
        },
        {
            name: "Enterprise",
            price: "80,000.-",
            description: "ดูแลครบวงจร ตลอดทั้งปี",
            features: [
                "Software + ติดตั้ง + ปรับแก้",
                "รวมค่า Maintenance 1 ปี",
                "ดูแลระบบให้เดือนละ 2 ครั้ง",
                "สิทธิ์ขอแก้ไขโมดูลพิเศษ"
            ],
            icon: <Crown className="h-6 w-6 text-blue-600" />,
            buttonText: "ติดต่อเหมาจ่ายรายปี",
            variant: "default"
        }
    ];

    const additionalServices = [
        { name: "อบรมการใช้งาน", price: "3,000.- / ครั้ง", icon: <GraduationCap className="h-4 w-4" /> },
        { name: "เพิ่ม/แก้ไขโมดูล", price: "3,000.- / จุด", icon: <Wrench className="h-4 w-4" /> },
        { name: "แก้ไขข้อมูล", price: "2,000.- / ครั้ง", icon: <Settings className="h-4 w-4" /> },
        { name: "เมนทาแนนท์รายครั้ง", price: "2,000.- / ครั้ง", icon: <Laptop className="h-4 w-4" /> },
        { name: "เมนทาแนนท์รายปี", price: "36,000.- / ปี", icon: <Shield className="h-4 w-4" /> },
        { name: "บริการเช่าโฮส", price: "2,000.- / ปี", icon: <HardDrive className="h-4 w-4" /> },
        { name: "บริการเช่าโดเมน", price: "1,500.- / ปี", icon: <Globe className="h-4 w-4" /> },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-slate-900">
                    แผนราคาและ <span className="text-blue-600">บริการเสริม</span>
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                    เลือกคุณภาพที่คุ้มค่า เพื่อความมั่นคงของระบบบัญชีคุณ
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, idx) => (
                    <Card key={idx} className={`relative flex flex-col border-2 ${plan.popular ? 'border-blue-600 shadow-xl scale-105 z-10' : 'border-slate-100 shadow-sm'}`}>
                        {plan.popular && (
                            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600">
                                แนะนำสำหรับ SME
                            </Badge>
                        )}
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto p-3 bg-slate-50 rounded-full w-fit mb-4">
                                {plan.icon}
                            </div>
                            <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                            <CardDescription className="text-2xl font-bold text-slate-900 mt-2">
                                {plan.price}
                            </CardDescription>
                            <p className="text-sm text-slate-500 mt-2">{plan.description}</p>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4 pt-6">
                            <ul className="space-y-3">
                                {plan.features.map((feature, fIdx) => (
                                    <li key={fIdx} className="flex items-center gap-3 text-sm text-slate-600">
                                        <Check className="h-4 w-4 text-blue-500 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <div className="p-6 pt-0 mt-auto">
                            <Button className="w-full h-12 text-lg" variant={plan.variant as any}>
                                {plan.buttonText}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="pt-10 border-t border-slate-100">
                <h2 className="text-2xl font-bold text-center mb-8">บริการเสริมอื่น ๆ (Additional Services)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                    {additionalServices.map((service, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-white hover:border-blue-300 transition-all group">
                            <div className="flex items-center gap-3 font-medium">
                                <div className="p-2 bg-white rounded-lg shadow-sm border group-hover:border-blue-200">{service.icon}</div>
                                <span className="text-sm md:text-base">{service.name}</span>
                            </div>
                            <div className="font-bold text-blue-600 text-sm md:text-base">{service.price}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
