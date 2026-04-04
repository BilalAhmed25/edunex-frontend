import React from "react";
import moment from "moment";
import ReportHeader from "@/components/ui/ReportHeader";

const FeeVoucher = ({ voucher, copyTitle = "Office Copy" }) => {
    if (!voucher) return null;

    return (
        <div className="bg-white text-slate-900 poppins w-full sm:w-[794px] min-h-[374px] flex flex-col border border-dashed border-slate-300 last:mb-0 print:border-solid print:rounded-none print:shadow-none print:mb-0 print:w-[210mm] print:min-h-[99mm] print:border-b-2">
            {/* Branding Header */}
            <ReportHeader className="bg-slate-50/50 p-3" />

            {/* Sub Header / Voucher Type */}
            <div className="flex justify-between items-center px-6 py-2 bg-white">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{copyTitle}</span>
                </div>
                <div className="text-right">
                    <div className="text-[9px] text-slate-600 font-bold uppercase tracking-tight leading-none">Voucher #</div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">{voucher.VoucherNumber}</div>
                </div>
            </div>

            {/* Content Body */}
            <div className="px-6 py-2 flex gap-6">
                {/* Student Info */}
                <div className="w-[35%] space-y-5 border-r border-slate-200 pr-6">
                    <div>
                        <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Student Credentials</div>
                        <h4 className="text-[13px] font-black text-slate-900 dark:text-white uppercase leading-none">{voucher.FirstName} {voucher.LastName}</h4>
                        <div className="flex items-center gap-2 mt-1.5 font-bold text-[10px] text-slate-700">
                            <span>Admission No:</span>
                            <span className="text-slate-900 dark:text-slate-200 tracking-widest">{voucher.AdmissionNumber}</span>
                        </div>
                    </div>

                    <div className="space-y-3.5">
                        <div className="flex flex-col border-t border-slate-200 pt-2">
                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter mb-0.5">Class / Standard</span>
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">{voucher.ClassName}</span>
                        </div>
                        <div className="flex flex-col border-t border-slate-200 pt-2">
                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter mb-0.5">Academic Session</span>
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{voucher.AcademicYearName}</span>
                        </div>
                        <div className="flex flex-col border-t border-slate-200 pt-2">
                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter mb-0.5">Voucher Date</span>
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{moment(voucher.CreatedAt).format('DD MMM YYYY')}</span>
                        </div>
                    </div>

                    {/* <div className="pt-4 border-t-2 border-slate-900 dark:border-slate-200 flex flex-col gap-0.5">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Document Status</span>
                        <span className={`text-[12px] font-black uppercase ${voucher.Status === 'Paid' ? 'text-success-600' : 'text-slate-900 dark:text-white'}`}>
                            {voucher.Status}
                        </span>
                    </div> */}
                </div>

                {/* Bill Items */}
                <div className="flex-1 flex flex-col">
                    <div className="mb-2">
                        <table className="w-full text-[11px] border-collapse">
                            <thead className="bg-slate-50 border-b sticky top-0">
                                <tr>
                                    <th className="py-1.5 text-left font-black uppercase text-slate-600 tracking-wider">Fee Description</th>
                                    <th className="py-1.5 text-right font-black uppercase text-slate-600 tracking-wider">Month</th>
                                    <th className="py-1.5 text-right font-black uppercase text-slate-600 tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {voucher.items?.map((item, idx) => (
                                    <tr key={idx} className="transition-colors hover:bg-slate-50/50">
                                        <td className="py-1.5 font-bold text-slate-700 dark:text-slate-300">{item.FeeType}</td>
                                        <td className="py-1.5 text-right text-slate-700">{item.Month}</td>
                                        <td className="py-1.5 text-right font-black text-slate-800 dark:text-slate-100">{item.Amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="pt-2 border-t-2 border-slate-200 space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-slate-600 uppercase tracking-widest">Subtotal</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">Rs. {voucher.TotalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-slate-600 uppercase tracking-widest">Concession</span>
                            <span className="font-black text-success-500">-Rs. {voucher.ConcessionAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 mt-1 border-t border-dashed underline-offset-4">
                            <span className="text-[12px] font-black text-slate-900 dark:text-white uppercase">Gross Payable</span>
                            <span className="text-lg font-black text-primary-500">Rs. {voucher.PayableAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Notice */}
            <div className="px-6 py-2 bg-slate-50 border-t border-slate-200 text-center">
                <p className="text-[8px] text-slate-600">This is a computer generated document. Physical signatures are not required for validation.</p>
            </div>
        </div>
    );
};

export default FeeVoucher;
