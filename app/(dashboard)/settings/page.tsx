"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getSettings, saveSettings } from "@/lib/data-service";
import { Loader2, Building2, Image as ImageIcon, Globe } from "lucide-react";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        company_name: "",
        company_logo_url: "",
        company_address: "",
        company_tax_id: "",
        company_phone: "",
        company_email: "",
        website: "",
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getSettings();
                setSettings((prev) => ({ ...prev, ...data }));
            } catch (error) {
                console.error(error);
                toast.error("ไม่สามารถโหลดข้อมูลตั้งค่าได้");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveSettings(settings);
            toast.success("บันทึกการตั้งค่าเรียบร้อยแล้ว");
            // Refresh to update header logo/name
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error("บันทึกไม่สำเร็จ");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">ตั้งค่า (Settings)</h2>
                <p className="text-muted-foreground">
                    จัดการข้อมูลบริษัทและตั้งค่าระบบเบื้องต้น
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-500" />
                        ข้อมูลบริษัท (Company Profile)
                    </CardTitle>
                    <CardDescription>
                        ข้อมูลนี้จะแสดงบนเอกสารใบแจ้งหนี้และใบเสร็จรับเงิน
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">ชื่อบริษัท (ไทย/อังกฤษ)</Label>
                            <Input
                                id="name"
                                value={settings.company_name}
                                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                                placeholder="เช่น บริษัท ไมโครทรอนิก จำกัด"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tax_id">เลขประจำตัวผู้เสียภาษี</Label>
                            <Input
                                id="tax_id"
                                value={settings.company_tax_id}
                                onChange={(e) => setSettings({ ...settings, company_tax_id: e.target.value })}
                                placeholder="เลข 13 หลัก"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">ที่อยู่บริษัท</Label>
                        <Input
                            id="address"
                            value={settings.company_address}
                            onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                            placeholder="เลขที่อาคาร ถนน แขวง/ตำบล..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                            <Input
                                id="phone"
                                value={settings.company_phone}
                                onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                                placeholder="02-xxx-xxxx"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">อีเมลติดต่อบริษัท</Label>
                            <Input
                                id="email"
                                value={settings.company_email}
                                onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                                placeholder="contact@company.com"
                            />
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            โลโก้บริษัท (URL ของรูปภาพ)
                        </Label>
                        <div className="flex gap-4 items-start">
                            <Input
                                id="logo"
                                value={settings.company_logo_url}
                                onChange={(e) => setSettings({ ...settings, company_logo_url: e.target.value })}
                                placeholder="https://example.com/logo.png"
                                className="flex-1"
                            />
                            {settings.company_logo_url && (
                                <div className="h-10 w-10 border rounded p-1 bg-white">
                                    <img
                                        src={settings.company_logo_url}
                                        alt="Logo Preview"
                                        className="h-full w-full object-contain"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">แนะนำเป็นรูปภาพสี่เหลี่ยมจัตุรัส พื้นหลังโปร่งใส (PNG)</p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
                        >
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            บันทึกการตั้งค่า
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
