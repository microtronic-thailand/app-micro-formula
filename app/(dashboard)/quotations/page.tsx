"use client";

import Link from "next/link";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Plus, Search, FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getQuotations } from "@/lib/data-service";
import { Quotation } from "@/types";
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

export default function QuotationsPage() {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");

    const fetchQuotations = async () => {
        try {
            setLoading(true);
            const data = await getQuotations();
            setQuotations(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotations();
    }, []);

    // Status Badge Helper
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "accepted":
                return <Badge className="bg-green-500">อนุมัติแล้ว</Badge>;
            case "sent":
                return <Badge variant="secondary">ส่งแล้ว</Badge>;
            case "rejected":
                return <Badge variant="destructive">ไม่อนุมัติ</Badge>;
            case "invoiced":
                return <Badge className="bg-blue-500">เปิดบิลแล้ว</Badge>;
            default:
                return <Badge variant="outline">ร่าง</Badge>;
        }
    };

    const filteredQuotations = quotations.filter((q) => {
        const matchesSearch = q.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.customerName.toLowerCase().includes(searchTerm.toLowerCase());

        const qDate = new Date(q.date).getTime();
        const matchesStart = dateStart ? qDate >= new Date(dateStart).getTime() : true;
        const matchesEnd = dateEnd ? qDate <= new Date(dateEnd).getTime() : true;

        return matchesSearch && matchesStart && matchesEnd;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">ใบเสนอราคา (Quotations)</h2>
                    <p className="text-muted-foreground">
                        สร้างแผนเสนอราคาและส่งให้ลูกค้าพิจารณา
                    </p>
                </div>
                <Link href="/quotations/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> สร้างใบเสนอราคา
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ค้นหาเลขที่เอกสาร หรือ ชื่อลูกค้า..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        type="date"
                        className="w-40"
                        value={dateStart}
                        onChange={(e) => setDateStart(e.target.value)}
                    />
                    <span className="text-slate-400">-</span>
                    <Input
                        type="date"
                        className="w-40"
                        value={dateEnd}
                        onChange={(e) => setDateEnd(e.target.value)}
                    />
                    {(dateStart || dateEnd) && (
                        <Button variant="ghost" size="sm" onClick={() => { setDateStart(""); setDateEnd(""); }}>
                            ล้าง
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>เลขที่เอกสาร</TableHead>
                            <TableHead>วันที่</TableHead>
                            <TableHead>ลูกค้า</TableHead>
                            <TableHead className="text-right">ยอดรวม</TableHead>
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
                        ) : filteredQuotations.length > 0 ? (
                            filteredQuotations.map((q) => (
                                <TableRow key={q.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            {q.number}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(q.date), "d MMM yyyy", { locale: th })}
                                    </TableCell>
                                    <TableCell>{q.customerName}</TableCell>
                                    <TableCell className="text-right font-bold">
                                        {q.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {getStatusBadge(q.status)}
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/quotations/${q.id}`}>
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
                                    ยังไม่มีใบเสนอราคา เริ่มสร้างใบแรกได้เลย
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
