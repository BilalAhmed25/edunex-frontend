import React, { useRef } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { useReactToPrint } from "react-to-print";
import html2pdf from "html2pdf.js";

const ReportViewer = ({ title = "Report Preview", onClose, children }) => {
    const reportRef = useRef();
    const [processing, setProcessing] = React.useState(false);

    // High-quality print handler
    const handlePrint = useReactToPrint({
        contentRef: reportRef,
        documentTitle: title,
        onBeforePrint: async () => {
            setProcessing(true);
            return Promise.resolve();
        },
        onAfterPrint: async () => {
            setProcessing(false);
            return Promise.resolve();
        },
        pageStyle: `
            @page {
                size: A4;
                margin: 5mm;
            }
        `
    });

    // High-quality PDF generation
    const handleDownload = async () => {
        if (processing) return;
        setProcessing(true);

        // Ensure we are at the top to avoid capture offsets
        window.scrollTo(0, 0);

        const element = reportRef.current;
        const opt = {
            margin: 5,
            filename: `${title.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                letterRendering: true,
                width: 794 // Fixed A4 width at 96 DPI
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            await html2pdf().set(opt).from(element).save();
        } catch (err) {
            console.error("PDF Generation Error:", err);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 md:p-8 animate-fade-in poppins no-print m-0">
            {/* Modal Container */}
            <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-full rounded-3xl shadow-2xl overflow-hidden flex flex-col border dark:border-slate-800">
                {/* Header Control Bar */}
                <div className="flex-none bg-white dark:bg-slate-800 border-b dark:border-slate-700 min-h-[4rem] flex flex-col sm:flex-row items-center justify-between px-4 py-3 sm:px-6 sm:py-0 shadow-sm gap-4 sm:gap-0">
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex-none flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-danger-500 transition-all active:scale-95"
                        >
                            <Icon icon="ph:arrow-left-bold" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <div className="min-w-0">
                            <h2 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight truncate">{title}</h2>
                            <p className="hidden sm:block text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Document Review & Processing</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar scroll-smooth">
                        <Button
                            text={processing ? "Processing..." : "Download"}
                            disabled={processing}
                            className={`bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 h-9 sm:h-10 px-4 sm:px-6 text-[9px] sm:text-[11px] uppercase border border-slate-200 dark:border-slate-600 whitespace-nowrap ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            icon={processing ? "ph:spinner-gap-bold animate-spin" : "ph:download-simple-bold"}
                            onClick={handleDownload}
                        />
                        <Button
                            text={processing ? "Preparing..." : "Print Document"}
                            disabled={processing}
                            className={`btn-primary h-9 sm:h-10 px-6 sm:px-8 text-[9px] sm:text-[11px] uppercase shadow-lg shadow-primary-500/20 whitespace-nowrap flex-1 sm:flex-none ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            icon={processing ? "ph:spinner-gap-bold animate-spin" : "ph:printer-bold"}
                            onClick={handlePrint}
                        />
                    </div>
                </div>

                {/* Content Area - A4 Centered */}
                <div className="flex-1 overflow-y-auto bg-slate-200/50 dark:bg-slate-950/50 p-4 md:p-12 custom-scrollbar">
                    <div className="mx-auto flex flex-col items-center">
                        {/* The Report Container - Forced Light Mode */}
                        <div
                            ref={reportRef}
                            className="bg-white shadow-2xl print:shadow-none"
                            id="document-to-process"
                        >
                            {children}
                        </div>

                        {/* Print Notice */}
                        <div className="mt-8 mb-2 flex flex-col items-center opacity-50">
                            <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[9px] tracking-widest mb-2">
                                <Icon icon="ph:info-bold" />
                                Page Size: A4 • 210mm x 297mm
                            </div>
                            <div className="h-1 w-20 bg-slate-300 dark:bg-slate-800 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Print Styles (Fallback/Additional) */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    #document-to-process {
                        width: 100% !important;
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        display: block !important;
                    }
                }
            ` }} />
        </div>
    );
};

export default ReportViewer;
