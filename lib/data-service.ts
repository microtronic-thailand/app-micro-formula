"use server";
import { supabase } from './supabase';
import sql from './postgres';
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

const USE_LOCAL = process.env.USE_LOCAL_DB === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL;

// --- Profiles & RBAC ---

export async function localRegister(email: string) {
    // Check if user exists
    const existing = await sql`SELECT id FROM profiles WHERE email = ${email}`;
    if (existing.length > 0) throw new Error('ผู้ใช้รายนี้มีอยู่ในระบบแล้ว');

    const result = await sql`
        INSERT INTO profiles (email, role)
        VALUES (${email}, 'user')
        RETURNING *
    `;
    return result[0];
}

export async function localLogin(email: string) {
    const result = await sql`SELECT * FROM profiles WHERE email = ${email} LIMIT 1`;
    if (result.length === 0) throw new Error('ไม่พบชื่อผู้ใช้งานนี้');
    return result[0];
}

export async function getProfile(id: string) {
    if (USE_LOCAL) {
        try {
            const result = await sql`SELECT * FROM profiles WHERE id = ${id} LIMIT 1`;
            if (result.length === 0) {
                return {
                    id,
                    email: 'admin@local',
                    role: 'super_admin',
                    points: 0,
                    mustChangePassword: false,
                    lastActivityAt: new Date(),
                    createdAt: new Date()
                } as Profile;
            }
            const p = result[0];
            return {
                id: p.id,
                email: p.email,
                role: p.role,
                points: p.points || 0,
                mustChangePassword: p.must_change_password || false,
                lastActivityAt: p.last_activity_at,
                createdAt: p.created_at
            } as Profile;
        } catch (e) {
            console.error("Local Profile Error:", e);
            return { id, email: 'guest@local', role: 'super_admin', points: 0, mustChangePassword: false, lastActivityAt: new Date(), createdAt: new Date() } as Profile;
        }
    }

    try {
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
    } catch (e) {
        return null;
    }
}

export async function updateActivity(id: string) {
    if (USE_LOCAL) {
        try {
            await sql`UPDATE profiles SET last_activity_at = ${new Date()} WHERE id = ${id}`;
            if (Math.random() > 0.98) {
                await sql`UPDATE profiles SET points = points + 1 WHERE id = ${id}`;
            }
        } catch (e) {
            // silent fail
        }
        return;
    }

    try {
        // Update last activity timestamp
        await supabase
            .from('profiles')
            .update({ last_activity_at: new Date().toISOString() })
            .eq('id', id);

        // Hidden gimmick: small chance to increase points on activity update
        if (Math.random() > 0.98) {
            await supabase.rpc('increment_points', { row_id: id, amount: 1 });
        }
    } catch (e) {
        // Silent fail for local/offline
    }
}

export async function getAllProfiles() {
    if (USE_LOCAL) {
        const data = await sql`SELECT * FROM profiles ORDER BY created_at ASC`;
        return data.map((p: any) => ({
            id: p.id,
            email: p.email,
            role: p.role,
            points: p.points || 0,
            mustChangePassword: p.must_change_password || false,
            lastActivityAt: p.last_activity_at,
            createdAt: p.created_at
        })) as Profile[];
    }

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
    if (USE_LOCAL) {
        await sql`UPDATE profiles SET role = ${role} WHERE id = ${userId}`;
        return;
    }

    const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

    if (error) throw error;
}

export async function toggleForcePassword(userId: string, currentStatus: boolean) {
    if (USE_LOCAL) {
        await sql`UPDATE profiles SET must_change_password = ${!currentStatus} WHERE id = ${userId}`;
        return;
    }

    const { error } = await supabase
        .from('profiles')
        .update({ must_change_password: !currentStatus })
        .eq('id', userId);

    if (error) throw error;
}
export async function changePassword(userId: string, newPassword: string) {
    if (USE_LOCAL) {
        // In local mode, we just update the password_hash (plain text for simplicity in dev/offline)
        // Ideally we'd salt/hash here.
        await sql`
            UPDATE profiles 
            SET password_hash = ${newPassword}, 
                must_change_password = false 
            WHERE id = ${userId}
        `;
        return;
    }

    const { error } = await supabase.auth.updateUser({
        password: newPassword
    });
    if (error) throw error;

    // Clear force change flag in profile
    const { error: pError } = await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', userId);

    if (pError) throw pError;
}

// --- Expenses ---

