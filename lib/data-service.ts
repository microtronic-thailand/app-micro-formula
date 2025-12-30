import { supabase } from './supabase';
import {
    Customer,
    Invoice,
    InvoiceItem,
    Product,
    Expense,
    Profile,
    UserRole,
    StockMovement,
    Quotation,
    SystemSettings,
    Announcement
} from '@/types';

// --- Profiles & RBAC ---

export async function getProfile(id: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .limit(1);

    if (error || !data || data.length === 0) return null;
    const profile = data[0];
    return {
        ...profile,
        points: profile.points || 0,
        mustChangePassword: profile.must_change_password || false,
        lastActivityAt: profile.last_activity_at,
        createdAt: profile.created_at
    } as Profile;
}

export async function updateActivity(id: string) {
    // Update last activity timestamp
    await supabase
        .from('profiles')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', id);

    // Hidden gimmick: small chance to increase points on activity update
    if (Math.random() > 0.98) {
        await supabase.rpc('increment_points', { row_id: id, amount: 1 });
    }
}

export async function getAllProfiles() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data.map((p: any) => ({
        ...p,
        points: p.points || 0,
        mustChangePassword: p.must_change_password || false,
        lastActivityAt: p.last_activity_at,
        createdAt: p.created_at
    })) as Profile[];
}

export async function updateUserRole(userId: string, role: UserRole) {
    const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

    if (error) throw error;
}

// --- Expenses ---

export async function getExpenses() {
    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching expenses:', error);
        throw error;
    }

    return data.map((e: any) => ({
        ...e,
        isVat: e.is_vat,
        vatAmount: e.vat_amount
    })) as Expense[];
}

export async function createExpense(expense: Partial<Expense>) {
    const { data, error } = await supabase
        .from('expenses')
        .insert([{
            description: expense.description,
            amount: expense.amount,
            is_vat: expense.isVat,
            vat_amount: expense.vatAmount,
            category: expense.category,
            date: expense.date,
            recipient: expense.recipient
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating expense:', error);
        throw error;
    }

    return data as Expense;
}

export async function deleteExpense(id: string) {
    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting expense:', error);
        throw error;
    }
}

// --- Products ---

export async function getProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching products:', error);
        throw error;
    }

    return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: p.price,
        unit: p.unit,
        description: p.description,
        stockQuantity: p.stock_quantity || 0,
        minStockLevel: p.min_stock_level || 0,
    })) as Product[];
}

