"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInvoices, getExpenses, getProducts } from "@/lib/data-service";
import { Invoice, Expense, Product } from "@/types";
import { DollarSign, CreditCard, Users, TrendingUp, Loader2, AlertTriangle, Box } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function DashboardPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                // Load all in parallel
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

    // 1. Total Revenue (รายรับ) - Based on invoices not cancelled
    // Note: In strict accounting, maybe only 'paid', but for overview 'issued' is usually booked revenue (Accrual basis).
    // Let's count 'issued', 'paid', 'overdue'. Exclude 'draft', 'cancelled'.
    const validRevenueInvoices = invoices.filter(i => ['issued', 'paid', 'overdue'].includes(i.status));
    const totalRevenue = validRevenueInvoices.reduce((sum, i) => sum + i.grandTotal, 0);

    // 2. Total Expenses (รายจ่าย)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // 3. Accounts Receivable (ลูกหนี้การค้า) - Waiting for payment
    const pendingInvoices = invoices.filter(i => ['issued', 'overdue'].includes(i.status));
    const totalReceivable = pendingInvoices.reduce((sum, i) => sum + i.grandTotal, 0);

    // 4. Net Profit (กำไรสุทธิ) - Simple calc
    const netProfit = totalRevenue - totalExpenses;

    // 5. Low Stock Count
    const lowStockItems = products.filter(p => p.stockQuantity <= (p.minStockLevel || 0));

    // Recent Invoices (Top 5)
    // Assuming API sort, but re-sorting here to be safe if API changes
    const recentInvoices = [...invoices]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">พื้นที่ทำงาน (Workspace)</h2>
                <p className="text-muted-foreground">สรุปข้อมูลทางการเงินและสถานะบริษัทของคุณ</p>
            </div>

            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">รายรับรวม (Total Revenue)</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-green-600">
                            ฿{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">จากใบแจ้งหนี้ {validRevenueInvoices.length} ใบ</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">ค่าใช้จ่าย (Expenses)</CardTitle>
                        <CreditCard className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-red-600">
                            ฿{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">บันทึกแล้ว {expenses.length} รายการ</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">ลูกหนี้การค้า (Receivable)</CardTitle>
                        <Users className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-orange-600">
                            ฿{totalReceivable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">รอเก็บเงิน {pendingInvoices.length} รายการ</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-blue-100 bg-blue-50/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">กำไรสุทธิ (Net Profit)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-xl sm:text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            ฿{netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">รายรับ - รายจ่าย</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-red-50 to-red-50/10 lg:hidden xl:flex">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium text-red-700">สต็อกใกล้หมด</CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${lowStockItems.length > 0 ? 'text-red-500 font-bold' : 'text-slate-300'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-xl sm:text-2xl font-bold ${lowStockItems.length > 0 ? 'text-red-600' : 'text-slate-600'}`}>
                            {lowStockItems.length} <span className="text-xs font-normal">รายการ</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">สินค้าที่มีจำนวนต่ำกว่าจุดแจ้งเตือน</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>ความเคลื่อนไหวล่าสุด (Expenses Overview)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {expenses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                                <CreditCard className="h-8 w-8 mb-2 opacity-50" />
                                <p>ยังไม่มีรายการค่าใช้จ่าย</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {expenses.slice(0, 5).map((expense) => (
                                    <div key={expense.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div>
                                            <div className="font-medium">{expense.description}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {format(new Date(expense.date), "d MMM yyyy", { locale: th })} | {expense.category}
                                            </div>
                                        </div>
                                        <div className="text-right font-medium text-red-600">
                                            -฿{expense.amount.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>สินค้าสต็อกต่ำ</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        {lowStockItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                                <Box className="h-8 w-8 mb-2 opacity-50" />
                                <p>สต็อกสินค้าปกติทุกรายการ</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {lowStockItems.slice(0, 5).map((prod) => (
                                    <div key={prod.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div>
                                            <div className="font-medium text-sm">{prod.name}</div>
                                            <div className="text-xs text-muted-foreground">SKU: {prod.sku || "-"}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-red-600">{prod.stockQuantity} {prod.unit}</div>
                                            <div className="text-[10px] text-muted-foreground">ต่ำกว่า {prod.minStockLevel}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
