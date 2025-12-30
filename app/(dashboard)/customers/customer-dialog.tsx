"use client";

import { useState, useEffect } from "react";
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
import { createCustomer } from "@/lib/data-service";
import { Customer } from "@/types";

const customerSchema = z.object({
    name: z.string().min(1, "กรุณากรอกชื่อลูกค้า"),
    taxId: z.string().optional(),
    branch: z.string().optional(),
    email: z.string().email("อีเมลไม่ถูกต้อง").optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
});

interface CustomerDialogProps {
    onSuccess?: () => void;
}

export function CustomerDialog({ onSuccess }: CustomerDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof customerSchema>>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: "",
            taxId: "",
            branch: "สำนักงานใหญ่",
            email: "",
            phone: "",
            address: "",
        },
    });

    async function onSubmit(values: z.infer<typeof customerSchema>) {
        setIsLoading(true);
        try {
            await createCustomer(values);
            toast.success("เพิ่มลูกค้าเรียบร้อยแล้ว");
            setOpen(false);
            form.reset();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถเพิ่มลูกค้าได้");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> เพิ่มลูกค้าใหม่
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>เพิ่มลูกค้าใหม่</DialogTitle>
                    <DialogDescription>
                        กรอกข้อมูลลูกค้าเพื่อบันทึกลงในฐานข้อมูล
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ชื่อลูกค้า / บริษัท <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="เช่น บริษัท ตัวอย่าง จำกัด" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="taxId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>เลขผู้เสียภาษี</FormLabel>
                                        <FormControl>
                                            <Input placeholder="13 หลัก" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="branch"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>สาขา</FormLabel>
                                        <FormControl>
                                            <Input placeholder="เช่น สำนักงานใหญ่" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>อีเมล</FormLabel>
                                        <FormControl>
                                            <Input placeholder="contact@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>เบอร์โทรศัพท์</FormLabel>
                                        <FormControl>
                                            <Input placeholder="081-xxx-xxxx" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ที่อยู่</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="ที่อยู่สำหรับออกใบกำกับภาษี"
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
