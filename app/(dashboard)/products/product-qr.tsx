"use client";

import { useRef } from "react";
import QRCode from "react-qr-code";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Printer, QrCode } from "lucide-react";
import { Product } from "@/types";

interface ProductQRCodeProps {
    product: Product;
}

export function ProductQRCode({ product }: ProductQRCodeProps) {
    const componentRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Label-${product.sku || product.name}`,
    });

    // Create a structured data string for the QR code
    // Format: "ID:SKU:NAME:PRICE" or just a simpler URL/ID depending on needs.
    // User wants "Check details", so ideally a URL to details page? 
    // Or just JSON data that can be parsed by mobile app/scanner.
    // Let's us a simple text format first that allows identification.
    // Or better: URL scheme if we had a mobile app, but for now let's use a JSON object string
    // which is flexible. Or simply the Product ID to fetch from DB.
    // If the requirement is "Scan via Mobile", usually it means opening a URL.
    // Let's assume we might have a public or internal URL: /products/{id}
    const qrValue = `${window.location.origin}/products/${product.id}`;
    // This allows scanning with phone camera -> Opens the page (if we implement [id] page).
    // Or we can embed details:
    // const qrValue = JSON.stringify({ i: product.id, n: product.name, p: product.price });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-800">
                    <QrCode className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>QR Code & Label</DialogTitle>
                    <DialogDescription>
                        สแกนเพื่อดูรายละเอียด หรือปริ้นสติกเกอร์ติดสินค้า
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center py-6 gap-6">
                    {/* Printable Area */}
                    <div
                        ref={componentRef}
                        className="border p-4 rounded-lg flex flex-col items-center text-center w-[250px] bg-white text-black"
                    >
                        <h3 className="font-bold text-lg mb-2 truncate w-full">{product.name}</h3>
                        <div className="bg-white p-2">
                            <QRCode
                                value={qrValue}
                                size={120}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                viewBox={`0 0 256 256`}
                            />
                        </div>
                        <p className="font-mono text-sm mt-2">{product.sku || product.id.slice(0, 8)}</p>
                        <p className="font-bold text-xl mt-1">{product.price.toLocaleString()} ฿</p>
                    </div>

                    <div className="flex gap-4 w-full">
                        <Button className="w-full" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" /> ปริ้นสติกเกอร์ (Print)
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