export async function getExpenses() {
    if (USE_LOCAL) {
        const data = await sql`SELECT * FROM expenses ORDER BY date DESC`;
        return data.map((e: any) => ({
            id: e.id,
            description: e.description,
            amount: Number(e.amount),
            isVat: e.is_vat,
            vatAmount: Number(e.vat_amount),
            category: e.category,
            date: new Date(e.date),
            recipient: e.recipient,
            createdAt: new Date(e.created_at)
        })) as Expense[];
    }

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
    if (USE_LOCAL) {
        const result = await sql`
            INSERT INTO expenses (description, amount, is_vat, vat_amount, category, date, recipient)
            VALUES (${expense.description}, ${expense.amount}, ${expense.isVat || false}, ${expense.vatAmount || 0}, ${expense.category}, ${expense.date}, ${expense.recipient})
            RETURNING *
        `;
        return result[0] as Expense;
    }

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
    if (USE_LOCAL) {
        await sql`DELETE FROM expenses WHERE id = ${id}`;
        return;
    }

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
    if (USE_LOCAL) {
        const result = await sql`SELECT * FROM products ORDER BY name ASC`;
        return result.map((p: any) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            price: Number(p.price),
            unit: p.unit,
            description: p.description,
            stockQuantity: Number(p.stock_quantity) || 0,
            minStockLevel: Number(p.min_stock_level) || 0,
        })) as Product[];
    }

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
    if (USE_LOCAL) {
        const result = await sql`
            INSERT INTO products (name, sku, price, unit, description, stock_quantity, min_stock_level, category)
            VALUES (${product.name}, ${product.sku}, ${product.price}, ${product.unit}, ${product.description}, ${product.stockQuantity || 0}, ${product.minStockLevel || 0}, 'general')
            RETURNING *
        `;
        const newProduct = result[0];

        if (Number(product.stockQuantity) > 0) {
            await recordStockMovement({
                productId: newProduct.id,
                type: 'in',
                quantity: product.stockQuantity,
                notes: 'สต็อกเริ่มต้น'
            });
        }

        return newProduct;
    }

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

