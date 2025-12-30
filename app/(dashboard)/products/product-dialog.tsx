"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { createProduct } from "@/lib/data-service";
import { Product } from "@/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const productSchema = z.object({
    name: z.string().min(1, "กรุณากรอกชื่อสินค้า"),
    sku: z.string().optional(),
    price: z.coerce.number().min(0, "ราคาต้องไม่ต่ำกว่า 0"),
    unit: z.string().min(1, "กรุณาระบุหน่วยนับ"),
    description: z.string().optional(),
    stockQuantity: z.coerce.number().min(0, "จำนวนต้องไม่ต่ำกว่า 0").default(0),
    minStockLevel: z.coerce.number().min(0, "จำนวนต้องไม่ต่ำกว่า 0").default(0),
});

interface ProductDialogProps {
    onSuccess?: () => void;
}

export function ProductDialog({ onSuccess }: ProductDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: "",
            sku: "",
            price: 0,
            unit: "ชิ้น",
            description: "",
            stockQuantity: 0,
            minStockLevel: 0,
        },
    });

    async function onSubmit(values: z.infer<typeof productSchema>) {
        setIsLoading(true);
        try {
            await createProduct(values);
            toast.success("เพิ่มสินค้าเรียบร้อยแล้ว");
            setOpen(false);
            form.reset();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถเพิ่มสินค้าได้");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> เพิ่มสินค้าใหม่
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>เพิ่มสินค้าใหม่</DialogTitle>
                    <DialogDescription>
                        กรอกข้อมูลสินค้าเพื่อบันทึกไว้ในฐานข้อมูล
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ชื่อสินค้า <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="เช่น ค่าที่ปรึกษา, ปากกา" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="sku"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>รหัสสินค้า (SKU)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="เช่น SVC-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>หน่วยนับ <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="เช่น ชิ้น, ครั้ง, ชั่วโมง" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ราคาต่อหน่วย (บาท) <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="stockQuantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>จำนวนสต็อกตั้งต้น</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="minStockLevel"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>จุดแจ้งเตือนสินค้าใกล้หมด</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>รายละเอียดเพิ่มเติม</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="รายละเอียดสินค้า"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                บันทึกข้อมูล
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
