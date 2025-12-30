"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/use-profile";

export function HeroButtons() {
    const { profile, loading } = useProfile();

    if (loading) {
        return (
            <div className="flex justify-center gap-4">
                <Button size="lg" disabled className="h-12 px-8 text-lg">กำลังโหลด...</Button>
            </div>
        );
    }

    if (profile) {
        return (
            <div className="flex justify-center gap-4">
                <Link href="/dashboard">
                    <Button size="lg" className="h-12 px-8 text-lg">ไปที่แดชบอร์ดของคุณ</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex justify-center gap-4">
            <Link href="/login">
                <Button size="lg" className="h-12 px-8 text-lg">ทดลองใช้งานฟรี</Button>
            </Link>
            <Link href="#demo">
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg">ดูวิดีโอสาธิต</Button>
            </Link>
        </div>
    );
}
