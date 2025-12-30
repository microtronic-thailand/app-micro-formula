"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, Trash2, CalendarDays, Wallet } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { th } from "date-fns/locale";

import { getExpenses, deleteExpense } from "@/lib/data-service";
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

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

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

    useEffect(() => {
        fetchExpenses();
    }, []);

    const filteredExpenses = expenses.filter((e) =>
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.recipient?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalStats = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">รายจ่าย (Expenses)</h2>
                    <p className="text-muted-foreground">
                        บันทึกและจัดการค่าใช้จ่ายต่างๆ ของกิจการ
                    </p>
                </div>
                <ExpenseDialog onSuccess={fetchExpenses} />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">รวมรายจ่ายทั้งหมด</CardTitle>
                        <Wallet className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            ฿{totalStats.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            จำนวน {expenses.length} รายการ
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ค้นหารายการ, หมวดหมู่, ผู้รับเงิน..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">วันที่</TableHead>
                            <TableHead>รายละเอียด</TableHead>
                            <TableHead>หมวดหมู่</TableHead>
                            <TableHead>ผู้รับเงิน</TableHead>
                            <TableHead className="text-right">จำนวนเงิน</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> กำลังโหลด...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredExpenses.length > 0 ? (
                            filteredExpenses.map((expense) => (
                                <TableRow key={expense.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                            {format(new Date(expense.date), "d MMM yy", { locale: th })}
                                        </div>
                                    </TableCell>
                                    <TableCell>{expense.description}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                                            {expense.category}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {expense.recipient || "-"}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-red-600">
                                        -{expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell>
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
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
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
