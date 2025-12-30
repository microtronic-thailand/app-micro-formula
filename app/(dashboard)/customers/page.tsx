"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Search, Loader2 } from "lucide-react";

import { getCustomers } from "@/lib/data-service";
import { Customer } from "@/types";
import { CustomerDialog } from "./customer-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const data = await getCustomers();
            setCustomers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.taxId?.includes(searchTerm) ||
        c.phone?.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">ลูกค้า (Customers)</h2>
                    <p className="text-muted-foreground">
                        จัดการรายชื่อลูกค้าและผู้ติดต่อของคุณ
                    </p>
                </div>
                <CustomerDialog onSuccess={fetchCustomers} />
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ค้นหาลูกค้า..."
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
                            <TableHead>ชื่อลูกค้า</TableHead>
                            <TableHead>เลขผู้เสียภาษี</TableHead>
                            <TableHead>เบอร์โทรศัพท์</TableHead>
                            <TableHead>ที่อยู่</TableHead>
                            <TableHead className="text-right">วันที่เพิ่ม</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> กำลังโหลด...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredCustomers.length > 0 ? (
                            filteredCustomers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium">
                                        <div>{customer.name}</div>
                                        <div className="text-xs text-muted-foreground">{customer.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        {customer.taxId ? (
                                            <div>
                                                {customer.taxId}
                                                <span className="ml-1 text-xs text-muted-foreground">
                                                    ({customer.branch || "สำนักงานใหญ่"})
                                                </span>
                                            </div>
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                    <TableCell>{customer.phone || "-"}</TableCell>
                                    <TableCell className="max-w-[300px] truncate">
                                        {customer.address || "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {format(new Date(customer.createdAt), "d MMM yyyy", { locale: th })}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    ไม่พบข้อมูลลูกค้า
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