export async function updateProduct(id: string, product: Partial<Product>) {
    if (USE_LOCAL) {
        await sql`
            UPDATE products 
            SET name = ${product.name}, 
                sku = ${product.sku}, 
                price = ${product.price}, 
                unit = ${product.unit}, 
                description = ${product.description}, 
                min_stock_level = ${product.minStockLevel || 0},
                updated_at = ${new Date()}
            WHERE id = ${id}
        `;
        return;
    }

    const { error } = await supabase
        .from('products')
        .update({
            name: product.name,
            sku: product.sku,
            price: product.price,
            unit: product.unit,
            description: product.description,
            min_stock_level: product.minStockLevel,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) throw error;
}

export async function deleteProduct(id: string) {
    if (USE_LOCAL) {
        await sql`DELETE FROM products WHERE id = ${id}`;
        return;
    }

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
    if (USE_LOCAL) {
        const result = await sql`SELECT * FROM customers ORDER BY created_at DESC`;
        return result as any as Customer[];
    }

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
    if (USE_LOCAL) {
        const result = await sql`
            INSERT INTO customers (name, tax_id, address, email, phone, branch)
            VALUES (${customer.name}, ${customer.taxId}, ${customer.address}, ${customer.email}, ${customer.phone}, ${customer.branch})
            RETURNING *
        `;
        return result[0] as Customer;
    }

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

export async function updateCustomer(id: string, customer: Partial<Customer>) {
    if (USE_LOCAL) {
        await sql`
            UPDATE customers
            SET name = ${customer.name},
                tax_id = ${customer.taxId},
                address = ${customer.address},
                email = ${customer.email},
                phone = ${customer.phone},
                branch = ${customer.branch},
                updated_at = ${new Date()}
            WHERE id = ${id}
        `;
        return;
    }

    const { error } = await supabase
        .from('customers')
        .update({
            name: customer.name,
            tax_id: customer.taxId,
            address: customer.address,
            email: customer.email,
            phone: customer.phone,
            branch: customer.branch,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) throw error;
}

// --- Invoices ---

export async function getInvoices() {
    if (USE_LOCAL) {
        const data = await sql`SELECT * FROM invoices ORDER BY created_at DESC`;
        return data.map((inv: any) => ({
            id: inv.id,
            number: inv.number,
            date: new Date(inv.date),
            dueDate: new Date(inv.due_date),
            customerId: inv.customer_id,
            customerName: inv.customer_name,
            customerAddress: inv.customer_address,
            customerTaxId: inv.customer_tax_id,
            subtotal: Number(inv.subtotal),
            discountTotal: Number(inv.discount_total),
            vatTotal: Number(inv.vat_total),
            grandTotal: Number(inv.grand_total),
            status: inv.status,
            notes: inv.notes,
            createdAt: new Date(inv.created_at)
        })) as Invoice[];
    }

    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

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
    if (USE_LOCAL) {
        // Use a transaction if possible, but at least use sql
        const invResult = await sql`
            INSERT INTO invoices (number, date, due_date, customer_id, customer_name, customer_address, customer_tax_id, subtotal, discount_total, vat_total, grand_total, status, notes)
            VALUES (${invoice.number}, ${invoice.date}, ${invoice.dueDate}, ${invoice.customerId}, ${invoice.customerName}, ${invoice.customerAddress}, ${invoice.customerTaxId}, ${invoice.subtotal}, ${invoice.discountTotal}, ${invoice.vatTotal}, ${invoice.grandTotal}, ${invoice.status}, ${invoice.notes})
            RETURNING id
        `;
        const newInvoiceId = invResult[0].id;

        const itemsToInsert = invoice.items.map(item => ({
            invoice_id: newInvoiceId,
            product_id: item.productId,
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount,
            vat_rate: item.vatRate
        }));

        for (const item of itemsToInsert) {
            await sql`
                INSERT INTO invoice_items (invoice_id, product_id, description, quantity, price, discount, vat_rate)
                VALUES (${item.invoice_id}, ${item.product_id}, ${item.description}, ${item.quantity}, ${item.price}, ${item.discount}, ${item.vat_rate})
            `;
        }

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
    if (USE_LOCAL) {
        await sql`
            INSERT INTO stock_movements (product_id, type, quantity, reference_id, notes)
            VALUES (${movement.productId}, ${movement.type}, ${movement.quantity}, ${movement.referenceId}, ${movement.notes})
        `;

        const multiplier = movement.type === 'in' ? 1 : (movement.type === 'out' ? -1 : 0);
        if (multiplier !== 0) {
            await sql`
                UPDATE products 
                SET stock_quantity = stock_quantity + ${Number(movement.quantity) * multiplier}
                WHERE id = ${movement.productId}
            `;
        }
        return;
    }

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
    if (USE_LOCAL) {
        const data = await sql`SELECT * FROM stock_movements WHERE product_id = ${productId} ORDER BY created_at DESC`;
        return data.map((m: any) => ({
            id: m.id,
            productId: m.product_id,
            type: m.type,
            quantity: Number(m.quantity),
            referenceId: m.reference_id,
            notes: m.notes,
            createdAt: new Date(m.created_at)
        })) as StockMovement[];
    }

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
    if (USE_LOCAL) {
        const invRows = await sql`SELECT * FROM invoices WHERE id = ${id} LIMIT 1`;
        if (invRows.length === 0) throw new Error('Invoice not found');
        const inv = invRows[0];
        const itemRows = await sql`SELECT * FROM invoice_items WHERE invoice_id = ${id}`;

        return {
            id: inv.id,
            number: inv.number,
            date: new Date(inv.date),
            dueDate: new Date(inv.due_date),
            customerId: inv.customer_id,
            customerName: inv.customer_name,
            customerAddress: inv.customer_address,
            customerTaxId: inv.customer_tax_id,
            subtotal: Number(inv.subtotal),
            discountTotal: Number(inv.discount_total),
            vatTotal: Number(inv.vat_total),
            grandTotal: Number(inv.grand_total),
            status: inv.status,
            notes: inv.notes,
            createdAt: new Date(inv.created_at),
            items: itemRows.map((item: any) => ({
                id: item.id,
                productId: item.product_id,
                description: item.description,
                quantity: Number(item.quantity),
                price: Number(item.price),
                discount: Number(item.discount),
                vatRate: Number(item.vat_rate)
            }))
        } as Invoice;
    }

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
    if (USE_LOCAL) {
        const data = await sql`SELECT * FROM quotations ORDER BY created_at DESC`;
        return data.map((q: any) => ({
            id: q.id,
            number: q.number,
            date: new Date(q.date),
            dueDate: new Date(q.due_date),
            customerId: q.customer_id,
            customerName: q.customer_name,
            customerAddress: q.customer_address,
            customerTaxId: q.customer_tax_id,
            subtotal: Number(q.subtotal),
            discountTotal: Number(q.discount_total),
            vatTotal: Number(q.vat_total),
            grandTotal: Number(q.grand_total),
            status: q.status,
            notes: q.notes,
            createdAt: new Date(q.created_at)
        })) as Quotation[];
    }

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
    })) as Quotation[];
}

export async function createQuotation(quotation: any) {
    if (USE_LOCAL) {
        const qResult = await sql`
            INSERT INTO quotations (number, date, due_date, customer_id, customer_name, customer_address, customer_tax_id, subtotal, discount_total, vat_total, grand_total, status, notes)
            VALUES (${quotation.number}, ${quotation.date}, ${quotation.dueDate}, ${quotation.customerId}, ${quotation.customerName}, ${quotation.customerAddress}, ${quotation.customerTaxId}, ${quotation.subtotal}, ${quotation.discountTotal}, ${quotation.vatTotal}, ${quotation.grandTotal}, ${quotation.status}, ${quotation.notes})
            RETURNING id
        `;
        const newQuotationId = qResult[0].id;

        for (const item of quotation.items) {
            await sql`
                INSERT INTO quotation_items (quotation_id, product_id, description, quantity, price, discount, vat_rate)
                VALUES (${newQuotationId}, ${item.productId}, ${item.description}, ${item.quantity}, ${item.price}, ${item.discount}, ${item.vatRate})
            `;
        }
        return newQuotationId;
    }

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
    if (USE_LOCAL) {
        const qRows = await sql`SELECT * FROM quotations WHERE id = ${id} LIMIT 1`;
        if (qRows.length === 0) throw new Error('Quotation not found');
        const q = qRows[0];
        const itemRows = await sql`SELECT * FROM quotation_items WHERE quotation_id = ${id}`;

        return {
            id: q.id,
            number: q.number,
            date: new Date(q.date),
            dueDate: new Date(q.due_date),
            customerId: q.customer_id,
            customerName: q.customer_name,
            customerAddress: q.customer_address,
            customerTaxId: q.customer_tax_id,
            subtotal: Number(q.subtotal),
            discountTotal: Number(q.discount_total),
            vatTotal: Number(q.vat_total),
            grandTotal: Number(q.grand_total),
            status: q.status,
            notes: q.notes,
            createdAt: new Date(q.created_at),
            items: itemRows.map((item: any) => ({
                id: item.id,
                productId: item.product_id,
                description: item.description,
                quantity: Number(item.quantity),
                price: Number(item.price),
                discount: Number(item.discount),
                vatRate: Number(item.vat_rate)
            }))
        } as Quotation;
    }

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
    } as Quotation;
}

