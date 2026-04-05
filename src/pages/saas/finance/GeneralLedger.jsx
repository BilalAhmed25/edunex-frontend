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

const GeneralLedger = () => {
    const [loading, setLoading] = useState(false);
    const [ledgerData, setLedgerData] = useState([]);
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
                    text="Print Audit Statement"
                    className="btn-primary px-6 rounded-lg font-bold uppercase tracking-wider text-[10px] h-11"
                    icon="ph:printer-bold"
                    onClick={() => window.print()}
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
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-950 border dark:border-slate-800 p-2 px-4 rounded-xl">
                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-r dark:border-slate-800 pr-4 h-5 flex items-center">Audit Range</span>
                        <div className="flex items-center gap-3">
                            <Textinput
                                type="date"
                                label="Start Date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(p => ({ ...p, start: e.target.value }))}
                                className=""
                                inputClass="h-7 text-[11px] border-0 bg-transparent font-bold !no-border p-0 w-[100px]"
                            />
                            <Icon icon="ph:arrows-left-right-bold" className="text-slate-300 w-3 h-3" />
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
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
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

            {/* PRINT OPTIMIZATION CSS */}
            <style>
                {`
                    @media print {
                        .no-print, nav, header, aside, .btn-primary, .flex-wrap, .page-header-actions {
                            display: none !important;
                        }
                        .card, .bg-white {
                            box-shadow: none !important;
                            border: 1px solid #eee !important;
                        }
                        body {
                            background: white !important;
                            color: black !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default GeneralLedger;