export async function createProduct(product: Partial<Product>) {
    const { data, error } = await supabase
        .from('products')
        .insert([{
            name: product.name,
            sku: product.sku,
            price: product.price,
            unit: product.unit,
            description: product.description,
            stock_quantity: product.stockQuantity || 0,
            min_stock_level: product.minStockLevel || 0,
            category: 'general'
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating product:', error);
        throw error;
    }

    // Record initial stock movement if > 0
    if (product.stockQuantity && product.stockQuantity > 0) {
        await recordStockMovement({
            productId: data.id,
            type: 'in',
            quantity: product.stockQuantity,
            notes: 'จำนวนตั้งต้นตอนสร้างสินค้า'
        });
    }

    return data as Product;
}

export async function deleteProduct(id: string) {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}

// --- Customers ---

export async function getCustomers() {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching customers:', error);
        throw error;
    }

    return data as Customer[];
}

export async function createCustomer(customer: Partial<Customer>) {
    const { data, error } = await supabase
        .from('customers')
        .insert([{
            name: customer.name,
            tax_id: customer.taxId,
            address: customer.address,
            email: customer.email,
            phone: customer.phone,
            branch: customer.branch
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating customer:', error);
        throw error;
    }

    return data as Customer;
}

// --- Invoices ---

export async function getInvoices() {
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    // Convert snake_case to camelCase mapping if needed, 
    // but for now let's assume we might need a mapper or adjust Types.
    // Actually, Supabase returns what is in DB (snake_case columns).
    // Our Types are camelCase. We need a mapper.

    return data.map((inv: any) => ({
        id: inv.id,
        number: inv.number,
        date: new Date(inv.date),
        dueDate: new Date(inv.due_date),
        customerId: inv.customer_id,
        customerName: inv.customer_name,
        customerAddress: inv.customer_address,
        customerTaxId: inv.customer_tax_id,
        subtotal: inv.subtotal,
        discountTotal: inv.discount_total,
        vatTotal: inv.vat_total,
        grandTotal: inv.grand_total,
        status: inv.status,
        notes: inv.notes,
        createdAt: new Date(inv.created_at)
    })) as Invoice[];
}

export async function createInvoice(invoice: Invoice) {
    // This tool call is premature, I should check types.ts first to add Expense type.
    // Cancelling this replace to check types. Insert Invoice
    const { data: invData, error: invError } = await supabase
        .from('invoices')
        .insert([{
            number: invoice.number,
            date: invoice.date,
            due_date: invoice.dueDate,
            customer_id: invoice.customerId,
            customer_name: invoice.customerName,
            customer_address: invoice.customerAddress,
            customer_tax_id: invoice.customerTaxId,
            subtotal: invoice.subtotal,
            discount_total: invoice.discountTotal,
            vat_total: invoice.vatTotal,
            grand_total: invoice.grandTotal,
            status: invoice.status,
            notes: invoice.notes
        }])
        .select()
        .single();

    if (invError) throw invError;
    const newInvoiceId = invData.id;

    // 2. Insert Items
    const itemsToInsert = invoice.items.map(item => ({
        invoice_id: newInvoiceId,
        product_id: item.productId,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        vat_rate: item.vatRate
    }));

    const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert);

    if (itemsError) {
        // Rollback? Supabase doesn't support transaction via JS client easily yet without RPC.
        // For now, we accept risk or use RPC.
        console.error('Error creating items:', itemsError);
        // Clean up invoice if items fail
        await supabase.from('invoices').delete().eq('id', newInvoiceId);
        throw itemsError;
    }

    // 3. Stock update logic
    for (const item of invoice.items) {
        if (item.productId) {
            await recordStockMovement({
                productId: item.productId,
                type: 'out',
                quantity: item.quantity,
                referenceId: newInvoiceId,
                notes: `ขายตามใบแจ้งหนี้ #${invoice.number}`
            });
        }
    }

    return newInvoiceId;
}

export async function recordStockMovement(movement: Partial<StockMovement>) {
    // 1. Insert Movement
    const { error: moveError } = await supabase
        .from('stock_movements')
        .insert([{
            product_id: movement.productId,
            type: movement.type,
            quantity: movement.quantity,
            reference_id: movement.referenceId,
            notes: movement.notes
        }]);

    if (moveError) throw moveError;

    // 2. Update Product Stock
    const multiplier = movement.type === 'in' ? 1 : (movement.type === 'out' ? -1 : 0);

    if (multiplier !== 0) {
        const { error: updateError } = await supabase.rpc('increment_stock', {
            row_id: movement.productId,
            count: (movement.quantity || 0) * multiplier
        });

        // If RPC fails (e.g. not created yet), fallback to manual update (less atomic)
        if (updateError) {
            const { data: currentProd } = await supabase.from('products').select('stock_quantity').eq('id', movement.productId).single();
            const newStock = (currentProd?.stock_quantity || 0) + ((movement.quantity || 0) * multiplier);
            await supabase.from('products').update({ stock_quantity: newStock }).eq('id', movement.productId);
        }
    }
}

export async function getStockMovements(productId: string) {
    const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching stock movements:', error);
        throw error;
    }

    return data.map((m: any) => ({
        id: m.id,
        productId: m.product_id,
        type: m.type,
        quantity: m.quantity,
        referenceId: m.reference_id,
        notes: m.notes,
        createdAt: new Date(m.created_at)
    })) as StockMovement[];
}

export async function adjustStock(params: {
    productId: string;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    notes: string;
}) {
    // Record movement
    await recordStockMovement({
        productId: params.productId,
        type: params.type,
        quantity: params.quantity,
        notes: params.notes
    });
}

export async function getInvoiceById(id: string) {
    const { data, error } = await supabase
        .from('invoices')
        .select(`
            *,
            invoice_items (*)
        `)
        .eq('id', id)
        .single();

    if (error) throw error;

    // Map to camelCase
    return {
        id: data.id,
        number: data.number,
        date: new Date(data.date),
        dueDate: new Date(data.due_date),
        customerId: data.customer_id,
        customerName: data.customer_name,
        customerAddress: data.customer_address,
        customerTaxId: data.customer_tax_id,
        subtotal: data.subtotal,
        discountTotal: data.discount_total,
        vatTotal: data.vat_total,
        grandTotal: data.grand_total,
        status: data.status,
        notes: data.notes,
        createdAt: new Date(data.created_at),
        items: data.invoice_items.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount,
            vatRate: item.vat_rate
        }))
    } as Invoice;
}

export async function getQuotations() {
    const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((q: any) => ({
        id: q.id,
        number: q.number,
        date: new Date(q.date),
        dueDate: new Date(q.due_date),
        customerId: q.customer_id,
        customerName: q.customer_name,
        customerAddress: q.customer_address,
        customerTaxId: q.customer_tax_id,
        subtotal: q.subtotal,
        discountTotal: q.discount_total,
        vatTotal: q.vat_total,
        grandTotal: q.grand_total,
        status: q.status,
        notes: q.notes,
        createdAt: new Date(q.created_at)
    })) as any[];
}

