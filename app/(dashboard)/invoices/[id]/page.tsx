"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

import { getInvoiceById } from "@/lib/data-service";
import { Invoice } from "@/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function InvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [docMode, setDocMode] = useState<"invoice" | "receipt" | "tax-invoice">("invoice");

    const componentRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `${docMode === 'receipt' ? 'Receipt' : 'Invoice'}-${invoice?.number}`,
    });

    useEffect(() => {
        if (params.id) {
            getInvoiceById(params.id as string)
                .then((data) => {
                    setInvoice(data);
                    // Default to receipt if paid
                    if (data?.status === 'paid') {
                        setDocMode("receipt");
                    }
                })
                .catch((err) => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [params.id]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!invoice) {
        return <div className="text-center mt-10">ไม่พบใบแจ้งหนี้</div>;
    }

    const docTitle = docMode === "invoice" ? "ใบแจ้งหนี้" : docMode === "receipt" ? "ใบเสร็จรับเงิน" : "ใบกำกับภาษี/ใบเสร็จรับเงิน";
    const docEnglish = docMode === "invoice" ? "Invoice" : docMode === "receipt" ? "Receipt" : "Tax Invoice / Receipt";

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            {/* Toolbar */}
            <div className="flex items-center justify-between no-print bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> กลับ
                    </Button>
                    <div className="flex bg-slate-100 p-1 rounded-md">
                        <Button
                            variant={docMode === "invoice" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setDocMode("invoice")}
                        >
                            ใบแจ้งหนี้
                        </Button>
                        <Button
                            variant={docMode === "receipt" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setDocMode("receipt")}
                        >
                            ใบเสร็จ
                        </Button>
                        <Button
                            variant={docMode === "tax-invoice" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setDocMode("tax-invoice")}
                        >
                            ใบกำกับภาษี
                        </Button>
                    </div>
                </div>
                <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                    <Printer className="mr-2 h-4 w-4" /> พิมพ์{docTitle}
                </Button>
            </div>

            {/* A4 Paper View */}
            <div className="flex justify-center bg-slate-100 p-8 rounded-lg border shadow-sm print:bg-white print:border-none print:shadow-none print:p-0">
                <div
                    ref={componentRef}
                    className="bg-white p-12 w-[210mm] min-h-[297mm] shadow-lg print:shadow-none text-slate-800 relative"
                >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            {/* Logo Placeholder */}
                            <div className="h-12 w-12 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">
                                M
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900">บริษัท ไมโครโทรนิค จำกัด</h1>
                            <p className="text-sm text-muted-foreground max-w-[300px] mt-2">
                                123/45 ถนนนวัตกรรม แขวงเทคโนโลยี <br />
                                เขตดิจิทัล กรุงเทพฯ 10xxx <br />
                                โทร: 02-123-4567 <br />
                                เลขประจำตัวผู้เสียภาษี: 0123456789012
                            </p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-4xl font-bold text-slate-200 uppercase tracking-widest mb-2 leading-none">{docEnglish}</h2>
                            <h3 className="text-xl font-bold text-slate-400 mb-4">{docTitle}</h3>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-end gap-4">
                                    <span className="font-semibold text-slate-600">เลขที่เอกสาร:</span>
                                    <span className="font-bold">{invoice.number}</span>
                                </div>
                                <div className="flex justify-end gap-4">
                                    <span className="font-semibold text-slate-600">วันที่:</span>
                                    <span>{format(invoice.date, "d MMMM yyyy", { locale: th })}</span>
                                </div>
                                {docMode === "invoice" && (
                                    <div className="flex justify-end gap-4">
                                        <span className="font-semibold text-slate-600">วันครบกำหนด:</span>
                                        <span>{format(invoice.dueDate, "d MMMM yyyy", { locale: th })}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator className="my-8" />

                    {/* Customer Info */}
                    <div className="mb-10">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">ลูกค้า (Bill To)</h3>
                        <div className="text-lg font-bold text-slate-900">{invoice.customerName}</div>
                        <p className="text-sm max-w-[400px] mt-1 text-slate-600 whitespace-pre-line">
                            {invoice.customerAddress || "-"}
                        </p>
                        <p className="text-sm mt-2">
                            <span className="font-semibold">เลขประจำตัวผู้เสียภาษี:</span> {invoice.customerTaxId || "-"}
                        </p>
                    </div>

                    {/* Table Input */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b-2 border-slate-800">
                                <th className="text-left py-3 font-semibold text-slate-800 w-[50px]">ลำดับ</th>
                                <th className="text-left py-3 font-semibold text-slate-800">รายการ</th>
                                <th className="text-right py-3 font-semibold text-slate-800 w-[80px]">จำนวน</th>
                                <th className="text-right py-3 font-semibold text-slate-800 w-[120px]">ราคา/หน่วย</th>
                                <th className="text-right py-3 font-semibold text-slate-800 w-[120px]">รวมเงิน</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {invoice.items.map((item, index) => (
                                <tr key={item.id} className="border-b border-slate-100">
                                    <td className="py-4 text-center text-slate-500">{index + 1}</td>
                                    <td className="py-4">
                                        <div className="font-medium text-slate-900">{item.description}</div>
                                    </td>
                                    <td className="py-4 text-right text-slate-600">{item.quantity}</td>
                                    <td className="py-4 text-right text-slate-600">{item.price.toLocaleString()}</td>
                                    <td className="py-4 text-right font-medium text-slate-900">
                                        {(item.quantity * item.price).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Summary */}
                    <div className="flex justify-end">
                        <div className="w-[300px] space-y-2 text-sm">
                            <div className="flex justify-between py-2 border-b border-slate-100">
                                <span className="font-medium text-slate-600">รวมเป็นเงิน</span>
                                <span className="font-medium">{invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            {invoice.discountTotal > 0 && (
                                <div className="flex justify-between py-2 border-b border-slate-100 text-red-500">
                                    <span className="font-medium">ส่วนลด</span>
                                    <span>-{invoice.discountTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-2 border-b border-slate-100">
                                <span className="font-medium text-slate-600">ภาษีมูลค่าเพิ่ม (7%)</span>
                                <span className="font-medium">{invoice.vatTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between py-4 text-lg font-bold text-slate-900">
                                <span>จำนวนเงินรวมทั้งสิ้น</span>
                                <span>{invoice.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Signature */}
                    <div className="absolute bottom-12 left-12 right-12">
                        <div className="grid grid-cols-2 gap-10">
                            <div className="text-center mt-10">
                                <Separator className="mb-4" />
                                <span className="text-sm text-slate-500">ผู้รับวางบิล / ผู้รับสินค้า</span>
                                <br /><br />
                                <span className="text-xs text-slate-300">วันที่ .......... / .......... / ..........</span>
                            </div>
                            <div className="text-center mt-10">
                                <Separator className="mb-4" />
                                <span className="text-sm text-slate-500">ผู้มีอำนาจลงนาม</span>
                                <br /><br />
                                <span className="text-xs text-slate-300">วันที่ .......... / .......... / ..........</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
