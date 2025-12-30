"use client";

import Link from "next/link";
import {
    LayoutDashboard,
    FileText,
    Users,
    ShoppingBag,
    ClipboardList,
    Settings,
    PieChart,
    LogOut,
    History,
    Shield,
    Database,
    BookOpen,
    Tags,
    TrendingUp
} from "lucide-react";
import { useProfile } from "@/hooks/use-profile";

export function Sidebar() {
    const { profile } = useProfile();

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-slate-900 text-white">
            <div className="flex h-14 items-center border-b border-slate-700 px-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <span className="text-blue-400">Micro</span>Account
                </Link>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-3">
                    <li>
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                        >
                            <LayoutDashboard size={20} />
                            พื้นที่ทำงาน (Workspace)
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/quotations"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                        >
                            <FileText size={20} />
                            ใบเสนอราคา (Quotations)
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/invoices"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                        >
                            <FileText size={20} />
                            ใบแจ้งหนี้ (Invoices)
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/expenses"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                        >
                            <PieChart size={20} />
                            ค่าใช้จ่าย (Expenses)
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/customers"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                        >
                            <Users size={20} />
                            ลูกค้า (Customers)
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/products"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                        >
                            <ShoppingBag size={20} />
                            สินค้า (Products)
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/reports/tax"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                        >
                            <ClipboardList size={20} />
                            รายงานภาษี (Tax Reports)
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/reports/financial"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                        >
                            <TrendingUp size={20} />
                            สรุปยอดรายวัน (Finance)
                        </Link>
                    </li>
                    {profile?.role === 'super_admin' && (
                        <>
                            <li>
                                <Link
                                    href="/admin"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white border border-slate-700/50 mt-4 bg-slate-800/20"
                                >
                                    <Shield size={20} className="text-yellow-500" />
                                    จัดการผู้ใช้งาน (Admin)
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/admin/backup"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                                >
                                    <Database size={20} className="text-blue-400" />
                                    สำรอง/กู้คืน (Backup)
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/admin/logs"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                                >
                                    <History size={20} className="text-purple-400" />
                                    ประวัติการใช้งาน (Audit Trail)
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
            <div className="border-t border-slate-700 p-4">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                >
                    <Settings size={20} />
                    ตั้งค่า (Settings)
                </Link>
                <div onClick={async () => {
                    const { supabase } = await import('@/lib/supabase');
                    await supabase.auth.signOut();
                    window.location.href = '/login';
                }} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white cursor-pointer mt-2 text-red-400 hover:text-red-300">
                    <LogOut size={20} />
                    ออกจากระบบ (Logout)
                </div>
            </div>
        </div>
    );
}
