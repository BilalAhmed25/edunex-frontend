import React, { useState, useEffect } from "react";
import { get, put } from "@/lib/apiClient";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import SkeletonTable from "@/components/skeleton/Table";
import PageHeader from "@/components/ui/PageHeader";
import { toast } from "react-toastify";
import moment from "moment";
import ReportHeader from "@/components/ui/ReportHeader";
import FeeVoucher from "@/components/finance/FeeVoucher";
import ReportViewer from "@/components/ui/ReportViewer";

const Collections = () => {
    const [loading, setLoading] = useState(false);
    const [vouchers, setVouchers] = useState([]);
    const [ledgerData, setLedgerData] = useState([]);
    const [isLedgerOpen, setIsLedgerOpen] = useState(false);
    const [ledgerLoading, setLedgerLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: moment().startOf('month').format('YYYY-MM-DD'),
        end: moment().format('YYYY-MM-DD')
    });

    const [activeVoucher, setActiveVoucher] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [fetchingId, setFetchingId] = useState(null);

    const fetchVouchers = async () => {
        try {
            setLoading(true);
            const res = await get(`/finance/vouchers?startDate=${dateRange.start}&endDate=${dateRange.end}`);
            setVouchers(res.data);
        } catch (err) {
            toast.error("Failed to load collection records");
        } finally {
            setLoading(false);
        }
    };

    const fetchLedger = async () => {
        try {
            setLedgerLoading(true);
            const res = await get(`/finance/ledger?startDate=${dateRange.start}&endDate=${dateRange.end}`);
            setLedgerData(res.data);
            setIsLedgerOpen(true);
        } catch (err) {
            toast.error("Failed to generate ledger");
        } finally {
            setLedgerLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, [dateRange]);

    const handleUpdateStatus = async (id, status) => {
        try {
            await put(`/finance/vouchers/${id}/status`, { status });
            toast.success(`Voucher marked as ${status}`);
            fetchVouchers();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const columns = [
        {
            Header: "Voucher #",
            accessor: "VoucherNumber",
            Cell: ({ value }) => <span className="font-black text-primary-400 text-[11px]">{value}</span>
        },
        {
            Header: "Issue Date",
            accessor: "CreatedAt",
            Cell: ({ value }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-[11px] mb-1">{moment(value).format('DD MMM YYYY')}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">{moment(value).format('hh:mm A')}</span>
                </div>
            )
        },
        {
            Header: "Student Identity",
            Cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Icon icon="ph:user-bold" className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <div className="font-black text-[11px] text-slate-800 dark:text-slate-100 uppercase mb-1">{row.original.FirstName} {row.original.LastName}</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">{row.original.AdmissionNumber} • {row.original.ClassName}</div>
                    </div>
                </div>
            )
        },
        {
            Header: "Fiscal Summary",
            accessor: "Status",
            Cell: ({ value, row }) => (
                <div className="flex items-center gap-2 group">
                    <Badge
                        label={`${row.original.PayableAmount.toLocaleString()} ${value}`}
                        className={`px-3 py-1 rounded tracking-wider ${value === 'Paid' ? 'badge-soft-success border-success-200' :
                            value === 'Pending' ? 'badge-soft-warning border-warning-200' : 'badge-soft-danger border-danger-200'
                            }`}
                    />
                    <div className="flex items-center bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 p-0.5 rounded-lg">
                        <button onClick={() => handleUpdateStatus(row.original.ID, 'Paid')} title="Mark Paid" className={`p-1 rounded ${value === 'Paid' ? 'text-success-500 bg-white shadow-sm' : 'text-slate-400 hover:text-success-500'}`}><Icon icon="ph:check-circle-bold" className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleUpdateStatus(row.original.ID, 'Pending')} title="Mark Pending" className={`p-1 rounded ${value === 'Pending' ? 'text-warning-500 bg-white shadow-sm' : 'text-slate-400 hover:text-warning-500'}`}><Icon icon="ph:clock-bold" className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleUpdateStatus(row.original.ID, 'Cancelled')} title="Cancel Voucher" className={`p-1 rounded ${value === 'Cancelled' ? 'text-danger-500 bg-white shadow-sm' : 'text-slate-400 hover:text-danger-500'}`}><Icon icon="ph:prohibit-bold" className="w-3.5 h-3.5" /></button>
                    </div>
                </div>
            )
        },
        {
            Header: "Actions",
            Cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <button
                        className="h-8 w-8 bg-slate-100 hover:bg-primary-500 dark:bg-slate-800 hover:text-white transition-all rounded-lg flex items-center justify-center text-slate-500"
                        onClick={async () => {
                            setFetchingId(row.original.ID);
                            try {
                                const res = await get(`/finance/vouchers/${row.original.ID}`);
                                setActiveVoucher(res.data);
                                setIsPreviewOpen(true);
                            } catch (err) {
                                toast.error("Could not retrieve voucher");
                            } finally {
                                setFetchingId(null);
                            }
                        }}
                        disabled={fetchingId === row.original.ID}
                        title="Print Voucher"
                    >
                        {fetchingId === row.original.ID ? (
                            <Icon icon="ph:spinner-gap-bold" className="w-4 h-4" />
                        ) : (
                            <Icon icon="ph:printer-bold" className="w-4 h-4" />
                        )}
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:archive-bold"
                title="Voucher History"
                description="View and manage generated student fee vouchers and transaction logs."
            >
                <Button
                    text={ledgerLoading ? "Please wait..." : "Collection Ledger"}
                    className="btn-primary px-4 rounded-lg font-bold uppercase tracking-wider text-[10px] h-10 shadow-lg shadow-primary-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    icon={ledgerLoading ? "ph:spinner-gap-bold animate-spin" : "ph:file-text-bold"}
                    onClick={fetchLedger}
                    disabled={ledgerLoading}
                />
            </PageHeader>

            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-950 border dark:border-slate-800 p-2 px-3 rounded-xl">
                <div className="flex gap-3 items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-r dark:border-slate-800 pr-3 h-5 flex items-center">Filter Range</span>
                    <div className="flex items-center gap-2">
                        <Textinput
                            type="date"
                            label="Start Date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(p => ({ ...p, start: e.target.value }))}
                            className=""
                            inputClass="h-7 text-[11px] border-1 bg-transparent font-bold !no-border p-0 w-[95px]"
                        />
                        <Icon icon="ph:arrow-right-bold" className="text-slate-300 w-2.5 h-2.5" />
                        <Textinput
                            type="date"
                            label="End Date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(p => ({ ...p, end: e.target.value }))}
                            className=""
                            inputClass="h-7 text-[11px] border-0 bg-transparent font-bold !no-border p-0 w-[95px]"
                        />
                    </div>
                    <Button
                        text="Refresh"
                        className="btn-light h-9 px-4 rounded-lg font-bold text-[10px] uppercase flex items-center gap-2 border-dashed"
                        onClick={fetchVouchers}
                        icon="ph:arrows-clockwise-bold"
                    />
                </div>

                <div className="flex items-center gap-6 pr-2">
                    <div className="flex flex-col text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Total Collection Logged</span>
                        <span className="text-lg font-black text-muted-800 dark:text-slate-200">Rs. {vouchers.reduce((acc, curr) => acc + (curr.Status === 'Paid' ? parseFloat(curr.PayableAmount) : 0), 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card className="border dark:border-[#2f3336]" bodyClass="p-0">
                    {loading ? (
                        <SkeletonTable count={10} />
                    ) : (
                        <DataTable
                            columns={columns}
                            data={vouchers}
                            className=" text-[13px]"
                        />
                    )}
                </Card>
            </div>

            {/* LEDGER REPORT VIEWER */}
            {isLedgerOpen && (
                <ReportViewer
                    title="Collection Ledger Report"
                    onClose={() => setIsLedgerOpen(false)}
                >
                    <div className="bg-white border px-4 w-[210mm] min-h-[297mm]  text-slate-900 shadow-sm print:shadow-none">
                        <ReportHeader className="mb-8" />

                        <div className="flex justify-between items-end border-b-2 border-slate-800 pb-4 mb-6">
                            <div>
                                <h4 className="text-xl font-black text-slate-900 uppercase leading-none mb-1">Financial Audit Ledger</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Date Range: {moment(dateRange.start).format('DD MMM YYYY')} — {moment(dateRange.end).format('DD MMM YYYY')}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Generated On</p>
                                <p className="text-[11px] font-black text-slate-700 uppercase">{moment().format('DD MMM YYYY [@] hh:mm A')}</p>
                            </div>
                        </div>

                        <div className="overflow-visible">
                            <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
                                <thead className="bg-slate-50 border-b border-slate-300">
                                    <tr className="text-slate-700 font-black uppercase tracking-wider text-[9px]">
                                        <th className="px-3 py-2 border border-slate-300">Date</th>
                                        <th className="px-3 py-2 border border-slate-300">Voucher #</th>
                                        <th className="px-3 py-2 border border-slate-300">Student Info</th>
                                        <th className="px-3 py-2 border border-slate-300">Fee Description</th>
                                        <th className="px-3 py-2 border border-slate-300 text-right">Fee Amount</th>
                                        <th className="px-3 py-2 border border-slate-300 text-right">Voucher Total</th>
                                        <th className="px-3 py-2 border border-slate-300 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const renderedRows = [];
                                        for (let i = 0; i < ledgerData.length; i++) {
                                            const item = ledgerData[i];
                                            const isFirst = i === 0 || item.VoucherNumber !== ledgerData[i - 1].VoucherNumber;
     
                                            let rowSpan = 1;
                                            let voucherTotal = 0;

                                            if (isFirst) {
                                                for (let j = i; j < ledgerData.length; j++) {
                                                    if (ledgerData[j].VoucherNumber === item.VoucherNumber) {
                                                        voucherTotal += parseFloat(ledgerData[j].Amount);
                                                        if (j > i) rowSpan++;
                                                    } else break;
                                                }
                                            }
    
                                            renderedRows.push(
                                                <tr key={i} className={`${isFirst ? 'bg-slate-50/20' : ''}`}>
                                                    {isFirst && (
                                                        <>
                                                            <td rowSpan={rowSpan} className="px-3 py-2 border border-slate-300 font-bold whitespace-nowrap align-top text-slate-600">
                                                                {moment(item.CreatedAt).format('DD MMM YY')}
                                                            </td>
                                                            <td rowSpan={rowSpan} className="px-3 py-2 border border-slate-300 font-black text-primary-600 uppercase tracking-tighter align-top">
                                                                {item.VoucherNumber}
                                                            </td>
                                                            <td rowSpan={rowSpan} className="px-3 py-2 border border-slate-300 align-top">
                                                                <div className="font-bold text-slate-800 uppercase leading-none mb-1">{item.FirstName} {item.LastName}</div>
                                                                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">REG: {item.AdmissionNumber}</div>
                                                            </td>
                                                        </>
                                                    )}
                                                    <td className="px-3 py-2 border border-slate-300 text-slate-700">
                                                        <div className="flex items-center gap-2">
                                                            {item.FeeType} <span className="text-[9px] font-bold text-slate-400 capitalize">({item.Month})</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 border border-slate-300 text-right font-bold text-slate-600">
                                                        Rs. {item.Amount.toLocaleString()}
                                                    </td>
                                                    {isFirst && (
                                                        <>
                                                            <td rowSpan={rowSpan} className="px-3 py-2 border border-slate-300 text-right align-top">
                                                                <span className="text-[12px] font-black text-slate-900 leading-none">
                                                                    Rs. {voucherTotal.toLocaleString()}
                                                                </span>
                                                            </td>
                                                            <td rowSpan={rowSpan} className="px-3 py-2 border border-slate-300 text-center align-top">
                                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${item.Status === 'Paid' ? 'border-success-200 text-success-600 bg-success-50' : 'border-warning-200 text-warning-600 bg-warning-50'}`}>
                                                                    {item.Status}
                                                                </span>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            );
                                        }
                                        return renderedRows;
                                    })()}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-100 font-black">
                                        <td colSpan={5} className="px-3 py-2 border border-slate-300 text-right uppercase tracking-widest text-[9px]">Grand Total (Net Collection)</td>
                                        <td colSpan={2} className="px-3 py-2 border border-slate-300 text-right text-lg text-primary-600">
                                            Rs. {ledgerData.reduce((acc, curr) => acc + parseFloat(curr.Amount), 0).toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Audit Footer */}
                        <div className="mt-12 flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-widest border-t border-dashed border-slate-300 pt-6">
                            <div>System Audit ID: {moment().format('X')}</div>
                            <div>Verification Required For Valid Audit</div>
                        </div>
                    </div>
                </ReportViewer>
            )}

            {/* VOUCHER PREVIEW REPORT VIEWER */}
            {isPreviewOpen && activeVoucher && (
                <ReportViewer
                    title={`Fee Voucher #${activeVoucher.VoucherNumber}`}
                    onClose={() => setIsPreviewOpen(false)}
                >
                    <FeeVoucher voucher={activeVoucher} copyTitle="Office Copy" />
                </ReportViewer>
            )}
        </div>
    );
};

export default Collections;
