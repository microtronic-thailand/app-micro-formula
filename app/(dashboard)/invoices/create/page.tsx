"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addDays } from "date-fns";
import { th } from "date-fns/locale";
import {
    CalendarIcon,
    ChevronsUpDown,
    Check,
    Trash2,
    Plus,
    Save,
    Loader2,
    Package,
    AlertTriangle
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

import { createInvoice, getCustomers, getProducts } from "@/lib/data-service";
import { invoiceSchema, InvoiceFormValues } from "../schema";
import { Invoice, Customer, Product } from "@/types";

export default function CreateInvoicePage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [openCustomer, setOpenCustomer] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch data on mount
    useEffect(() => {
        getCustomers().then(setCustomers);
        getProducts().then(setProducts);
    }, []);

    const nextInvoiceNumber = `INV-${format(new Date(), 'yyyyMMdd')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    const form = useForm<InvoiceFormValues>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            number: nextInvoiceNumber,
            date: new Date(),
            dueDate: addDays(new Date(), 30),
            items: [
                { id: "1", description: "", quantity: 1, price: 0, discount: 0, vatRate: 7 }
            ],
            vatRate: 7,
        } as any,
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const watchItems = form.watch("items");

    // Calculations
    const subtotal = watchItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const totalDiscount = watchItems.reduce((sum, item) => sum + (item.discount || 0), 0);
    const afterDiscount = subtotal - totalDiscount;
    const vatTotal = afterDiscount * 0.07;
    const grandTotal = afterDiscount + vatTotal;

    async function onSubmit(data: InvoiceFormValues) {
        setIsLoading(true);
        try {
            const customer = customers.find(c => c.id === data.customerId);

            const newInvoice: Invoice = {
                id: '',
                number: data.number,
                date: data.date,
                dueDate: data.dueDate,
                customerId: data.customerId,
                customerName: customer?.name || "Unknown",
                customerAddress: customer?.address,
                customerTaxId: customer?.taxId,
                items: data.items,

                subtotal,
                discountTotal: totalDiscount,
                vatTotal,
                grandTotal,

                status: 'issued',
                notes: data.notes,
                createdAt: new Date(),
            };

            await createInvoice(newInvoice);
            toast.success("สร้างใบแจ้งหนี้เรียบร้อยแล้ว");
            router.push("/invoices");
        } catch (error) {
            console.error(error);
            toast.error("เกิดข้อผิดพลาดในการบันทึก");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">สร้างใบแจ้งหนี้ใหม่</h2>
                    <p className="text-muted-foreground">
                        กรอกรายละเอียดเพื่อสร้างเอกสารใบแจ้งหนี้/ใบกำกับภาษี
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>ยกเลิก</Button>
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" /> บันทึกเอกสาร
                    </Button>
                </div>
            </div>

            <Form {...form}>
                <form className="space-y-8">

                    {/* Header Section */}
                    <Card>
                        <CardContent className="p-6 grid gap-6 md:grid-cols-2">

                            {/* Customer Selection */}
                            <FormField
                                control={form.control}
                                name="customerId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>ลูกค้า (Customer) <span className="text-red-500">*</span></FormLabel>
                                        <Popover open={openCustomer} onOpenChange={setOpenCustomer}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "justify-between",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value
                                                            ? customers.find((c) => c.id === field.value)?.name
                                                            : "เลือกลูกค้า..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[300px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="ค้นหาลูกค้า..." />
                                                    <CommandList>
                                                        <CommandEmpty>ไม่พบลูกค้า</CommandEmpty>
                                                        <CommandGroup>
                                                            {customers.map((customer) => (
                                                                <CommandItem
                                                                    value={customer.name}
                                                                    key={customer.id}
                                                                    onSelect={() => {
                                                                        form.setValue("customerId", customer.id);
                                                                        setOpenCustomer(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            customer.id === field.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {customer.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>เลขที่เอกสาร</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>วันที่เอกสาร</FormLabel>
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
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items Section */}
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="w-[50px] text-center">#</TableHead>
                                        <TableHead>รายการสินค้า/บริการ</TableHead>
                                        <TableHead className="w-[100px] text-right">จำนวน</TableHead>
                                        <TableHead className="w-[120px] text-right">ราคา/หน่วย</TableHead>
                                        <TableHead className="w-[120px] text-right">รวมเงิน</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((field, index) => (
                                        <InvoiceItemRow
                                            key={field.id}
                                            index={index}
                                            form={form}
                                            remove={remove}
                                            products={products} // Pass products here
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="p-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => append({ id: Math.random().toString(), description: "", quantity: 1, price: 0, discount: 0, vatRate: 7 })}
                                >
                                    <Plus className="h-4 w-4" /> เพิ่มรายการ
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Footer Totals */}
                    <div className="flex justify-end">
                        <Card className="w-[300px]">
                            <CardContent className="p-6 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">รวมเป็นเงิน</span>
                                    <span>{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                {totalDiscount > 0 && (
                                    <div className="flex justify-between text-sm text-red-500">
                                        <span>ส่วนลด</span>
                                        <span>-{totalDiscount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">ภาษีมูลค่าเพิ่ม (7%)</span>
                                    <span>{vatTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>ยอดสุทธิ</span>
                                    <span>{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </form>
            </Form>
        </div>
    );
}

// Extracted Component for Row to handle open state
function InvoiceItemRow({ index, form, remove, products }: { index: number, form: UseFormReturn<any>, remove: (index: number) => void, products: Product[] }) {
    const [open, setOpen] = useState(false);

    return (
        <TableRow>
            <TableCell className="text-center">{index + 1}</TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                            <div className="relative w-full">
                                <Input
                                    {...field}
                                    placeholder="ชื่อสินค้า/บริการ..."
                                    className="border-0 shadow-none focus-visible:ring-0 px-0 print:placeholder:text-transparent"
                                />
                            </div>
                        )}
                    />
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-blue-500"
                                title="เลือกจากคลังสินค้า"
                            >
                                <Package className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                            <Command>
                                <CommandInput placeholder="ค้นหาสินค้า..." />
                                <CommandList>
                                    <CommandEmpty>ไม่พบสินค้า</CommandEmpty>
                                    <CommandGroup heading="รายการสินค้า">
                                        {products.map((product) => (
                                            <CommandItem
                                                key={product.id}
                                                value={product.name}
                                                onSelect={() => {
                                                    form.setValue(`items.${index}.productId`, product.id);
                                                    form.setValue(`items.${index}.description`, product.name);
                                                    form.setValue(`items.${index}.price`, product.price);
                                                    form.setValue(`items.${index}.unit`, product.unit);
                                                    setOpen(false);
                                                }}
                                            >
                                                <div className="flex flex-col">
                                                    <span>{product.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {product.sku && `${product.sku} | `}{product.price.toLocaleString()} บาท/{product.unit}
                                                    </span>
                                                </div>
                                                <Check
                                                    className={cn(
                                                        "ml-auto h-4 w-4",
                                                        product.name === form.getValues(`items.${index}.description`)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                    )}
                                                />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </TableCell>
            <TableCell>
                <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                        <div className="space-y-1">
                            <Input
                                type="number"
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))}
                                className="text-right border-0 shadow-none focus-visible:ring-0 px-0"
                            />
                            {(() => {
                                const productId = form.getValues(`items.${index}.productId`);
                                const product = products.find(p => p.id === productId);
                                if (product && field.value > product.stockQuantity) {
                                    return (
                                        <div className="flex items-center justify-end gap-1 text-[10px] text-red-500 font-medium whitespace-nowrap">
                                            <AlertTriangle className="h-3 w-3" /> สต็อกไม่พอ (มี {product.stockQuantity})
                                        </div>
                                    );
                                } else if (product) {
                                    return (
                                        <div className="text-[10px] text-muted-foreground text-right">
                                            คงเหลือ {product.stockQuantity} {product.unit}
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    )}
                />
            </TableCell>
            <TableCell>
                <FormField
                    control={form.control}
                    name={`items.${index}.price`}
                    render={({ field }) => (
                        <Input
                            type="number"
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                            className="text-right border-0 shadow-none focus-visible:ring-0 px-0"
                        />
                    )}
                />
            </TableCell>
            <TableCell className="text-right font-medium text-slate-700">
                {(form.watch(`items.${index}.quantity`) * form.watch(`items.${index}.price`) || 0).toLocaleString()}
            </TableCell>
            <TableCell>
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
            </TableCell>
        </TableRow>
    );
}
