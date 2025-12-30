export type UserRole = 'user' | 'admin' | 'super_admin';

export type Profile = {
    id: string;
    email: string;
    role: UserRole;
    points: number;
    mustChangePassword: boolean;
    lastActivityAt: Date;
    createdAt: Date;
};

export type SystemSettings = {
    id: string;
    key: string;
    value: string;
    updatedAt: Date;
};

export type Announcement = {
    id: string;
    title: string;
    content: string;
    isActive: boolean;
    authorId: string;
    createdAt: Date;
};

export type Customer = {
    id: string;
    name: string;
    taxId?: string; // เลขผู้เสียภาษี
    address?: string;
    email?: string;
    phone?: string;
    branch?: string; // สำนักงานใหญ่/สาขา
    createdAt: Date;
};

export type Product = {
    id: string;
    name: string;
    sku?: string;
    price: number;
    unit: string;
    description?: string;
    stockQuantity: number;
    minStockLevel?: number;
};

export type StockMovement = {
    id: string;
    productId: string;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    referenceId?: string;
    notes?: string;
    createdAt: Date;
};

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'invoiced' | 'expired';

export type LineItem = {
    id: string;
    productId?: string;
    description: string;
    quantity: number;
    price: number;
    discount: number; // ส่วนลดต่อรายการ (บาท)
    vatRate: number; // 0 or 7
};

export type InvoiceItem = LineItem;

export type Quotation = {
    id: string;
    number: string;
    date: Date;
    dueDate: Date;
    customerId: string;
    customerName: string;
    customerAddress?: string;
    customerTaxId?: string;
    items: LineItem[];
    subtotal: number;
    discountTotal: number;
    vatTotal: number;
    grandTotal: number;
    status: QuotationStatus;
    notes?: string;
    createdAt: Date;
};

export type Invoice = {
    id: string;
    number: string; // INV-2025-001
    date: Date;
    dueDate: Date;
    customerId: string;
    customerName: string; // Snapshot name at time of invoice
    customerAddress?: string;
    customerTaxId?: string;

    items: InvoiceItem[];

    // Totals
    subtotal: number;
    discountTotal: number;
    vatTotal: number;
    grandTotal: number;
    whtTotal?: number; // หัก ณ ที่จ่าย

    status: InvoiceStatus;
    notes?: string;
    createdAt: Date;
};

export type Expense = {
    id: string;
    date: Date;
    description: string;
    amount: number;
    vatAmount?: number;
    isVat?: boolean;
    category?: string;
    recipient?: string;
    receiptUrl?: string;
    paymentStatus?: 'pending' | 'paid' | 'cancelled';
    isReconciled?: boolean;
    whtAmount?: number;
    userId?: string;
    createdAt: Date;
};

