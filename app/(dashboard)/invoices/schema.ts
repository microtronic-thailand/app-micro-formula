import * as z from "zod";

export const invoiceItemSchema = z.object({
    id: z.string(),
    productId: z.string().optional(),
    description: z.string().min(1, "กรุณาระบุรายการ"),
    quantity: z.number().min(1, "จำนวนต้องมากกว่า 0"),
    price: z.number().min(0, "ราคาต้องไม่ติดลบ"),
    unit: z.string().optional(),
    discount: z.number().min(0).optional().default(0),
    vatRate: z.number().default(7),
});

export const invoiceSchema = z.object({
    number: z.string().min(1, "กรุณาระบุเลขที่เอกสาร"),
    date: z.date(),
    dueDate: z.date(),
    customerId: z.string().min(1, "กรุณาเลือกลูกค้า"),
    items: z.array(invoiceItemSchema).min(1, "ต้องมีรายการสินค้าอย่างน้อย 1 รายการ"),
    notes: z.string().optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