export async function convertQuotationToInvoice(quotationId: string) {
    if (USE_LOCAL) {
        const quotation = await getQuotationById(quotationId);
        const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

        const invResult = await sql`
            INSERT INTO invoices (number, date, due_date, customer_id, customer_name, customer_address, customer_tax_id, subtotal, discount_total, vat_total, grand_total, status, quotation_id)
            VALUES (${invoiceNumber}, ${new Date()}, ${new Date(new Date().setDate(new Date().getDate() + 30))}, ${quotation.customerId}, ${quotation.customerName}, ${quotation.customerAddress}, ${quotation.customerTaxId}, ${quotation.subtotal}, ${quotation.discountTotal}, ${quotation.vatTotal}, ${quotation.grandTotal}, 'issued', ${quotationId})
            RETURNING id
        `;
        const newInvoiceId = invResult[0].id;

        for (const item of quotation.items) {
            await sql`
                INSERT INTO invoice_items (invoice_id, product_id, description, quantity, price, discount, vat_rate)
                VALUES (${newInvoiceId}, ${item.productId}, ${item.description}, ${item.quantity}, ${item.price}, ${item.discount}, ${item.vatRate})
            `;

            if (item.productId) {
                await recordStockMovement({
                    productId: item.productId,
                    type: 'out',
                    quantity: item.quantity,
                    referenceId: newInvoiceId,
                    notes: `ขายตามใบแจ้งหนี้ #${invoiceNumber} (จากใบเสนอราคา #${quotation.number})`
                });
            }
        }

        await sql`UPDATE quotations SET status = 'invoiced' WHERE id = ${quotationId}`;
        return newInvoiceId;
    }

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
    if (USE_LOCAL) {
        const data = await sql`SELECT * FROM settings`;
        const result: Record<string, string> = {};
        data.forEach((s: any) => {
            result[s.key] = s.value;
        });
        return result;
    }

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
    if (USE_LOCAL) {
        await sql`
            INSERT INTO settings (key, value, updated_at)
            VALUES (${key}, ${value}, ${new Date()})
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
        `;
        return;
    }

    if (error) throw error;
}

// --- License Security ---
import { validateLicenseKey } from "./license-helper";

