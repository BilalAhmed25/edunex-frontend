import React from "react";
import moment from "moment";
import ReportHeader from "@/components/ui/ReportHeader";

const SalaryReceipt = ({ data }) => {
    if (!data) return null;

    const formatCurrency = (val) => {
        return "Rs. " + (parseFloat(val) || 0).toLocaleString();
    };

    const toWords = (amount) => {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const convert = (num) => {
            if (num < 20) return ones[num];
            if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
            if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + convert(num % 100) : '');
            if (num < 100000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convert(num % 1000) : '');
            if (num < 10000000) return convert(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + convert(num % 100000) : '');
            return convert(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + convert(num % 10000000) : '');
        };

        const result = convert(Math.floor(amount));
        return "Amount In Words: Pakistani Rupee " + (result || 'Zero') + " Only";
    };

    const effectiveDays = (parseInt(data.PresentDays) || 0) + (parseInt(data.LateDays) || 0) + ((parseInt(data.HalfDays) || 0) * 0.5);

    return (
        <div className="bg-white px-8 w-[210mm] min-h-[297mm] text-slate-800 font-sans shadow-sm print:shadow-none mx-auto border border-slate-100">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
                <ReportHeader hideLogo={false} className="!mb-0" />
                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payslip For the Month</p>
                    <h1 className="text-lg font-bold text-slate-900 uppercase">
                        {data.Month} {data.Year}
                    </h1>
                </div>
            </div>

            {/* Employee Summary & Summary Box */}
            <div className="grid grid-cols-12 gap-6 mb-6">
                <div className="col-span-8">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1 mb-3">Employee Summary</h3>
                    <div className="grid grid-cols-12 gap-y-2 text-[11px]">
                        <div className="col-span-4 font-semibold text-slate-500">Employee Name:</div>
                        <div className="col-span-8 font-bold text-slate-900">{data.FirstName} {data.LastName}</div>

                        <div className="col-span-4 font-semibold text-slate-500">Designation:</div>
                        <div className="col-span-8 font-bold text-slate-900">{data.Designation || 'N/A'}</div>

                        <div className="col-span-4 font-semibold text-slate-500">Employee ID</div>
                        <div className="col-span-8 font-bold text-slate-900">{data.EmployeeID || 'N/A'}</div>

                        <div className="col-span-4 font-semibold text-slate-500">Pay Period:</div>
                        <div className="col-span-8 font-bold text-slate-900">{data.Month} {data.Year}</div>

                        <div className="col-span-4 font-semibold text-slate-500">Pay Date:</div>
                        <div className="col-span-8 font-bold text-slate-900">{data.PaymentDate ? moment(data.PaymentDate).format('dddd, DD MMM YYYY') : 'Pending'}</div>
                    </div>
                </div>

                <div className="col-span-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col items-center">
                        <div className="text-xl font-bold text-slate-900 mb-1">
                            {formatCurrency(data.NetSalary)}
                        </div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1 mb-2 w-full text-center">Net Pay</p>
                        <div className="w-full space-y-1 text-[10px]">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Paid Days:</span>
                                <span className="text-slate-900 font-bold">{effectiveDays}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-100 pt-1">
                                <span className="text-slate-500">LOP Days:</span>
                                <span className="text-slate-900 font-bold">{data.AbsentDays || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Info */}
            <div className="border-t border-b border-slate-200 py-2 mb-6 flex gap-8 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                <p>Voucher: <span className="text-slate-900">#{data.VoucherNumber || 'PENDING'}</span></p>
                <p>Status: <span className={data.Status === 'Paid' ? 'text-green-600' : 'text-amber-500'}>{data.Status}</span></p>
            </div>

            {/* Tables Section */}
            <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                    <table className="w-full text-left text-[11px] border border-slate-200">
                        <thead className="bg-slate-50 text-[9px] font-bold text-slate-400 uppercase">
                            <tr className="border-b">
                                <th className="px-3 py-2">Earnings</th>
                                <th className="px-3 py-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            <tr>
                                <td className="px-3 py-2">Basic (Pro-rated)</td>
                                <td className="px-3 py-2 text-right font-semibold">{formatCurrency(data.AttendanceSalary)}</td>
                            </tr>
                            {parseFloat(data.Bonus) > 0 && (
                                <tr>
                                    <td className="px-3 py-2 text-green-600">Institutional Bonus</td>
                                    <td className="px-3 py-2 text-right font-semibold text-green-600">{formatCurrency(data.Bonus)}</td>
                                </tr>
                            )}
                            <tr className="bg-slate-50 font-bold">
                                <td className="px-3 py-2 text-[10px]">Gross Earnings</td>
                                <td className="px-3 py-2 text-right">{formatCurrency(parseFloat(data.AttendanceSalary) + parseFloat(data.Bonus || 0))}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div>
                    <table className="w-full text-left text-[11px] border border-slate-200">
                        <thead className="bg-slate-50 text-[9px] font-bold text-slate-400 uppercase">
                            <tr className="border-b">
                                <th className="px-3 py-2">Deductions</th>
                                <th className="px-3 py-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {parseFloat(data.Deductions) > 0 ? (
                                <tr>
                                    <td className="px-3 py-2 text-rose-600">Adjustments / Dues</td>
                                    <td className="px-3 py-2 text-right font-semibold text-rose-600">{formatCurrency(data.Deductions)}</td>
                                </tr>
                            ) : (
                                <tr>
                                    <td className="px-3 py-8 text-slate-300 text-center" colSpan="2">No Deductions</td>
                                </tr>
                            )}
                            <tr className="bg-slate-50 font-bold">
                                <td className="px-3 py-2 text-[10px]">Total Deductions</td>
                                <td className="px-3 py-2 text-right">{formatCurrency(data.Deductions)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Total Balance */}
            <div className="border border-slate-900 flex justify-between items-center mb-4 p-3 bg-slate-900 text-white rounded">
                <span className="text-[11px] font-bold uppercase tracking-widest">Total Net Payable</span>
                <span className="text-lg font-bold">{formatCurrency(data.NetSalary)}</span>
            </div>

            <div className="mb-10 font-bold text-slate-500 text-[10px] text-right">
                {toWords(data.NetSalary)}
            </div>

            {/* Disclaimer */}
            <div className="border-t border-slate-200 pt-6 text-center opacity-70 grayscale">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Edunex ERP Cloud Generated Document • Signature Not Required
                </p>
                <div className="flex justify-center gap-8 text-[8px] text-slate-300 uppercase font-medium">
                    <span>Audit: {moment().format('YYYYMMDDHHmmss')}</span>
                    <span>System ID: {data.PayrollID}</span>
                </div>
            </div>
        </div>
    );
};

export default SalaryReceipt;
