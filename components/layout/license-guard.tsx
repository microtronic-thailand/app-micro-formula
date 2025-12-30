"use client";

import { useEffect, useState } from "react";
import { getLicenseStatus, updateLicenseKey } from "@/lib/data-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldAlert, Key, CheckCircle2, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function LicenseGuard({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [keyInput, setKeyInput] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const checkLicense = async () => {
        try {
            const res = await getLicenseStatus();
            setStatus(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkLicense();
    }, []);

    const handleUpdateKey = async () => {
        if (!keyInput) return;
        setSubmitting(true);
        try {
            await updateLicenseKey(keyInput);
            toast.success("อัปเดตคีย์สำเร็จ! กำลังรีโหลด...");
            window.location.reload();
        } catch (e: any) {
            toast.error(e.message || "คีย์ไม่ถูกต้อง");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // If license is active or bypassed, show children
    if (status?.isValid) {
        return <>{children}</>;
    }

    // License Invalid or Expired or Missing
    return (
        <div className="flex h-screen items-center justify-center bg-slate-900 p-4">
            <Card className="max-w-md w-full shadow-2xl border-slate-700 bg-slate-800 text-white">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto bg-red-500/20 p-4 rounded-full w-fit group">
                        <Lock className="h-10 w-10 text-red-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold">ระบบถูกระงับการใช้งาน</CardTitle>
                        <CardDescription className="text-slate-400">
                            {status?.status === 'missing'
                                ? "กรุณาใส่ Machine Key เพื่อเปิดใช้งานระบบครั้งแรก"
                                : status?.error || "คีย์ของคุณหมดอายุการใช้งานแล้ว"}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Key size={16} className="text-blue-400" />
                            <span>กรอกรหัสเปิดใช้งาน (License Key)</span>
                        </div>
                        <Input
                            placeholder="LICENSE-XXXX-XXXX..."
                            className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600"
                            value={keyInput}
                            onChange={(e) => setKeyInput(e.target.value)}
                        />
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleUpdateKey}
                            disabled={submitting}
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "ยืนยันรหัสเปิดใช้งาน"}
                        </Button>
                    </div>

                    <div className="text-center space-y-2">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">ติดต่อผู้พัฒนาเพื่อขอรับคีย์</p>
                        <div className="flex justify-center gap-4 text-xs text-slate-400 font-medium">
                            <span className="hover:text-white cursor-pointer transition-colors">Line: @microtronic</span>
                            <span className="text-slate-700">|</span>
                            <span className="hover:text-white cursor-pointer transition-colors">Tel: 02-XXX-XXXX</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
