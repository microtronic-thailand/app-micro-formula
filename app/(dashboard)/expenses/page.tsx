"use client";

import { useEffect, useState } from "react";
import {
    Search,
    Loader2,
    Trash2,
    CalendarDays,
    Wallet,
    CheckCircle2,
    Circle,
    Paperclip,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { th } from "date-fns/locale";

import { getExpenses, deleteExpense, updateExpense } from "@/lib/data-service";
import { Expense } from "@/types";
import { ExpenseDialog } from "./expense-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const data = await getExpenses();
            setExpenses(data);
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถโหลดข้อมูลรายจ่ายได้");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteExpense(id);
            toast.success("ลบรายการรายจ่ายเรียบร้อย");
            fetchExpenses();
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถลบรายการได้");
        }
    };

    const toggleReconcile = async (expense: Expense) => {
        try {
            await updateExpense(expense.id, { isReconciled: !expense.isReconciled });
            toast.success(expense.isReconciled ? "ยกเลิกการกระทบยอด" : "กระทบยอดเรียบร้อย");
            fetchExpenses();
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถอัปเดตสถานะได้");
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const filteredExpenses = expenses.filter((e) => {
        const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.recipient?.toLowerCase().includes(searchTerm.toLowerCase());

        const expDate = new Date(e.date).getTime();
        const matchesStart = dateStart ? expDate >= new Date(dateStart).getTime() : true;
        const matchesEnd = dateEnd ? expDate <= new Date(dateEnd).getTime() : true;

        return matchesSearch && matchesStart && matchesEnd;
    });

    const totalStats = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalWht = filteredExpenses.reduce((sum, e) => sum + Number(e.whtAmount || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">รายจ่าย (Expenses)</h2>
                    <p className="text-muted-foreground">
                        บันทึกและจัดการค่าใช้จ่ายต่างๆ พร้อมระบบกระทบยอดธนาคาร
                    </p>
                </div>
                <ExpenseDialog onSuccess={fetchExpenses} />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">รวมรายจ่าย (Total Expense)</CardTitle>
                        <Wallet className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            ฿{totalStats.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            จากที่กรอง {filteredExpenses.length} รายการ
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">รวมภาษีหัก ณ ที่จ่าย (WHT)</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            ฿{totalWht.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            ยอดรวมภาษีที่หักไว้เพื่อเตรียมยื่นแบบ
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">กระทบยอดแล้ว (Reconciled)</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {filteredExpenses.filter(e => e.isReconciled).length} / {filteredExpenses.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            รายการที่ตรวจสอบตรงกับสมุดบัญชีธนาคาร
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ค้นหารายการ, หมวดหมู่, ผู้รับเงิน..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        type="date"
                        className="w-40"
                        value={dateStart}
                        onChange={(e) => setDateStart(e.target.value)}
                    />
                    <span className="text-slate-400">-</span>
                    <Input
                        type="date"
                        className="w-40"
                        value={dateEnd}
                        onChange={(e) => setDateEnd(e.target.value)}
                    />
                    {(dateStart || dateEnd) && (
                        <Button variant="ghost" size="sm" onClick={() => { setDateStart(""); setDateEnd(""); }}>
                            ล้าง
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[50px]">สะสาง</TableHead>
                            <TableHead className="w-[110px]">วันที่</TableHead>
                            <TableHead>รายละเอียด / ผู้รับเงิน</TableHead>
                            <TableHead>หมวดหมู่</TableHead>
                            <TableHead>สถานะ / VAT</TableHead>
                            <TableHead className="text-right">จำนวนเงิน</TableHead>
                            <TableHead className="w-[100px] text-center">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> กำลังโหลด...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredExpenses.length > 0 ? (
                            filteredExpenses.map((expense) => (
                                <TableRow key={expense.id} className={cn(expense.isReconciled && "bg-slate-50 opacity-80")}>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="px-0"
                                            onClick={() => toggleReconcile(expense)}
                                            title={expense.isReconciled ? "ยกเลิกกระทบยอด" : "ยืนยันกระทบยอด"}
                                        >
                                            {expense.isReconciled ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <Circle className="h-5 w-5 text-slate-300" />
                                            )}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {format(new Date(expense.date), "d MMM yy", { locale: th })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{expense.description}</div>
                                        <div className="text-[11px] text-muted-foreground">{expense.recipient || "-"}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] font-normal">
                                            {expense.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <Badge
                                                variant={expense.paymentStatus === 'paid' ? 'default' : 'secondary'}
                                                className={cn(
                                                    "text-[10px] font-medium h-5",
                                                    expense.paymentStatus === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                                )}
                                            >
                                                {expense.paymentStatus === 'paid' ? 'ชำระแล้ว' : 'ค้างชำระ'}
                                            </Badge>
                                            {expense.isVat && (
                                                <div className="text-[10px] text-blue-600 font-bold">VAT ฿{expense.vatAmount?.toLocaleString()}</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="font-bold text-red-600">
                                            -{expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                        {expense.whtAmount && expense.whtAmount > 0 ? (
                                            <div className="text-[10px] text-orange-600 font-medium">WHT หักไว้อีก ฿{expense.whtAmount.toLocaleString()}</div>
                                        ) : null}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-1">
                                            {expense.receiptUrl && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" asChild>
                                                    <a href={expense.receiptUrl} target="_blank" rel="noreferrer">
                                                        <Paperclip className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            )}

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>ยืนยันการลบ?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            คุณต้องการลบรายจ่ายนี้ใช่หรือไม่?
                                                            การกระทำนี้ไม่สามารถย้อนกลับได้
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(expense.id)} className="bg-red-500 hover:bg-red-600">
                                                            ยืนยันลบ
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    ไม่พบรายการรายจ่าย
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
