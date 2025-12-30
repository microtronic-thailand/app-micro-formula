"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSettings, updateSetting } from "@/lib/data-service";
import { toast } from "sonner";
import { Loader2, Save, Image as ImageIcon } from "lucide-react";

export function SystemSettingsForm() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        try {
            const data = await getSettings();
            setSettings(data);
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถโหลดตั้งค่าได้");
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setIsSaving(true);
        try {
            await updateSetting('company_name', settings.company_name || 'Microtronic Account');
            await updateSetting('company_logo_url', settings.company_logo_url || '');
            toast.success("บันทึกตั้งค่าเรียบร้อยแล้ว");
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถบันทึกตั้งค่าได้");
        } finally {
            setIsSaving(false);
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
        <Card>
            <CardHeader>
                <CardTitle>ตั้งค่าระบบ (System Settings)</CardTitle>
                <CardDescription>จัดการข้อมูลบริษัทและโลโก้ที่ใช้ในเอกสารและหน้าเว็บ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="company_name">ชื่อบริษัท (Company Name)</Label>
                    <Input
                        id="company_name"
                        value={settings.company_name || ""}
                        onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                        placeholder="กรอกชื่อบริษัท..."
                    />
                </div>

                <div className="space-y-4">
                    <Label htmlFor="company_logo_url">โลโก้บริษัท (Logo URL)</Label>
                    <div className="flex gap-4 items-start">
                        <div className="flex-1 space-y-2">
                            <Input
                                id="company_logo_url"
                                value={settings.company_logo_url || ""}
                                onChange={(e) => setSettings({ ...settings, company_logo_url: e.target.value })}
                                placeholder="https://example.com/logo.png"
                            />
                            <p className="text-xs text-muted-foreground italic">
                                * ใส่ URL ของรูปภาพโลโก้ที่ต้องการแสดงในระบบและหัวเอกสาร
                            </p>
                        </div>
                        <div className="h-24 w-24 border rounded-lg flex items-center justify-center bg-slate-50 overflow-hidden">
                            {settings.company_logo_url ? (
                                <img src={settings.company_logo_url} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                            ) : (
                                <ImageIcon className="h-8 w-8 text-slate-300" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        บันทึกการเปลี่ยนแปลง
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
