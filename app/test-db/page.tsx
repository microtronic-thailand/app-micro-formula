"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function TestDbPage() {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");
    const [envCheck, setEnvCheck] = useState<any>({});

    useEffect(() => {
        async function checkConnection() {
            // 1. ตรวจสอบค่า Environment Variables
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            setEnvCheck({
                url: url ? `Found (${url.substring(0, 15)}...)` : "Missing",
                key: key ? `Found (${key.substring(0, 10)}...)` : "Missing"
            });

            if (!url || !key || url.includes("your-project")) {
                setStatus("error");
                setMessage("กรุณาตั้งค่า .env.local ให้ถูกต้องก่อน");
                return;
            }

            try {
                // 2. ลองเชื่อมต่อจริง (ดึงข้อมูล Session หรือ Table ง่ายๆ)
                // เนื่องจากยังไม่มี Table เราจะเช็ค auth session แทนเบื้องต้น
                // หรือถ้าอยากเช็ค DB จริงๆ อาจจะลอง select * from something (ซึ่งจะ error ว่า table not found แต่แปลว่า connect ติด)

                // ลอง ping ด้วยการดึง auth settings (ไม่ต้อง login)
                const { error } = await supabase.auth.getSession();

                if (error) {
                    throw error;
                }

                setStatus("success");
                setMessage("เชื่อมต่อ Supabase สำเร็จ! (Client Initialized)");
            } catch (err: any) {
                setStatus("error");
                setMessage(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
            }
        }

        checkConnection();
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className=" text-center">Supabase Connection Test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border p-4 bg-white">
                        <h3 className="mb-2 font-semibold">Environment Variables</h3>
                        <div className="text-sm">
                            <div className="flex justify-between">
                                <span>URL:</span>
                                <span className={envCheck.url === "Missing" ? "text-red-500" : "text-green-600"}>{envCheck.url}</span>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span>KEY:</span>
                                <span className={envCheck.url === "Missing" ? "text-red-500" : "text-green-600"}>{envCheck.key}</span>
                            </div>
                        </div>
                    </div>

                    <div className={`flex items-center gap-3 rounded-lg p-4 ${status === "success" ? "bg-green-50 text-green-700" :
                            status === "error" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                        }`}>
                        {status === "loading" && <Loader2 className="h-6 w-6 animate-spin" />}
                        {status === "success" && <CheckCircle className="h-6 w-6" />}
                        {status === "error" && <AlertCircle className="h-6 w-6" />}

                        <div className="font-medium">
                            {status === "loading" && "กำลังตรวจสอบ..."}
                            {message}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
