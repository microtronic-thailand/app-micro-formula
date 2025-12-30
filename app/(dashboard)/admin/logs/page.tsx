"use client";

import { useEffect, useState } from "react";
import { getAuditLogs } from "@/lib/data-service";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
    Loader2,
    History,
    User,
    FileText,
    Trash2,
    PlusCircle,
    Edit,
    ShieldAlert,
    Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        async function loadLogs() {
            setLoading(true);
            try {
                const data = await getAuditLogs();
                setLogs(data || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        loadLogs();
    }, []);

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'CREATE': return <PlusCircle className="h-4 w-4 text-green-500" />;
            case 'UPDATE': return <Edit className="h-4 w-4 text-blue-500" />;
            case 'DELETE': return <Trash2 className="h-4 w-4 text-red-500" />;
            case 'LOGIN': return <User className="h-4 w-4 text-purple-500" />;
            default: return <History className="h-4 w-4 text-slate-500" />;
        }
    };

    const getEntityBadge = (type: string) => {
        switch (type) {
            case 'INVOICE': return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Invoice</Badge>;
            case 'EXPENSE': return <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">Expense</Badge>;
            case 'PRODUCT': return <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">Product</Badge>;
            case 'CUSTOMER': return <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">Customer</Badge>;
            default: return <Badge variant="outline">{type}</Badge>;
        }
    };

    const filteredLogs = logs.filter(log =>
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Audit Trail (ประวัติการใช้งาน)</h2>
                <p className="text-muted-foreground">บันทึกการเปลี่ยนแปลงข้อมูลสำคัญในระบบ เพื่อความโปร่งใสและตรวจสอบได้</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">ประวัติ 500 รายการล่าสุด</CardTitle>
                    <div className="relative w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="ค้นหาประวัติ..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="w-[180px]">วัน-เวลา</TableHead>
                                <TableHead className="w-[100px]">การกระทำ</TableHead>
                                <TableHead className="w-[120px]">ประเภท</TableHead>
                                <TableHead>รายละเอียด</TableHead>
                                <TableHead className="text-right">Entity ID</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="text-xs font-medium">
                                        {format(new Date(log.created_at), "d MMM yy HH:mm:ss", { locale: th })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-xs font-bold">
                                            {getActionIcon(log.action)}
                                            {log.action}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getEntityBadge(log.entity_type)}</TableCell>
                                    <TableCell className="text-xs text-slate-600">
                                        {log.details || "-"}
                                    </TableCell>
                                    <TableCell className="text-right text-[10px] text-slate-400 font-mono">
                                        {log.entity_id}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-400">ไม่พบประวัติการใช้งาน</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg text-blue-800 text-xs">
                <ShieldAlert className="h-4 w-4" />
                <span>Audit Logs ถูกบันทึกโดยระบบโดยตรงและไม่สามารถลบหรือแก้ไขได้โดยผู้ใช้งานทั่วไป</span>
            </div>
        </div>
    );
}
