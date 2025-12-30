"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
    getInvoices,
    getExpenses
} from "@/lib/data-service";
import { Invoice, Expense } from "@/types";
import {
    Loader2,
    Printer,
    Download,
    Calendar,
    FileText,
    PieChart,
    Table as TableIcon,
    ShieldCheck,
    ArrowDownToLine,
    ArrowUpFromLine
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
                const [inv, exp] = await Promise.all([getInvoices(), getExpenses()]);
                setInvoices(inv);
                setExpenses(exp);
            } catch (e) {
                console.error(e);
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
    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    // Filtered Data - Month/Year
    const filteredInvoices = invoices.filter(inv => {
        const d = new Date(inv.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const filteredExpenses = expenses.filter(exp => {
        const d = new Date(exp.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    // VAT Analysis
    const salesTaxItems = filteredInvoices.filter(inv => inv.status === 'paid' && (inv.vatTotal || 0) > 0);
    const purchaseTaxItems = filteredExpenses.filter(exp => (exp.isVat || (exp.vatAmount && exp.vatAmount > 0)));

    const totalVatSale = salesTaxItems.reduce((sum, item) => sum + (item.vatTotal || 0), 0);
    const totalVatPurchase = purchaseTaxItems.reduce((sum, item) => sum + (item.vatAmount || 0), 0);

    // WHT Analysis
    const whtCollectedItems = filteredInvoices.filter(inv => (inv.whtTotal || 0) > 0);
    const whtPaidItems = filteredExpenses.filter(exp => (exp.whtAmount || 0) > 0);

    const totalWhtCollected = whtCollectedItems.reduce((sum, item) => sum + (item.whtTotal || 0), 0);
    const totalWhtPaid = whtPaidItems.reduce((sum, item) => sum + (item.whtAmount || 0), 0);

    const downloadCSV = (filename: string, headers: string[], rows: any[][]) => {
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += headers.join(",") + "\n";
        rows.forEach(row => csvContent += row.join(",") + "\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportVAT = (type: 'sale' | 'purchase') => {
        if (type === 'sale') {
            const headers = ["วันที่", "เลขที่เอกสาร", "ชื่อลูกค้า", "เลขประจำตัวผู้เสียภาษี", "มูลค่าสินค้า", "จำนวนภาษี"];
            const rows = salesTaxItems.map(inv => [
                format(new Date(inv.date), "dd/MM/yyyy"),
                inv.number,
                inv.customerName,
                inv.customerTaxId || "-",
                inv.subtotal,
                inv.vatTotal
            ]);
            downloadCSV(`VAT-Sale-${selectedMonth + 1}-${selectedYear}`, headers, rows);
        } else {
            const headers = ["วันที่", "เลขที่เอกสาร", "ชื่อผู้ขาย/ร้านค้า", "มูลค่าสินค้า", "จำนวนภาษี"];
            const rows = purchaseTaxItems.map(exp => [
                format(new Date(exp.date), "dd/MM/yyyy"),
                "-",
                exp.description,
                exp.amount - (exp.vatAmount || 0),
                exp.vatAmount
            ]);
            downloadCSV(`VAT-Purchase-${selectedMonth + 1}-${selectedYear}`, headers, rows);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">ศูนย์รวมรายงานภาษี (Tax Center)</h2>
                    <p className="text-muted-foreground font-medium">จัดการภาษีมูลค่าเพิ่ม (VAT) และภาษีหัก ณ ที่จ่าย (WHT) เพื่อการยื่นแบบประเมินภาษี</p>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={selectedMonth.toString()} onValueChange={v => setSelectedMonth(parseInt(v))}>
                        <SelectTrigger className="w-[140px] bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>{monthNames.map((n, i) => <SelectItem key={i} value={i.toString()}>{n}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(parseInt(v))}>
                        <SelectTrigger className="w-[100px] bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => window.print()} className="bg-white"><Printer className="mr-2 h-4 w-4" /> พิมพ์รายงาน</Button>
                </div>
            </div>

            {/* Tax Overview Highlights */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-blue-50/50 border-blue-100">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-xs font-bold uppercase text-blue-600">ภาษีขาย (VAT Output)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-800">฿{totalVatSale.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-orange-50/50 border-orange-100">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-xs font-bold uppercase text-orange-600">ภาษีซื้อ (VAT Input)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-800">฿{totalVatPurchase.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-purple-50/50 border-purple-100">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-xs font-bold uppercase text-purple-600">WHT ถูกหักไว้</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-800">฿{totalWhtCollected.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-xs font-bold uppercase text-slate-600">WHT ที่เราหักไว้</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">฿{totalWhtPaid.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="vat" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="vat" className="gap-2"><ShieldCheck className="h-4 w-4" /> รายงาน VAT</TabsTrigger>
                    <TabsTrigger value="wht" className="gap-2"><ArrowDownToLine className="h-4 w-4" /> รายงาน WHT</TabsTrigger>
                </TabsList>

                {/* --- VAT TAB --- */}
                <TabsContent value="vat" className="space-y-6 pt-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold">ภาษีขาย (Sales VAT)</CardTitle>
                                <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => handleExportVAT('sale')}>
                                    <Download className="h-4 w-4 mr-1" /> CSV
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="text-xs">เลขที่</TableHead>
                                            <TableHead className="text-xs">ลูกค้า</TableHead>
                                            <TableHead className="text-right text-xs">ภาษี</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {salesTaxItems.length > 0 ? salesTaxItems.map(inv => (
                                            <TableRow key={inv.id}>
                                                <TableCell className="py-2 text-xs font-medium">{inv.number}</TableCell>
                                                <TableCell className="py-2 text-xs">{inv.customerName}</TableCell>
                                                <TableCell className="py-2 text-right text-xs font-bold text-blue-600">{inv.vatTotal.toLocaleString()}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow><TableCell colSpan={3} className="text-center py-4 text-xs text-slate-400">ไม่มีข้อมูล</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold">ภาษีซื้อ (Purchase VAT)</CardTitle>
                                <Button size="sm" variant="ghost" className="text-orange-600" onClick={() => handleExportVAT('purchase')}>
                                    <Download className="h-4 w-4 mr-1" /> CSV
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="text-xs">วันที่</TableHead>
                                            <TableHead className="text-xs">รายละเอียด</TableHead>
                                            <TableHead className="text-right text-xs">ภาษี</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {purchaseTaxItems.length > 0 ? purchaseTaxItems.map(exp => (
                                            <TableRow key={exp.id}>
                                                <TableCell className="py-2 text-xs">{format(new Date(exp.date), "dd/MM")}</TableCell>
                                                <TableCell className="py-2 text-xs">{exp.description}</TableCell>
                                                <TableCell className="py-2 text-right text-xs font-bold text-orange-600">{(exp.vatAmount || 0).toLocaleString()}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow><TableCell colSpan={3} className="text-center py-4 text-xs text-slate-400">ไม่มีข้อมูล</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-blue-900 text-white border-none">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-blue-200 text-sm">ส่วนต่างภาษีมูลค่าเพิ่มที่ต้องชำระ (Net VAT to Pay)</p>
                                    <h3 className="text-3xl font-bold mt-1">฿{(totalVatSale - totalVatPurchase).toLocaleString()}</h3>
                                </div>
                                <div className="text-right">
                                    <Badge className={totalVatSale >= totalVatPurchase ? "bg-red-500" : "bg-green-500"}>
                                        {totalVatSale >= totalVatPurchase ? "ต้องชำระเพิ่ม" : "ภาษีซื้อเกิน (ขอคืนได้)"}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- WHT TAB --- */}
                <TabsContent value="wht" className="space-y-6 pt-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold flex items-center justify-between">
                                    <span>WHT ถูกหักไว้ (Revenue)</span>
                                    <Badge variant="outline" className="text-purple-600 bg-purple-50 border-purple-200">ภ.ง.ด. 50 ทวิ</Badge>
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">รายการที่ลูกค้าหักภาษีเราไว้ เมื่อเข้าโปรแกรมรับชำระ</p>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="text-xs">เลขที่เอกสาร</TableHead>
                                            <TableHead className="text-xs">ลูกค้า</TableHead>
                                            <TableHead className="text-right text-xs text-purple-700">หักไว้ (฿)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {whtCollectedItems.length > 0 ? whtCollectedItems.map(inv => (
                                            <TableRow key={inv.id}>
                                                <TableCell className="py-2 text-xs">{inv.number}</TableCell>
                                                <TableCell className="py-2 text-xs">{inv.customerName}</TableCell>
                                                <TableCell className="py-2 text-right text-xs font-bold text-purple-700">{inv.whtTotal?.toLocaleString()}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow><TableCell colSpan={3} className="text-center py-4 text-xs text-slate-400">ไม่มีข้อมูลการหักภาษี</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold flex items-center justify-between">
                                    <span>WHT ที่เราต้องนำส่ง (Expenses)</span>
                                    <Badge variant="outline" className="text-slate-600 bg-slate-50">ภ.ง.ด. 3 / 53</Badge>
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">รายการที่เราหักภาษีผู้ขายไว้ ต้องนำส่งกรมสรรพากรภายในวันที่ 7 หรือ 15 ของเดือนถัดไป</p>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="text-xs">วันที่</TableHead>
                                            <TableHead className="text-xs">ผู้รับเงิน</TableHead>
                                            <TableHead className="text-right text-xs">ยอดหัก (฿)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {whtPaidItems.length > 0 ? whtPaidItems.map(exp => (
                                            <TableRow key={exp.id}>
                                                <TableCell className="py-2 text-xs">{format(new Date(exp.date), "dd/MM")}</TableCell>
                                                <TableCell className="py-2 text-xs">{exp.recipient || exp.description}</TableCell>
                                                <TableCell className="py-2 text-right text-xs font-bold text-slate-800">{exp.whtAmount?.toLocaleString()}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow><TableCell colSpan={3} className="text-center py-4 text-xs text-slate-400">ไม่มีข้อมูลการหักภาษี</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg flex items-start gap-3 no-print">
                <PieChart className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                    <h4 className="text-sm font-bold text-yellow-800">คำแนะนำสำหรับนักบัญชี</h4>
                    <p className="text-xs text-yellow-700 mt-1">
                        รายงานนี้สรุปตามข้อมูลในระบบ ณ วันที่ {format(new Date(), "d MMMM yyyy", { locale: th })}
                        กรุณาตรวจสอบเอกสารใบกำกับภาษีต้นฉบับประกอบก่อนการยื่นแบบ ภ.พ. 30 และ ภ.ง.ด. จริงทุกครั้ง
                    </p>
                </div>
            </div>
        </div>
    );
}
