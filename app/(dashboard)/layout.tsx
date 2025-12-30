"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useProfile } from "@/hooks/use-profile";
import { Loader2, Menu, X } from "lucide-react";
import { updateActivity } from "@/lib/data-service";
import { Button } from "@/components/ui/button";
import { LicenseGuard } from "@/components/layout/license-guard";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, profile, loading } = useProfile();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
            return;
        }

        if (profile?.mustChangePassword && pathname !== "/settings/password") {
            router.push("/settings/password");
        }

        // Track activity (Hidden gimmick)
        if (profile) {
            updateActivity(profile.id).catch(console.error);
            const interval = setInterval(() => {
                updateActivity(profile.id).catch(console.error);
            }, 60000); // Every minute
            return () => clearInterval(interval);
        }
    }, [profile, loading, router, pathname]);

    // Side effect to close sidebar on route change (for mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!user) return null;

    if (!profile) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-slate-50 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-slate-500 font-medium italic">กำลังเตรียมพื้นที่ทำงานของคุณ...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Desktop visible, Mobile hidden with toggle */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar />
            </aside>

            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                <Header onMobileMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <LicenseGuard>
                        {children}
                    </LicenseGuard>
                </main>
            </div>
        </div>
    );
}
