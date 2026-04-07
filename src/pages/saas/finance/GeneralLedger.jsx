import React, { useState, useEffect } from "react";
import { get } from "@/lib/apiClient";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import DataTable from "@/components/ui/DataTable";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import SkeletonTable from "@/components/skeleton/Table";
import PageHeader from "@/components/ui/PageHeader";
import { toast } from "react-toastify";
import moment from "moment";
import ReportHeader from "@/components/ui/ReportHeader";
import ReportViewer from "@/components/ui/ReportViewer";

const GeneralLedger = () => {
    const [loading, setLoading] = useState(false);
    const [ledgerData, setLedgerData] = useState([]);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: moment().startOf('month').format('YYYY-MM-DD'),
        end: moment().format('YYYY-MM-DD')
    });

    const fetchLedger = async () => {
        try {
            setLoading(true);
            const res = await get(`/finance/combined-ledger?startDate=${dateRange.start}&endDate=${dateRange.end}`);
            setLedgerData(res.data);
        } catch (err) {
            toast.error("Failed to generate ledger");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLedger();
    }, [dateRange]);

    const stats = {
        income: ledgerData.filter(i => i.Type === 'Income').reduce((a, c) => a + parseFloat(c.Amount), 0),
        expense: ledgerData.filter(i => i.Type === 'Expense').reduce((a, c) => a + parseFloat(c.Amount), 0),
    };
    stats.balance = stats.income - stats.expense;

    const columns = [
        {
            Header: "Transaction Date",
            accessor: "Date",
            Cell: ({ value }) => <span className="text-slate-700 dark:text-slate-200">{moment(value).format('DD MMM YYYY')}</span>
        },
        {
            Header: "Reference",
            accessor: "Reference",
            Cell: ({ value, row }) => (
                <div className="flex flex-col">
                    <span className="font-black text-primary-500 text-[10px] uppercase tracking-tighter">#{value}</span>
                    <span className="text-[11px] text-slate-400 font-bold uppercase">{row.original.Category}</span>
                </div>
            )
        },
        {
            Header: "Statement Memo",
            accessor: "Description",
            Cell: ({ value }) => <span className="text-[12px] text-slate-500 max-w-[400px] truncate block">{value}</span>
        },
        {
            Header: "Accounting Type",
            accessor: "Type",
            Cell: ({ value }) => (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit ${value === 'Income' ? 'bg-green-50 dark:bg-green-500/10 text-success-600 dark:text-success-500' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500'}`}>
                    <Icon icon={value === 'Income' ? 'ph:arrow-down-left-bold' : 'ph:arrow-up-right-bold'} className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{value === 'Income' ? 'Credit' : 'Debit'}</span>
                </div>
            )
        },
        {
            Header: "Amount (Rs.)",
            accessor: "Amount",
            Cell: ({ value, row }) => (
                <span className={`font-black text-[14px] ${row.original.Type === 'Income' ? 'text-success-600' : 'text-rose-600'}`}>
                    {row.original.Type === 'Income' ? '+' : '-'} {parseFloat(value).toLocaleString()}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:database-bold"
                title="General Ledger"
                description="Comprehensive financial record aggregating institutional collections and expenditures."
            >
                <Button
                    text="Preview Audit Statement"
                    className="btn-primary px-6 rounded-lg font-bold uppercase tracking-wider text-[10px] h-11"
                    icon="ph:file-pdf-bold"
                    onClick={() => setIsReportOpen(true)}
                />
            </PageHeader>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border dark:border-[#2f3336]" bodyClass="p-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-green-50 dark:bg-green-500/20 flex items-center justify-center text-success-600 dark:text-success-400">
                            <Icon icon="ph:trend-up-bold" className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Credit (Income)</div>
                            <div className="text-2xl font-black text-slate-800 dark:text-slate-100">Rs. {stats.income.toLocaleString()}</div>
                        </div>
                    </div>
                </Card>
                <Card className="border dark:border-[#2f3336]" bodyClass="p-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                            <Icon icon="ph:trend-down-bold" className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Debit (Expense)</div>
                            <div className="text-2xl font-black text-slate-800 dark:text-slate-100">Rs. {stats.expense.toLocaleString()}</div>
                        </div>
                    </div>
                </Card>
                <Card className={`border dark:border-[#2f3336] ${stats.balance >= 0 ? 'bg-green-50/10 dark:bg-green-500/5' : 'bg-rose-50/10 dark:bg-rose-500/5'}`} bodyClass="p-4">
                    <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${stats.balance >= 0 ? 'bg-green-50 dark:bg-green-500/20 text-success-600 dark:text-success-400' : 'bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
                            <Icon icon={stats.balance >= 0 ? "ph:wallet-bold" : "ph:warning-circle-bold"} className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Fiscal Balance</div>
                            <div className={`text-2xl font-black ${stats.balance >= 0 ? 'text-success-600' : 'text-rose-600'}`}>Rs. {stats.balance.toLocaleString()}</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filter Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-950 border dark:border-slate-800 p-3 px-4 rounded-xl">
                <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-r dark:border-slate-800 pr-4 h-5 flex items-center whitespace-nowrap">Audit Range</span>
                        <div className="flex items-center gap-3 flex-1 overflow-x-auto no-scrollbar">
                            <Textinput
                                type="date"
                                label="Start Date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(p => ({ ...p, start: e.target.value }))}
                                className=""
                                inputClass="h-7 text-[11px] border-0 bg-transparent font-bold !no-border p-0 w-[100px]"
                            />
                            <Icon icon="ph:arrows-left-right-bold" className="text-slate-300 w-3 h-3 flex-shrink-0" />
                            <Textinput
                                type="date"
                                label="End Date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(p => ({ ...p, end: e.target.value }))}
                                className=""
                                inputClass="h-7 text-[11px] border-0 bg-transparent font-bold !no-border p-0 w-[100px]"
                            />
                        </div>
                    </div>
                </div>
                <div className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest text-center md:text-right border-t md:border-t-0 border-slate-100 dark:border-slate-900 pt-3 md:pt-0 w-full md:w-auto">
                    Generated on {moment().format('DD MMM YYYY, hh:mm A')}
                </div>
            </div>

            {/* Table Card */}
            <Card className="border dark:border-[#2f3336]" bodyClass="p-0">
                {loading ? (
                    <SkeletonTable count={10} />
                ) : (
                    <DataTable
                        columns={columns}
                        data={ledgerData}
                        className=" text-[13px]"
                    />
                )}
            </Card>

            {/* AUDIT STATEMENT REPORT VIEWER */}
            {isReportOpen && (
                <ReportViewer
                    title="Financial Audit Statement"
                    onClose={() => setIsReportOpen(false)}
                >
                    <div className="bg-white border px-4 w-[210mm] min-h-[297mm] text-slate-900 shadow-sm print:shadow-none">
                        <ReportHeader className="mb-8" />

                        <div className="flex justify-between items-end border-b-2 border-slate-800 pb-4 mb-6">
                            <div>
                                <h4 className="text-xl font-black text-slate-900 uppercase leading-none mb-1">General Ledger Audit Statement</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Date Range: {moment(dateRange.start).format('DD MMM YYYY')} — {moment(dateRange.end).format('DD MMM YYYY')}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Generated On</p>
                                <p className="text-[11px] font-black text-slate-700 uppercase">{moment().format('DD MMM YYYY [@] hh:mm A')}</p>
                            </div>
                        </div>

                        {/* Summary Block in Report */}
                        <div className="grid grid-cols-3 border-y border-slate-200 py-4 mb-8 text-slate-800">
                             <div className="text-center border-r border-slate-200">
                                 <p className="text-[9px] font-black uppercase text-slate-400">Total Credits</p>
                                 <p className="text-lg font-black text-success-600">Rs. {stats.income.toLocaleString()}</p>
                             </div>
                             <div className="text-center border-r border-slate-200">
                                 <p className="text-[9px] font-black uppercase text-slate-400">Total Debits</p>
                                 <p className="text-lg font-black text-rose-600">Rs. {stats.expense.toLocaleString()}</p>
                             </div>
                             <div className="text-center">
                                 <p className="text-[9px] font-black uppercase text-slate-400">Net Fiscal Balance</p>
                                 <p className={`text-lg font-black ${stats.balance >= 0 ? "text-success-600" : "text-rose-600"}`}>Rs. {stats.balance.toLocaleString()}</p>
                             </div>
                        </div>

                        <div className="overflow-visible">
                            <table className="w-full text-left text-[11px] border-collapse border border-slate-300 text-slate-800">
                                <thead className="bg-slate-50 border-b border-slate-300">
                                    <tr className="text-slate-700 font-black uppercase tracking-wider text-[9px]">
                                        <th className="px-3 py-2 border border-slate-300">Date</th>
                                        <th className="px-3 py-2 border border-slate-300">Reference / Type</th>
                                        <th className="px-3 py-2 border border-slate-300">Statement Memo</th>
                                        <th className="px-3 py-2 border border-slate-300 text-right">Debit (Dr)</th>
                                        <th className="px-3 py-2 border border-slate-300 text-right">Credit (Cr)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ledgerData.map((item, id) => (
                                        <tr key={id} className="border-b border-slate-200">
                                            <td className="px-3 py-2 border border-slate-300 whitespace-nowrap align-top">{moment(item.Date).format('DD MMM YYYY')}</td>
                                            <td className="px-3 py-2 border border-slate-300 align-top">
                                                <div className="font-black text-primary-600 text-[10px] uppercase">#{item.Reference}</div>
                                                <div className="text-[8px] font-black text-slate-400 uppercase">{item.Category}</div>
                                            </td>
                                            <td className="px-3 py-2 border border-slate-300 text-slate-600 text-[10px] italic">{item.Description}</td>
                                            <td className="px-3 py-2 border border-slate-300 text-right font-black text-rose-600">
                                                {item.Type === 'Expense' ? `Rs. ${parseFloat(item.Amount).toLocaleString()}` : "—"}
                                            </td>
                                            <td className="px-3 py-2 border border-slate-300 text-right font-black text-success-600">
                                                {item.Type === 'Income' ? `Rs. ${parseFloat(item.Amount).toLocaleString()}` : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-100 font-black">
                                        <td colSpan={3} className="px-3 py-2 border border-slate-300 text-right uppercase tracking-widest text-[9px]">Combined Totals</td>
                                        <td className="px-3 py-2 border border-slate-300 text-right text-[12px] text-rose-600">Rs. {stats.expense.toLocaleString()}</td>
                                        <td className="px-3 py-2 border border-slate-300 text-right text-[12px] text-success-600">Rs. {stats.income.toLocaleString()}</td>
                                    </tr>
                                    <tr className="bg-slate-200 font-black">
                                         <td colSpan={3} className="px-3 py-2 border border-slate-300 text-right uppercase tracking-widest text-[10px]">Audit Statement Net Balance</td>
                                         <td colSpan={2} className={`px-3 py-2 border border-slate-300 text-right text-[16px] ${stats.balance >=0 ? 'text-success-700' : 'text-rose-700'}`}>
                                             Rs. {stats.balance.toLocaleString()}
                                         </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Audit Footer */}
                        <div className="mt-12 flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-widest border-t border-dashed border-slate-300 pt-6">
                            <div>Audit Trace ID: {moment().format('X')}</div>
                            <div>Financial Compliance Statement Verified</div>
                        </div>
                    </div>
                </ReportViewer>
            )}
        </div>
    );
};

export default GeneralLedger;
