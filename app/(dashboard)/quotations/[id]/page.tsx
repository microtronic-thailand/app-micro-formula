"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { Loader2, Printer, ArrowLeft, FileCheck } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

import { getQuotationById, convertQuotationToInvoice } from "@/lib/data-service";
import { Quotation } from "@/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function QuotationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const componentRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Quotation-${quotation?.number}`,
    });

    const handleConvertToInvoice = async () => {
        if (!quotation) return;
        try {
            setSubmitting(true);
            const invoiceId = await convertQuotationToInvoice(quotation.id);
            toast.success("แปลงเป็นใบแจ้งหนี้เรียบร้อยแล้ว");
            router.push(`/invoices/${invoiceId}`);
        } catch (error) {
            console.error(error);
            toast.error("เกิดข้อผิดพลาดในการแปลงเอกสาร");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            getQuotationById(params.id as string)
                .then(setQuotation)
                .catch((err) => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [params.id]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!quotation) {
        return <div className="text-center mt-10">ไม่พบใบเสนอราคา</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            {/* Toolbar */}
            <div className="flex items-center justify-between no-print">
                <Button variant="outline" onClick={() => router.back()} disabled={submitting}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> กลับ
                </Button>
                <div className="flex gap-2">
                    {quotation.status !== 'invoiced' && (
                        <Button
                            variant="outline"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={handleConvertToInvoice}
                            disabled={submitting}
                        >
                            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileCheck className="mr-2 h-4 w-4" />}
                            แปลงเป็นใบแจ้งหนี้
                        </Button>
                    )}
                    <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                        <Printer className="mr-2 h-4 w-4" /> พิมพ์ใบเสนอราคา
                    </Button>
                </div>
            </div>

            {/* A4 Paper View */}
            <div className="flex justify-center bg-slate-100 p-8 rounded-lg border shadow-sm print:bg-white print:border-none print:shadow-none print:p-0">
                <div
                    ref={componentRef}
                    className="bg-white p-12 w-[210mm] min-h-[297mm] shadow-lg print:shadow-none text-slate-800 relative"
                >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8 text-[11pt]">
                        <div>
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
                            <h2 className="text-4xl font-bold text-slate-200 uppercase tracking-widest mb-4">Quotation</h2>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-end gap-4">
                                    <span className="font-semibold text-slate-600">เลขที่เอกสาร:</span>
                                    <span className="font-bold">{quotation.number}</span>
                                </div>
                                <div className="flex justify-end gap-4">
                                    <span className="font-semibold text-slate-600">วันที่:</span>
                                    <span>{format(new Date(quotation.date), "d MMMM yyyy", { locale: th })}</span>
                                </div>
                                <div className="flex justify-end gap-4">
                                    <span className="font-semibold text-slate-600">ยืนราคาถึงวันที่:</span>
                                    <span>{format(new Date(quotation.dueDate), "d MMMM yyyy", { locale: th })}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-8" />

                    {/* Customer Info */}
                    <div className="mb-10 text-[11pt]">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">ลูกค้า (Customer)</h3>
                        <div className="text-lg font-bold text-slate-900">{quotation.customerName}</div>
                        <p className="text-sm max-w-[400px] mt-1 text-slate-600 whitespace-pre-line">
                            {quotation.customerAddress || "-"}
                        </p>
                        <p className="text-sm mt-2">
                            <span className="font-semibold">เลขประจำตัวผู้เสียภาษี:</span> {quotation.customerTaxId || "-"}
                        </p>
                    </div>

                    {/* Table */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b-2 border-slate-800 text-[11pt]">
                                <th className="text-left py-3 font-semibold text-slate-800 w-[50px]">ลำดับ</th>
                                <th className="text-left py-3 font-semibold text-slate-800">รายการ</th>
                                <th className="text-right py-3 font-semibold text-slate-800 w-[80px]">จำนวน</th>
                                <th className="text-right py-3 font-semibold text-slate-800 w-[120px]">ราคา/หน่วย</th>
                                <th className="text-right py-3 font-semibold text-slate-800 w-[120px]">รวมเงิน</th>
                            </tr>
                        </thead>
                        <tbody className="text-[10pt]">
                            {quotation.items.map((item, index) => (
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
                    <div className="flex justify-end text-[11pt]">
                        <div className="w-[300px] space-y-2 text-sm">
                            <div className="flex justify-between py-2 border-b border-slate-100">
                                <span className="font-medium text-slate-600">รวมเป็นเงิน</span>
                                <span className="font-medium">{quotation.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100">
                                <span className="font-medium text-slate-600">ภาษีมูลค่าเพิ่ม (7%)</span>
                                <span className="font-medium">{quotation.vatTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between py-4 text-lg font-bold text-slate-900">
                                <span>ยอดรวมสุทธิ</span>
                                <span>{quotation.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {quotation.notes && (
                        <div className="mt-8 p-4 bg-slate-50 rounded-lg text-sm italic">
                            <p className="font-semibold text-slate-600 inline">หมายเหตุ: </p>
                            <span className="text-slate-500">{quotation.notes}</span>
                        </div>
                    )}

                    {/* Signature */}
                    <div className="absolute bottom-12 left-12 right-12">
                        <div className="grid grid-cols-2 gap-10">
                            <div className="text-center mt-10">
                                <Separator className="mb-4" />
                                <span className="text-sm text-slate-500">ลงชื่อ ..................................................</span>
                                <br />
                                <span className="text-sm text-slate-500">( {quotation.customerName} )</span>
                                <br />
                                <span className="text-xs text-slate-400">ผู้อนุมัติสั่งซื้อ</span>
                            </div>
                            <div className="text-center mt-10">
                                <Separator className="mb-4" />
                                <span className="text-sm text-slate-500">ลงชื่อ ..................................................</span>
                                <br />
                                <span className="text-sm text-slate-500">ผู้เสนอราคา</span>
                                <br />
                                <span className="text-xs text-slate-400">วันที่ .......... / .......... / ..........</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
