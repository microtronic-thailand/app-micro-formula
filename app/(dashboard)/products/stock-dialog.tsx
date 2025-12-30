"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Product, StockMovement } from "@/types";
import { adjustStock, getStockMovements } from "@/lib/data-service";
import { toast } from "sonner";
import { Loader2, History, PlusCircle, MinusCircle, Settings2 } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StockAdjustmentDialogProps {
    product: Product | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function StockAdjustmentDialog({ product, open, onOpenChange, onSuccess }: StockAdjustmentDialogProps) {
    const [loading, setLoading] = useState(false);
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Form state
    const [type, setType] = useState<'in' | 'out' | 'adjustment'>('in');
    const [quantity, setQuantity] = useState<string>("1");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (open && product) {
            loadHistory();
        }
    }, [open, product]);

    async function loadHistory() {
        if (!product) return;
        setLoadingHistory(true);
        try {
            const data = await getStockMovements(product.id);
            setMovements(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingHistory(false);
        }
    }

    async function handleSubmit() {
        if (!product) return;
        const qty = parseFloat(quantity);
        if (isNaN(qty) || qty <= 0) {
            toast.error("กรุณาระบุจำนวนที่ถูกต้อง");
            return;
        }

        setLoading(true);
        try {
            await adjustStock({
                productId: product.id,
                type,
                quantity: qty,
                notes: notes || (type === 'in' ? 'รับสินค้าเข้า' : type === 'out' ? 'เบิกสินค้าออก' : 'ปรับปรุงสต็อก')
            });
            toast.success("บันทึกการปรับปรุงสต็อกเรียบร้อย");
            setQuantity("1");
            setNotes("");
            loadHistory();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถบันทึกข้อมูลได้");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Settings2 className="h-5 w-5 text-blue-500" />
                        จัดการสต็อก: {product?.name}
                    </DialogTitle>
                    <DialogDescription>
                        ปรับปรุงจำนวนสินค้าในคลังและดูประวัติการเคลื่อนไหว
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="adjust" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="adjust">ปรับปรุงจำนวน</TabsTrigger>
                        <TabsTrigger value="history">ประวัติความเคลื่อนไหว</TabsTrigger>
                    </TabsList>

                    <TabsContent value="adjust" className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>ประเภทรายการ</Label>
                                <Select value={type} onValueChange={(v: any) => setType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="in">รับสินค้าเข้า (+)</SelectItem>
                                        <SelectItem value="out">เบิกสินค้าออก (-)</SelectItem>
                                        <SelectItem value="adjustment">ปรับปรุง (อื่นๆ)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>จำนวน ({product?.unit})</Label>
                                <Input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>หมายเหตุ</Label>
                            <Input
                                placeholder="เช่น รับจากซัพพลายเออร์, ของเสีย, ฯลฯ"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                บันทึกรายการ
                            </Button>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg border text-sm mt-4">
                            <div className="font-medium text-slate-700 mb-1">สถานะปัจจุบัน</div>
                            <div className="flex justify-between items-center text-2xl font-bold">
                                <span>คงเหลือ {product?.stockQuantity} {product?.unit}</span>
                                <span className="text-slate-400 text-sm font-normal">ขั้นต่ำ {product?.minStockLevel} {product?.unit}</span>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="py-4">
                        <div className="rounded-md border max-h-[400px] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">วันที่</TableHead>
                                        <TableHead>รายการ</TableHead>
                                        <TableHead className="text-right">จำนวน</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingHistory ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8">
                                                <Loader2 className="h-4 w-4 animate-spin mx-auto mr-2" /> กำลังโหลดประวัติ...
                                            </TableCell>
                                        </TableRow>
                                    ) : movements.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                ไม่พบประวัติการเคลื่อนไหว
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        movements.map((m) => (
                                            <TableRow key={m.id}>
                                                <TableCell className="text-xs">
                                                    {format(new Date(m.createdAt), "dd/MM/yy HH:mm")}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">{m.notes}</div>
                                                    <div className="text-[10px] text-muted-foreground">ประเภท: {
                                                        m.type === 'in' ? 'รับเข้า' :
                                                            m.type === 'out' ? 'เบิกออก' : 'ปรับปรุง'
                                                    }</div>
                                                </TableCell>
                                                <TableCell className={`text-right font-bold ${m.type === 'in' ? 'text-green-600' :
                                                        m.type === 'out' ? 'text-red-600' : 'text-slate-600'
                                                    }`}>
                                                    {m.type === 'in' ? '+' : m.type === 'out' ? '-' : ''}{m.quantity}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
