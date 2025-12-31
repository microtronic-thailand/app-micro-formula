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
    Printer,
    Download,
    FileText,
    Receipt,
    Percent,
    PieChart as PieChartIcon,
    BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FinancialReportPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const componentRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
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

    // VAT Analysis
    const vatSale = filteredInvoices.reduce((sum, inv) => sum + (inv.vatTotal || 0), 0);
    const vatPurchase = filteredExpenses.reduce((sum, exp) => sum + (exp.vatAmount || 0), 0);
    const netVat = vatSale - vatPurchase;

    // WHT Analysis
    const totalWht = filteredInvoices.reduce((sum, inv) => sum + (inv.whtTotal || 0), 0);

    // Expense by Category
    const expenseByCategory = filteredExpenses.reduce((acc: any, exp) => {
        const cat = exp.category || "อื่นๆ";
        acc[cat] = (acc[cat] || 0) + exp.amount;
        return acc;
    }, {});

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

    const handleExportCSV = () => {
        const headers = ["วันที่", "รายรับ", "รายจ่าย", "กำไรสุทธิ"];
        const rows = dailyStats.map(d => [
            format(d.date, "yyyy-MM-dd"),
            d.income,
            d.expense,
            d.profit
        ]);

        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += headers.join(",") + "\n";
        rows.forEach(row => {
            csvContent += row.join(",") + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Financial-Report-${selectedYear}-${selectedMonth + 1}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                    <h2 className="text-3xl font-bold tracking-tight">รายงานสรุปผลการดำเนินงาน</h2>
                    <p className="text-muted-foreground font-medium">ภาพรวมรายรับ-รายจ่าย และกำไรขาดทุน ประจำเดือน</p>
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

                    <Button onClick={handleExportCSV} variant="outline" className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100">
                        <Download className="mr-2 h-4 w-4" /> ส่งออก CSV
                    </Button>

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
                            <h1 className="text-3xl font-bold text-slate-900">รายงานสรุปผลการดำเนินงานและภาษี</h1>
                            <p className="text-slate-500 text-lg">ประจำเดือน {monthNames[selectedMonth]} {selectedYear}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-blue-600">MicroFormula System</p>
                            <p className="text-sm text-slate-400 font-medium">วันที่ออกรายงาน: {format(new Date(), "d MMMM yyyy HH:mm", { locale: th })}</p>
                        </div>
                    </div>
                </div>

                {/* Monthly Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-l-4 border-l-green-500 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold uppercase text-slate-500">รายรับรวม (Revenue)</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">฿{totalIncome.toLocaleString()}</div>
                            <p className="text-[10px] text-slate-400 mt-1">จากใบแจ้งหนี้ที่รับชำระแล้ว</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-red-500 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold uppercase text-slate-500">รายจ่ายรวม (Expenses)</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">฿{totalExpense.toLocaleString()}</div>
                            <p className="text-[10px] text-slate-400 mt-1">ค่าใช้จ่ายการดำเนินงานทั้งหมด</p>
                        </CardContent>
                    </Card>

                    <Card className={cn(
                        "border-l-4 shadow-sm overflow-hidden bg-white",
                        netProfit >= 0 ? "border-l-blue-500" : "border-l-orange-500"
                    )}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold uppercase text-slate-500">กำไร/ขาดทุนสุทธิ (Net)</CardTitle>
                            {netProfit >= 0 ? <ArrowUpRight className="h-4 w-4 text-blue-500" /> : <ArrowDownRight className="h-4 w-4 text-orange-500" />}
                        </CardHeader>
                        <CardContent>
                            <div className={cn("text-2xl font-bold", netProfit >= 0 ? "text-blue-600" : "text-orange-600")}>
                                ฿{netProfit.toLocaleString()}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">ก่อนรวมรายการปรับปรุงสิ้นปี</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="daily" className="w-full no-print">
                    <TabsList className="mb-4 bg-slate-100 p-1">
                        <TabsTrigger value="daily" className="gap-2"><BarChart3 size={16} /> สรุปรายวัน</TabsTrigger>
                        <TabsTrigger value="pl" className="gap-2"><PieChartIcon size={16} /> กำไรขาดทุน (P&L)</TabsTrigger>
                        <TabsTrigger value="details" className="gap-2"><FileText size={16} /> รายการทั้งหมด</TabsTrigger>
                    </TabsList>

                    <TabsContent value="daily">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">รายการเคลื่อนไหวรายวัน</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead>วันที่</TableHead>
                                            <TableHead className="text-right">รายรับ (฿)</TableHead>
                                            <TableHead className="text-right">รายจ่าย (฿)</TableHead>
                                            <TableHead className="text-right">คงเหลือ (฿)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dailyStats.map((stat, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{format(stat.date, "d MMMM yyyy", { locale: th })}</TableCell>
                                                <TableCell className="text-right text-green-600 font-medium">{stat.income.toLocaleString()}</TableCell>
                                                <TableCell className="text-right text-red-600 font-medium">{stat.expense.toLocaleString()}</TableCell>
                                                <TableCell className={`text-right font-bold ${stat.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                                    {stat.profit.toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pl">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">สรุปรายได้ตามแหล่งที่มา</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                            <span className="font-medium">ยอดขาย (Invoiced Revenue)</span>
                                            <span className="font-bold text-green-700">฿{totalIncome.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">แยกตามหมวดหมู่รายจ่าย</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {Object.entries(expenseByCategory).sort((a: any, b: any) => b[1] - a[1]).map(([cat, amount]: any) => (
                                            <div key={cat} className="flex justify-between items-center py-2 border-b text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-red-400" />
                                                    <span>{cat}</span>
                                                </div>
                                                <span className="font-bold">฿{amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center pt-2 font-bold text-red-600">
                                            <span>รวมรายจ่ายทั้งหมด</span>
                                            <span>฿{totalExpense.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="details">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">รายการใบแจ้งหนี้ (Invoices)</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-slate-50 text-[10px]">
                                            <TableRow>
                                                <TableHead>เลขที่</TableHead>
                                                <TableHead>ลูกค้า</TableHead>
                                                <TableHead className="text-right">VAT</TableHead>
                                                <TableHead className="text-right">WHT</TableHead>
                                                <TableHead className="text-right">ยอดรวม</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="text-xs">
                                            {filteredInvoices.map((inv) => (
                                                <TableRow key={inv.id}>
                                                    <TableCell className="font-medium text-blue-600">{inv.number}</TableCell>
                                                    <TableCell>{inv.customerName}</TableCell>
                                                    <TableCell className="text-right">{inv.vatTotal.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right">{inv.whtTotal?.toLocaleString() || "-"}</TableCell>
                                                    <TableCell className="text-right font-bold">฿{inv.grandTotal.toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">รายการรายจ่าย (Expenses)</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-slate-50 text-[10px]">
                                            <TableRow>
                                                <TableHead>วันที่</TableHead>
                                                <TableHead>รายละเอียด</TableHead>
                                                <TableHead className="text-right">VAT</TableHead>
                                                <TableHead className="text-right">ยอดจ่าย</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="text-xs">
                                            {filteredExpenses.map((exp) => (
                                                <TableRow key={exp.id}>
                                                    <TableCell>{format(new Date(exp.date), "dd/MM")}</TableCell>
                                                    <TableCell>{exp.description}</TableCell>
                                                    <TableCell className="text-right">{exp.vatAmount?.toLocaleString() || "-"}</TableCell>
                                                    <TableCell className="text-right font-bold">฿{exp.amount.toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Print Only Version of Tables */}
                <div className="hidden print:block space-y-10">
                    <div>
                        <h3 className="text-xl font-bold border-l-4 border-blue-600 pl-3 mb-4">1. งบกำไรขาดทุนเบื้องต้น (Statement of Income)</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableBody>
                                    <TableRow className="bg-slate-50">
                                        <TableCell className="font-bold">รายรับจากการขายและบริการ (Revenue)</TableCell>
                                        <TableCell className="text-right font-bold">฿{totalIncome.toLocaleString()}</TableCell>
                                    </TableRow>
                                    <TableRow className="border-none">
                                        <TableCell className="pl-8 text-slate-500 italic">หัก: ต้นทุนและค่าใช้จ่ายในการดำเนินงาน (Expenses)</TableCell>
                                        <TableCell className="text-right">฿{totalExpense.toLocaleString()}</TableCell>
                                    </TableRow>
                                    {Object.entries(expenseByCategory).map(([cat, amount]: any) => (
                                        <TableRow key={cat} className="border-none text-xs">
                                            <TableCell className="pl-12 text-slate-400">- {cat}</TableCell>
                                            <TableCell className="text-right text-slate-400">({amount.toLocaleString()})</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="bg-slate-900 text-white font-bold">
                                        <TableCell>กำไร (ขาดทุน) สุทธิ (Net Income)</TableCell>
                                        <TableCell className="text-right text-lg">฿{netProfit.toLocaleString()}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold border-l-4 border-orange-600 pl-3 mb-4">2. สรุปภาษีมูลค่าเพิ่มและภาษีหัก ณ ที่จ่าย (Tax Summary)</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>ภาษีขายรวม (VAT Sale)</TableCell>
                                        <TableCell className="text-right">฿{vatSale.toLocaleString()}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>ภาษีซื้อรวม (VAT Purchase)</TableCell>
                                        <TableCell className="text-right">฿{vatPurchase.toLocaleString()}</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-slate-50 font-bold">
                                        <TableCell>ภาษีมูลค่าเพิ่มสุทธิที่ {netVat >= 0 ? 'ต้องชำระ' : 'ขอคืน'}</TableCell>
                                        <TableCell className="text-right text-blue-600">฿{Math.abs(netVat).toLocaleString()}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>ภาษีเงินได้หัก ณ ที่จ่าย ที่รวบรวมได้ (WHT Collected)</TableCell>
                                        <TableCell className="text-right">฿{totalWht.toLocaleString()}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                {/* Footer only for print */}
                <div className="hidden print:block pt-10 text-center text-slate-400 text-xs border-t">
                    <p>รายงานนี้เป็นข้อมูลเบื้องต้นเพื่อใช้ภายในองค์กรเท่านั้น</p>
                    <p>รับรองความถูกต้อง ณ วันที่พิมพ์ : {format(new Date(), "d MMMM yyyy", { locale: th })}</p>
                </div>
            </div>
        </div>
    );
}
