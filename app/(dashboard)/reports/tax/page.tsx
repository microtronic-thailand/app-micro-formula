"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    getInvoices,
    getExpenses
} from "@/lib/data-service";
import { Invoice, Expense } from "@/types";
import {
    Loader2,
    TrendingUp,
    TrendingDown,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    CalendarSearch
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { th } from "date-fns/locale";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function TaxReportPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [invData, expData] = await Promise.all([
                    getInvoices(),
                    getExpenses()
                ]);
                setInvoices(invData);
                setExpenses(expData);
            } catch (error) {
                console.error("Report load error", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Filter by month/year
    const filteredInvoices = invoices.filter(inv => {
        const d = new Date(inv.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear && inv.status !== 'cancelled';
    });

    const filteredExpenses = expenses.filter(exp => {
        const d = new Date(exp.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    // Calculations
    const outputVat = filteredInvoices.reduce((sum, inv) => sum + (inv.vatTotal || 0), 0);
    const inputVat = filteredExpenses.reduce((sum, exp) => sum + (exp.vatAmount || 0), 0);
    const netVat = outputVat - inputVat;

    const totalSales = filteredInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
    const totalExpensesWithVat = filteredExpenses.reduce((sum, exp) => sum + (exp.isVat ? exp.amount - (exp.vatAmount || 0) : 0), 0);

    const monthNames = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">รายงานภาษีมูลค่าเพิ่ม (VAT Report)</h2>
                    <p className="text-muted-foreground">สรุปภาษีซื้อ-ภาษีขาย ประจำเดือน</p>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="เลือกเดือน" />
                        </SelectTrigger>
                        <SelectContent>
                            {monthNames.map((name, i) => (
                                <SelectItem key={i} value={i.toString()}>{name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="เลือกปี" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">ภาษีขาย (Output VAT)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">฿{outputVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground mt-1">จากฐานยอดขาย ฿{totalSales.toLocaleString()}</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">ภาษีซื้อ (Input VAT)</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">฿{inputVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground mt-1">จากฐานรายจ่าย ฿{totalExpensesWithVat.toLocaleString()}</p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${netVat >= 0 ? 'border-l-orange-500' : 'border-l-green-500'}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">ภาษีที่ต้องชำระสุทธิ</CardTitle>
                        <BarChart3 className={`h-4 w-4 ${netVat >= 0 ? 'text-orange-500' : 'text-green-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netVat >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            ฿{Math.abs(netVat).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {netVat >= 0 ? "ชำระเพิ่ม (ภ.พ.30)" : "ภาษีชำระเกิน (ยกไปเดือนหน้า)"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Output VAT Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ArrowUpRight className="text-blue-500" /> รายการภาษีขาย
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>วันที่</TableHead>
                                    <TableHead>เลขที่ใบกำกับ</TableHead>
                                    <TableHead className="text-right">VAT (7%)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInvoices.length === 0 ? (
                                    <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">ไม่มีข้อมูล</TableCell></TableRow>
                                ) : (
                                    filteredInvoices.map(inv => (
                                        <TableRow key={inv.id}>
                                            <TableCell className="text-xs">{format(new Date(inv.date), "dd/MM/yy")}</TableCell>
                                            <TableCell className="font-medium text-xs">{inv.number}</TableCell>
                                            <TableCell className="text-right text-xs">฿{inv.vatTotal.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Input VAT Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ArrowDownRight className="text-red-500" /> รายการภาษีซื้อ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>วันที่</TableHead>
                                    <TableHead>รายการ</TableHead>
                                    <TableHead className="text-right">VAT (7%)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredExpenses.filter(e => e.isVat).length === 0 ? (
                                    <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">ไม่มีข้อมูล</TableCell></TableRow>
                                ) : (
                                    filteredExpenses.filter(e => e.isVat).map(exp => (
                                        <TableRow key={exp.id}>
                                            <TableCell className="text-xs">{format(new Date(exp.date), "dd/MM/yy")}</TableCell>
                                            <TableCell className="text-xs truncate max-w-[150px]">{exp.description}</TableCell>
                                            <TableCell className="text-right text-xs text-red-600">฿{exp.vatAmount?.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
