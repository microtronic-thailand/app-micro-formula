import { create } from 'zustand';
import { Customer, Invoice, Product } from '@/types';

interface AppState {
    customers: Customer[];
    products: Product[];
    invoices: Invoice[];

    addCustomer: (customer: Customer) => void;
    updateCustomer: (id: string, data: Partial<Customer>) => void;
    deleteCustomer: (id: string) => void;

    addInvoice: (invoice: Invoice) => void;
    updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
}

// Mock Data
const initialCustomers: Customer[] = [
    {
        id: '1',
        name: 'บริษัท ตัวอย่าง จำกัด',
        taxId: '1234567890123',
        address: '123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กทม. 10110',
        email: 'contact@example.com',
        phone: '02-123-4567',
        branch: 'สำนักงานใหญ่',
        createdAt: new Date(),
    },
    {
        id: '2',
        name: 'คุณสมชาย ใจดี',
        address: '99/9 หมู่บ้านจัดสรร ต.บางพลี อ.บางพลี สมุทรปราการ',
        email: 'somchai@email.com',
        phone: '081-999-9999',
        branch: '-',
        createdAt: new Date(),
    }
];

export const useStore = create<AppState>((set) => ({
    customers: initialCustomers,
    products: [],
    invoices: [],

    addCustomer: (customer) =>
        set((state) => ({ customers: [...state.customers, customer] })),

    updateCustomer: (id, data) =>
        set((state) => ({
            customers: state.customers.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),

    deleteCustomer: (id) =>
        set((state) => ({
            customers: state.customers.filter((c) => c.id !== id),
        })),

    addInvoice: (invoice) =>
        set((state) => ({ invoices: [...state.invoices, invoice] })),

    updateInvoiceStatus: (id, status) =>
        set((state) => ({
            invoices: state.invoices.map((inv) => (inv.id === id ? { ...inv, status } : inv)),
        })),
}));
