"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, Package, Trash2, Settings2 } from "lucide-react";
import { toast } from "sonner";

import { getProducts, deleteProduct } from "@/lib/data-service";
import { Product } from "@/types";
import { ProductDialog } from "./product-dialog";
import { ProductQRCode } from "./product-qr";
import { StockAdjustmentDialog } from "./stock-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [stockProduct, setStockProduct] = useState<Product | null>(null);
    const [stockDialogOpen, setStockDialogOpen] = useState(false);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถโหลดข้อมูลสินค้าได้");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteProduct(id);
            toast.success("ลบสินค้าเรียบร้อยแล้ว");
            fetchProducts();
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถลบสินค้าได้");
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">สินค้าและบริการ (Products)</h2>
                    <p className="text-muted-foreground">
                        จัดการฐานข้อมูลสินค้าและบริการของคุณ
                    </p>
                </div>
                <ProductDialog onSuccess={fetchProducts} />
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ค้นหาชื่อสินค้า หรือ รหัสสินค้า (SKU)..."
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
                            <TableHead>รหัสสินค้า</TableHead>
                            <TableHead>ชื่อสินค้า</TableHead>
                            <TableHead>รายละเอียด</TableHead>
                            <TableHead className="text-right">ราคาต่อหน่วย</TableHead>
                            <TableHead className="text-center">หน่วยนับ</TableHead>
                            <TableHead className="text-right">คงเหลือ</TableHead>
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
                        ) : filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium text-muted-foreground">
                                        {product.sku || "-"}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4 text-blue-500" />
                                            {product.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate text-muted-foreground">
                                        {product.description || "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-center text-sm text-muted-foreground">
                                        {product.unit}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge
                                            variant={product.stockQuantity <= (product.minStockLevel || 0) ? "destructive" : "secondary"}
                                            className="font-bold"
                                        >
                                            {product.stockQuantity.toLocaleString()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                                onClick={() => {
                                                    setStockProduct(product);
                                                    setStockDialogOpen(true);
                                                }}
                                                title="จัดการสต็อก"
                                            >
                                                <Settings2 className="h-4 w-4" />
                                            </Button>
                                            <ProductQRCode product={product} />
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>ยืนยันการลบสินค้า?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            คุณต้องการลบ "{product.name}" ใช่หรือไม่?
                                                            การกระทำนี้ไม่สามารถย้อนกลับได้
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-red-500 hover:bg-red-600">
                                                            ยืนยันลบ
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    ไม่พบสินค้า
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <StockAdjustmentDialog
                product={stockProduct}
                open={stockDialogOpen}
                onOpenChange={setStockDialogOpen}
                onSuccess={fetchProducts}
            />
        </div>
    );
}
