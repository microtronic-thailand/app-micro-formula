"use client";

import { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
    getInvoices,
    getExpenses
} from "@/lib/data-service";
import { Invoice, Expense } from "@/types";
import {
    Loader2,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Printer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { th } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function FinancialReportPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const componentRef = useRef(null);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Finance-Report-${selectedYear}-${selectedMonth + 1}`,
    });

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
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const monthNames = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    // Filter data by selected month/year
    const filteredInvoices = invoices.filter(inv => {
        const d = new Date(inv.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear && inv.status === 'paid';
    });

    const filteredExpenses = expenses.filter(exp => {
        const d = new Date(exp.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const totalIncome = filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const totalExpense = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = totalIncome - totalExpense;

    // Daily breakdown for table
    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(new Date(selectedYear, selectedMonth)),
        end: endOfMonth(new Date(selectedYear, selectedMonth))
    });

    const dailyStats = daysInMonth.map(day => {
        const dayInvoices = filteredInvoices.filter(inv => isSameDay(new Date(inv.date), day));
        const dayExpenses = filteredExpenses.filter(exp => isSameDay(new Date(exp.date), day));

        const income = dayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
        const expense = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        return {
            date: day,
            income,
            expense,
            profit: income - expense
        };
    }).filter(d => d.income > 0 || d.expense > 0).reverse();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">สรุปยอดรายวัน/รายเดือน</h2>
                    <p className="text-muted-foreground font-medium">ดูสรุปความเคลื่อนไหวทางการเงินของธุรกิจย้อนหลัง</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
                        <SelectTrigger className="w-[140px] bg-white">
                            <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                            <SelectValue placeholder="เลือกเดือน" />
                        </SelectTrigger>
                        <SelectContent>
                            {monthNames.map((name, i) => (
                                <SelectItem key={i} value={i.toString()}>{name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                        <SelectTrigger className="w-[100px] bg-white">
                            <SelectValue placeholder="เลือกปี" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button onClick={handlePrint} variant="outline" className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100">
                        <Printer className="mr-2 h-4 w-4" /> พิมพ์สรุป PDF
                    </Button>
                </div>
            </div>

            <div ref={componentRef} className="space-y-6 print:p-10 print:bg-white print:text-slate-900">
                {/* Print Only Header */}
                <div className="hidden print:block mb-8 border-b pb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">รายงานสรุปผลการดำเนินงาน</h1>
                            <p className="text-slate-500 text-lg">ประจำเดือน {monthNames[selectedMonth]} {selectedYear}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-blue-600">MicroAccount System</p>
                            <p className="text-sm text-slate-400 font-medium">วันที่ออกรายงาน: {format(new Date(), "d MMMM yyyy HH:mm", { locale: th })}</p>
                        </div>
                    </div>
                </div>

                {/* Monthly Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-l-4 border-l-green-500 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-500">รายรับรวม (ชำระแล้ว)</CardTitle>
                            <TrendingUp className="h-5 w-5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">฿{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            <p className="text-xs text-muted-foreground mt-1">ประจำเดือน {monthNames[selectedMonth]}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-red-500 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-500">รวมรายจ่าย</CardTitle>
                            <TrendingDown className="h-5 w-5 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600">฿{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            <p className="text-xs text-muted-foreground mt-1">ประจำเดือน {monthNames[selectedMonth]}</p>
                        </CardContent>
                    </Card>

                    <Card className={`border-l-4 ${netProfit >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'} shadow-sm overflow-hidden group hover:shadow-md transition-shadow`}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-500">กำไรสุทธิ (Cash Flow)</CardTitle>
                            <DollarSign className={`h-5 w-5 ${netProfit >= 0 ? 'text-blue-500' : 'text-orange-500'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-3xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                ฿{netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">กำไรหลังหักรายจ่าย</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Daily Breakdown Table */}
                <Card className="border-slate-200 shadow-sm print:shadow-none print:border-none">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Search className="h-5 w-5 text-blue-500 no-print" />
                            รายการสรุปรายวัน (Daily Breakdown)
                        </CardTitle>
                        <CardDescription className="no-print">แสดงรายการที่มีความเคลื่อนไหวในแต่ละวัน</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-hidden print:border-slate-100">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="w-[150px]">วันที่</TableHead>
                                        <TableHead className="text-right">รายรับ (฿)</TableHead>
                                        <TableHead className="text-right">รายจ่าย (฿)</TableHead>
                                        <TableHead className="text-right">คงเหลือสุทธิ (฿)</TableHead>
                                        <TableHead className="w-[100px] no-print"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dailyStats.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                                ไม่มีความเคลื่อนไหวทางการเงินในเดือนนี้
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        dailyStats.map((stat, i) => (
                                            <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                                                <TableCell className="font-medium">
                                                    {format(stat.date, "d MMMM yyyy", { locale: th })}
                                                </TableCell>
                                                <TableCell className="text-right text-green-600 font-semibold">
                                                    {stat.income > 0 ? `+${stat.income.toLocaleString()}` : "-"}
                                                </TableCell>
                                                <TableCell className="text-right text-red-600">
                                                    {stat.expense > 0 ? `-${stat.expense.toLocaleString()}` : "-"}
                                                </TableCell>
                                                <TableCell className={`text-right font-bold ${stat.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                                    {stat.profit.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-center no-print">
                                                    {stat.profit > 0 ? (
                                                        <ArrowUpRight className="h-4 w-4 text-green-400 inline" />
                                                    ) : stat.profit < 0 ? (
                                                        <ArrowDownRight className="h-4 w-4 text-red-400 inline" />
                                                    ) : null}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer only for print */}
                <div className="hidden print:block pt-10 text-center text-slate-400 text-xs">
                    <p>เอกสารสรุปอัตโนมัติจากระบบ MicroAccount</p>
                    <p>รับรองความถูกต้อง ณ วันที่พิมพ์ : {format(new Date(), "d/MM/yyyy")}</p>
                </div>
            </div>
        </div>
    );
}
