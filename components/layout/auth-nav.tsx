"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/use-profile";
import { Loader2, LayoutDashboard } from "lucide-react";

export function AuthNav() {
    const { profile, loading } = useProfile();

    if (loading) {
        return <Loader2 className="h-5 w-5 animate-spin text-slate-400" />;
    }

    if (profile) {
        return (
            <Link href="/dashboard">
                <Button className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    ไปที่แดชบอร์ด
                </Button>
            </Link>
        );
    }

    return (
        <div className="flex gap-4">
            <Link href="/login">
                <Button variant="outline">เข้าสู่ระบบ</Button>
            </Link>
            <Link href="/login">
                <Button>เริ่มต้นใช้งานฟรี</Button>
            </Link>
        </div>
    );
}
