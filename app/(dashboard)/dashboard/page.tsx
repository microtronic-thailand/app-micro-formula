"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getInvoices, getExpenses, getProducts } from "@/lib/data-service";
import { Invoice, Expense, Product } from "@/types";
import {
    DollarSign,
    CreditCard,
    Users,
    TrendingUp,
    Loader2,
    AlertTriangle,
    Box,
    PieChart as PieChartIcon,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [invData, expData, prodData] = await Promise.all([
                    getInvoices(),
                    getExpenses(),
                    getProducts()
                ]);
                setInvoices(invData);
                setExpenses(expData);
                setProducts(prodData);
            } catch (error) {
                console.error("Dashboard load error", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // --- Calculations ---
    const validRevenueInvoices = invoices.filter(i => ['issued', 'paid', 'overdue'].includes(i.status));
    const totalRevenue = validRevenueInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalReceivable = invoices.filter(i => ['issued', 'overdue'].includes(i.status)).reduce((sum, i) => sum + i.grandTotal, 0);
    const netProfit = totalRevenue - totalExpenses;
    const lowStockItems = products.filter(p => p.stockQuantity <= (p.minStockLevel || 0));

    // --- Chart Data Preparation ---

    // 1. Last 6 Months Revenue vs Expenses
    const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(new Date(), 5 - i);
        const start = startOfMonth(date);
        const end = endOfMonth(date);

        const monthRevenue = invoices
            .filter(inv => ['issued', 'paid', 'overdue'].includes(inv.status) && isWithinInterval(new Date(inv.date), { start, end }))
            .reduce((sum, inv) => sum + inv.grandTotal, 0);

        const monthExpense = expenses
            .filter(exp => isWithinInterval(new Date(exp.date), { start, end }))
            .reduce((sum, exp) => sum + exp.amount, 0);

        return {
            name: format(date, "MMM", { locale: th }),
            revenue: monthRevenue,
            expense: monthExpense
        };
    });

    // 2. Expense Category Distribution
    const categoryTotal = expenses.reduce((acc: any, exp) => {
        const cat = exp.category || "อื่นๆ";
        acc[cat] = (acc[cat] || 0) + exp.amount;
        return acc;
    }, {});

    const pieData = Object.entries(categoryTotal)
        .map(([name, value]) => ({ name, value: Number(value) }))
        .sort((a, b) => b.value - a.value);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">ภาพรวมบริษัท (Company Overview)</h2>
                    <p className="text-muted-foreground font-medium">ยินดีต้อนรับกลับมา! นี่คือสรุปสถานะทางการเงินล่าสุดของคุณ</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/reports/financial">
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
                            <BarChart3 className="mr-2 h-4 w-4" /> ดูรายงานวิเคราะห์
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="relative overflow-hidden border-none shadow-lg bg-white group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-slate-500 tracking-wider">รายรับทั้งหมด (Revenue)</CardTitle>
                        <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-900">฿{totalRevenue.toLocaleString()}</div>
                        <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold mt-1">
                            <ArrowUpRight size={12} /> +12.5% <span className="text-slate-400 font-normal ml-1">จากเดือนที่แล้ว</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-none shadow-lg bg-white group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-slate-500 tracking-wider">รายจ่ายรวม (Expenses)</CardTitle>
                        <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                            <CreditCard className="h-4 w-4 text-red-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-900">฿{totalExpenses.toLocaleString()}</div>
                        <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold mt-1">
                            <ArrowDownRight size={12} /> -2.4% <span className="text-slate-400 font-normal ml-1">จากเดือนที่แล้ว</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-none shadow-lg bg-white group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-slate-500 tracking-wider">ลูกหนี้ค้างชำระ (Receivable)</CardTitle>
                        <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                            <Users className="h-4 w-4 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-900">฿{totalReceivable.toLocaleString()}</div>
                        <p className="text-[10px] text-slate-400 mt-1">{invoices.filter(i => ['issued', 'overdue'].includes(i.status)).length} รายการที่รอเรียกเก็บ</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-none shadow-lg bg-slate-900 text-white group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-slate-400 tracking-wider">กำไรสุทธิ (Net Profit)</CardTitle>
                        <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                            <TrendingUp className="h-4 w-4 text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">฿{netProfit.toLocaleString()}</div>
                        <div className="flex items-center gap-1 text-[10px] text-blue-400 font-bold mt-1">
                            ความมั่งคั่งของบริษัท <span className="text-slate-500 font-normal ml-1">สะสมทั้งหมด</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Analytical Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-none shadow-lg bg-white overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">แนวโน้มรายรับและรายจ่าย (Revenue vs Expenses)</CardTitle>
                        <CardDescription>วิเคราะห์เปรียบเทียบในรอบ 6 เดือนล่าสุด</CardDescription>
                    </CardHeader>
                    <CardContent className="px-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={last6Months} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value: any) => [`฿${Number(value).toLocaleString()}`, '']}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="รายรับ" />
                                    <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" name="รายจ่าย" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-white overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">สัดส่วนรายจ่าย (Expense Breakdown)</CardTitle>
                        <CardDescription>แยกตามหมวดหมู่สำคัญ</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 flex flex-col items-center">
                        <div className="h-[250px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData.slice(0, 5)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => `฿${Number(value).toLocaleString()}`} />
                                    <Legend verticalAlign="bottom" iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="p-6 w-full space-y-2">
                            {pieData.slice(0, 3).map((item, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                        <span className="text-slate-600">{item.name}</span>
                                    </div>
                                    <span className="font-bold text-slate-800">{((item.value / totalExpenses) * 100).toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row: Lists */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-none shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold">รายการรายจ่ายล่าสุด</CardTitle>
                            <CardDescription>การเคลื่อนไหวทางการเงิน 5 รายการล่าสุด</CardDescription>
                        </div>
                        <Link href="/expenses">
                            <Button variant="ghost" size="sm" className="text-blue-600">ดูทั้งหมด <ArrowUpRight size={14} className="ml-1" /></Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {expenses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                <CreditCard className="h-10 w-10 mb-2 opacity-20" />
                                <p>เขายังไม่มีการบันทึกรายจ่าย</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {expenses.slice(0, 5).map((expense) => (
                                    <div key={expense.id} className="flex items-center justify-between py-4 group transition-all hover:bg-slate-50 px-2 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                <CreditCard size={18} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">{expense.description}</div>
                                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                                    {expense.category} • {format(new Date(expense.date), "dd/MM/yyyy")}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-black text-red-600">฿{expense.amount.toLocaleString()}</div>
                                            <div className="text-[8px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 inline-block">PAID</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-3 border-none shadow-lg overflow-hidden">
                    <CardHeader className="bg-red-50/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold text-red-800">แจ้งเตือนสต็อก</CardTitle>
                            <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
                        </div>
                        <CardDescription className="text-red-600/70">สินค้าที่ถึงจุดสั่งซื้อใหม่ (Re-order point)</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {lowStockItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground border-2 border-dashed rounded-xl border-slate-200">
                                <Box className="h-10 w-10 mb-2 opacity-20" />
                                <p>สต็อกสินค้าปลอดภัยทุกรายการ</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {lowStockItems.slice(0, 5).map((prod) => (
                                    <div key={prod.id} className="flex items-center justify-between p-3 rounded-xl bg-orange-50/30 border border-orange-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                                <Box size={16} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-slate-800">{prod.name}</div>
                                                <div className="text-[10px] text-slate-500">SKU: {prod.sku || "-"}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-black text-red-600">{prod.stockQuantity} {prod.unit}</div>
                                            <div className="text-[8px] text-orange-600 font-bold">Min: {prod.minStockLevel}</div>
                                        </div>
                                    </div>
                                ))}
                                <Link href="/products" className="block w-full">
                                    <Button variant="outline" className="w-full mt-2 border-slate-200 text-slate-600 hover:bg-slate-50">จัดการสต็อกทั้งหมด</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
