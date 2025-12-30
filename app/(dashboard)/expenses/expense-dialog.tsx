"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createExpense } from "@/lib/data-service";

const expenseSchema = z.object({
    description: z.string().min(1, "กรุณาระบุรายละเอียด"),
    amount: z.coerce.number().min(0.01, "จำนวนเงินต้องมากกว่า 0"),
    category: z.string().min(1, "กรุณาเลือกหมวดหมู่"),
    date: z.date(),
    recipient: z.string().optional(),
    isVat: z.boolean().default(false),
    vatAmount: z.coerce.number().default(0),
});

interface ExpenseDialogProps {
    onSuccess?: () => void;
}

const EXPENSE_CATEGORIES = [
    "ค่าสินค้า/ต้นทุน",
    "เงินเดือน/ค่าจ้าง",
    "ค่าเช่า/สถานที่",
    "ค่าน้ำ/ค่าไฟ/อินเทอร์เน็ต",
    "ค่าเดินทาง",
    "ค่าโฆษณา/การตลาด",
    "เครื่องใช้สำนักงาน",
    "ภาษี/ค่าธรรมเนียม",
    "อื่นๆ"
];

export function ExpenseDialog({ onSuccess }: ExpenseDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            description: "",
            amount: 0,
            category: "",
            date: new Date(),
            recipient: "",
            isVat: false,
            vatAmount: 0,
        },
    });

    async function onSubmit(values: z.infer<typeof expenseSchema>) {
        setIsLoading(true);
        try {
            await createExpense(values);
            toast.success("บันทึกรายจ่ายเรียบร้อย");
            setOpen(false);
            form.reset();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถบันทึกรายจ่ายได้");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive">
                    <Plus className="mr-2 h-4 w-4" /> บันทึกรายจ่าย
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>บันทึกรายจ่ายใหม่</DialogTitle>
                    <DialogDescription>
                        ระบุรายละเอียดค่าใช้จ่ายเพื่อบันทึกลงในระบบ
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>วันที่จ่าย <span className="text-red-500">*</span></FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "d MMM yyyy", { locale: th })
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>รายละเอียด <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="เช่น ค่าที่ปรึกษา, ค่าไฟเดือน ม.ค." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>จำนวนเงิน (บาท) <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>หมวดหมู่ <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="เลือกหมวดหมู่" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {EXPENSE_CATEGORIES.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>
                                                        {cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="recipient"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ผู้รับเงิน/ร้านค้า (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="เช่น การไฟฟ้า, 7-11" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-lg">
                            <FormField
                                control={form.control}
                                name="isVat"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={(e) => {
                                                    field.onChange(e.target.checked);
                                                    if (e.target.checked) {
                                                        const amount = form.getValues("amount");
                                                        // Calc VAT 7% from total (including VAT)
                                                        // VAT = total * 7 / 107
                                                        const vat = (amount * 7) / 107;
                                                        form.setValue("vatAmount", parseFloat(vat.toFixed(2)));
                                                    } else {
                                                        form.setValue("vatAmount", 0);
                                                    }
                                                }}
                                                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600"
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>มีภาษีมูลค่าเพิ่ม (VAT 7%)</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {form.watch("isVat") && (
                                <FormField
                                    control={form.control}
                                    name="vatAmount"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel className="text-xs">จำนวนภาษี (บาท)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} className="h-8" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                บันทึกรายจ่าย
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