export async function createQuotation(quotation: any) {
    const { data: qData, error: qError } = await supabase
        .from('quotations')
        .insert([{
            number: quotation.number,
            date: quotation.date,
            due_date: quotation.dueDate,
            customer_id: quotation.customerId,
            customer_name: quotation.customerName,
            customer_address: quotation.customerAddress,
            customer_tax_id: quotation.customerTaxId,
            subtotal: quotation.subtotal,
            discount_total: quotation.discountTotal,
            vat_total: quotation.vatTotal,
            grand_total: quotation.grandTotal,
            status: quotation.status,
            notes: quotation.notes
        }])
        .select()
        .single();

    if (qError) throw qError;
    const newQuotationId = qData.id;

    const itemsToInsert = quotation.items.map((item: any) => ({
        quotation_id: newQuotationId,
        product_id: item.productId,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        vat_rate: item.vatRate
    }));

    const { error: itemsError } = await supabase
        .from('quotation_items')
        .insert(itemsToInsert);

    if (itemsError) {
        await supabase.from('quotations').delete().eq('id', newQuotationId);
        throw itemsError;
    }

    return newQuotationId;
}

export async function getQuotationById(id: string) {
    const { data, error } = await supabase
        .from('quotations')
        .select(`
            *,
            quotation_items (*)
        `)
        .eq('id', id)
        .single();

    if (error) throw error;

    return {
        id: data.id,
        number: data.number,
        date: new Date(data.date),
        dueDate: new Date(data.due_date),
        customerId: data.customer_id,
        customerName: data.customer_name,
        customerAddress: data.customer_address,
        customerTaxId: data.customer_tax_id,
        subtotal: data.subtotal,
        discountTotal: data.discount_total,
        vatTotal: data.vat_total,
        grandTotal: data.grand_total,
        status: data.status,
        notes: data.notes,
        createdAt: new Date(data.created_at),
        items: data.quotation_items.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount,
            vatRate: item.vat_rate
        }))
    } as any;
}

export async function convertQuotationToInvoice(quotationId: string) {
    // 1. Get Quotation Data
    const { data: quotation, error: qError } = await supabase
        .from('quotations')
        .select(`
            *,
            quotation_items (*)
        `)
        .eq('id', quotationId)
        .single();

    if (qError) throw qError;

    // 2. Prepare Invoice Number
    const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // 3. Create Invoice
    const { data: invData, error: invError } = await supabase
        .from('invoices')
        .insert([{
            number: invoiceNumber,
            date: new Date(),
            due_date: new Date(new Date().setDate(new Date().getDate() + 30)),
            customer_id: quotation.customer_id,
            customer_name: quotation.customer_name,
            customer_address: quotation.customer_address,
            customer_tax_id: quotation.customer_tax_id,
            subtotal: quotation.subtotal,
            discount_total: quotation.discount_total,
            vat_total: quotation.vat_total,
            grand_total: quotation.grand_total,
            status: 'issued',
            quotation_id: quotationId
        }])
        .select()
        .single();

    if (invError) throw invError;

    // 4. Create Invoice Items
    const invoiceItems = quotation.quotation_items.map((item: any) => ({
        invoice_id: invData.id,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        vat_rate: item.vat_rate
    }));

    const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems);

    if (itemsError) throw itemsError;

    // 5. Update Quotation Status
    await supabase
        .from('quotations')
        .update({ status: 'invoiced' })
        .eq('id', quotationId);

    // 6. Deduct Stock
    for (const item of quotation.quotation_items) {
        // We need to know the productId. If quotation_items has it.
        // Let's assume quotation_items has product_id.
        if (item.product_id) {
            await recordStockMovement({
                productId: item.product_id,
                type: 'out',
                quantity: item.quantity,
                referenceId: invData.id,
                notes: `ขายตามใบแจ้งหนี้ #${invoiceNumber} (จากใบเสนอราคา #${quotation.number})`
            });
        }
    }

    return invData.id;
}

// --- System Settings & Announcements ---

export async function getSettings() {
    const { data, error } = await supabase
        .from('settings')
        .select('*');

    if (error) throw error;

    const result: Record<string, string> = {};
    data.forEach((s: any) => {
        result[s.key] = s.value;
    });
    return result;
}

export async function updateSetting(key: string, value: string) {
    const { error } = await supabase
        .from('settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) throw error;
}

export async function saveSettings(settings: Record<string, string>) {
    const entries = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
        .from('settings')
        .upsert(entries, { onConflict: 'key' });

    if (error) throw error;
}

export async function getAnnouncements() {
    const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((a: any) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        isActive: a.is_active,
        authorId: a.author_id,
        createdAt: a.created_at
    })) as Announcement[];
}

export async function createAnnouncement(announcement: Partial<Announcement>) {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('announcements')
        .insert([{
            title: announcement.title,
            content: announcement.content,
            is_active: true,
            author_id: user?.id
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteAnnouncement(id: string) {
    const { error } = await supabase
        .from('announcements')
        .update({ is_active: false })
        .eq('id', id);

    if (error) throw error;
}
