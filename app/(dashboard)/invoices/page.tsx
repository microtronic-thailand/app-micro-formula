"use client";

import Link from "next/link";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Plus, Search, FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getInvoices } from "@/lib/data-service";
import { Invoice } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const data = await getInvoices();
            setInvoices(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    // Status Badge Helper
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return <Badge className="bg-green-500">ชำระแล้ว</Badge>;
            case "issued":
                return <Badge variant="secondary">รอชำระ</Badge>;
            case "overdue":
                return <Badge variant="destructive">เกินกำหนด</Badge>;
            default:
                return <Badge variant="outline">ร่าง</Badge>;
        }
    };

    const filteredInvoices = invoices.filter((inv) =>
        inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">ใบแจ้งหนี้ (Invoices)</h2>
                    <p className="text-muted-foreground">
                        จัดการและติดตามสถานะการชำระเงินของลูกค้า
                    </p>
                </div>
                <Link href="/invoices/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> สร้างใบแจ้งหนี้
                    </Button>
                </Link>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ค้นหาเลขที่เอกสาร หรือ ชื่อลูกค้า..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>เลขที่เอกสาร</TableHead>
                            <TableHead>วันที่</TableHead>
                            <TableHead>ลูกค้า</TableHead>
                            <TableHead className="text-right">ยอดสุทธิ</TableHead>
                            <TableHead className="text-center">สถานะ</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> กำลังโหลด...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredInvoices.length > 0 ? (
                            filteredInvoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            {invoice.number}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(invoice.date), "d MMM yyyy", { locale: th })}
                                    </TableCell>
                                    <TableCell>{invoice.customerName}</TableCell>
                                    <TableCell className="text-right font-bold">
                                        {invoice.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {getStatusBadge(invoice.status)}
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/invoices/${invoice.id}`}>
                                            <Button variant="ghost" size="icon">
                                                <Search className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    ยังไม่มีใบแจ้งหนี้ เริ่มสร้างใบแรกได้เลย
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