export async function getLicenseStatus() {
    if (USE_LOCAL) {
        // --- Development Bypass ---
        // If a valid key is provided in .env, use it (Easier for developers)
        const devKey = process.env.NEXT_PUBLIC_DEV_LICENSE_KEY || process.env.DEV_LICENSE_KEY;
        if (devKey) {
            const devResult = validateLicenseKey(devKey);
            if (devResult.isValid) return { isValid: true, status: 'active', data: devResult.data, isDev: true };
        }

        // Use a try-catch for SQL in case table doesn't exist or other issues
        try {
            const rows = await sql`SELECT value FROM settings WHERE key = 'license_key' LIMIT 1`;
            const key = rows[0]?.value;
            if (!key) return { isValid: false, status: 'missing' };

            const result = validateLicenseKey(key);
            if (!result.isValid) return { isValid: false, status: 'expired', error: result.error, data: result.data };

            return { isValid: true, status: 'active', data: result.data };
        } catch (e) {
            console.error("License check error", e);
            return { isValid: true, status: 'error' }; // Bypass on DB error to avoid total lock
        }
    }

    return { isValid: true, status: 'bypass' };
}

export async function updateLicenseKey(key: string) {
    const result = validateLicenseKey(key);
    if (!result.isValid && result.error?.includes("ลายเซ็น")) {
        throw new Error(result.error);
    }
    await updateSetting('license_key', key);
    return result.data;
}

export async function saveSettings(settings: Record<string, string>) {
    if (USE_LOCAL) {
        for (const [key, value] of Object.entries(settings)) {
            await updateSetting(key, value);
        }
        return;
    }

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
    if (USE_LOCAL) {
        const data = await sql`SELECT * FROM announcements WHERE is_active = true ORDER BY created_at DESC`;
        return data.map((a: any) => ({
            id: a.id,
            title: a.title,
            content: a.content,
            isActive: a.is_active,
            authorId: a.author_id,
            createdAt: a.created_at
        })) as Announcement[];
    }

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
    if (USE_LOCAL) {
        // Find admin user or guest
        const adminRows = await sql`SELECT id FROM profiles WHERE role = 'super_admin' LIMIT 1`;
        const adminId = adminRows[0]?.id;

        const result = await sql`
            INSERT INTO announcements (title, content, is_active, author_id)
            VALUES (${announcement.title}, ${announcement.content}, true, ${adminId})
            RETURNING *
        `;
        return result[0];
    }
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
    if (USE_LOCAL) {
        await sql`UPDATE announcements SET is_active = false WHERE id = ${id}`;
        return;
    }

    const { error } = await supabase
        .from('announcements')
        .update({ is_active: false })
        .eq('id', id);

    if (error) throw error;
}

// --- Backup & Restore ---
const TABLES = [
    "profiles",
    "customers",
    "products",
    "invoices",
    "invoice_items",
    "expenses",
    "quotations",
    "quotation_items",
    "settings",
    "announcements"
];

export async function exportData() {
    if (USE_LOCAL) {
        const backupData: Record<string, any> = {};
        for (const table of TABLES) {
            const data = await sql`SELECT * FROM ${sql(table)}`;
            backupData[table] = data;
        }
        return backupData;
    }

    const backupData: Record<string, any> = {};
    for (const table of TABLES) {
        const { data, error } = await supabase.from(table).select("*");
        if (error) throw error;
        backupData[table] = data;
    }
    return backupData;
}

export async function importData(data: Record<string, any>) {
    // Order matters for foreign keys
    const tablesOrder = [
        "profiles", "customers", "products", "settings", "announcements",
        "invoices", "quotations", "expenses",
        "invoice_items", "quotation_items"
    ];

    if (USE_LOCAL) {
        for (const table of tablesOrder) {
            const rows = data[table];
            if (rows && Array.isArray(rows) && rows.length > 0) {
                for (const row of rows) {
                    const keys = Object.keys(row);
                    const columns = keys.map(k => sql(k));
                    const values = keys.map(k => row[k]);

                    await sql`
                        INSERT INTO ${sql(table)} (${columns})
                        VALUES (${values})
                        ON CONFLICT (id) DO UPDATE SET 
                            ${keys.filter(k => k !== 'id').map(k => sql`${sql(k)} = EXCLUDED.${sql(k)}`).reduce((acc, curr) => sql`${acc}, ${curr}`)}
                    `;
                }
            }
        }
        return true;
    }

    // Supabase cloud UPSERT
    for (const table of tablesOrder) {
        if (data[table] && Array.isArray(data[table])) {
            const { error } = await supabase.from(table).upsert(data[table]);
            if (error) throw error;
        }
    }
    return true;
}
