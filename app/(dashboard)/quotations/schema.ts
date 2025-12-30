import * as z from "zod";

export const quotationSchema = z.object({
    number: z.string().min(1, "กรุณากรอกเลขที่เอกสาร"),
    date: z.date({
        required_error: "กรุณาเลือกวันที่เอกสาร",
    }),
    dueDate: z.date({
        required_error: "กรุณาเลือกวันครบกำหนด",
    }),
    customerId: z.string().min(1, "กรุณาเลือกลูกค้า"),
    items: z.array(z.object({
        id: z.string(),
        productId: z.string().optional(),
        description: z.string().min(1, "กรุณากรอกรายละเอียด"),
        quantity: z.number().min(0.01, "จำนวนต้องมากกว่า 0"),
        price: z.number().min(0, "ราคาต้องไม่ติดลบ"),
        unit: z.string().optional(),
        discount: z.number().default(0),
        vatRate: z.number().default(7),
    })).min(1, "ต้องมีอย่างน้อย 1 รายการ"),
    notes: z.string().optional(),
    vatRate: z.number().default(7),
});

export type QuotationFormValues = z.infer<typeof quotationSchema>;
