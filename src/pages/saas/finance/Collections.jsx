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
    const [dateRange, setDateRange] = useState({
        start: moment().startOf('month').format('YYYY-MM-DD'),
        end: moment().format('YYYY-MM-DD')
    });

    const [activeVoucher, setActiveVoucher] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
            const res = await get(`/finance/ledger?startDate=${dateRange.start}&endDate=${dateRange.end}`);
            setLedgerData(res.data);
            setIsLedgerOpen(true);
        } catch (err) {
            toast.error("Failed to generate ledger");
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
                        className="h-8 w-8 bg-slate-100 hover:bg-primary-500 dark:bg-slate-800 hover:text-white transition-all rounded-lg flex items-center justify-center text-slate-500 shadow-sm"
                        onClick={async () => {
                            const res = await get(`/finance/vouchers/${row.original.ID}`);
                            setActiveVoucher(res.data);
                            setIsPreviewOpen(true);
                        }}
                        title="Print Voucher"
                    >
                        <Icon icon="ph:printer-bold" className="w-4 h-4" />
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
                    text="Collection Ledger"
                    className="btn-primary px-4 rounded-lg font-bold uppercase tracking-wider text-[10px] h-10 shadow-lg shadow-primary-500/10"
                    icon="ph:file-text-bold"
                    onClick={fetchLedger}
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
                            className="poppins"
                            inputClass="h-7 text-[11px] border-1 bg-transparent font-bold !no-border p-0 w-[95px]"
                        />
                        <Icon icon="ph:arrow-right-bold" className="text-slate-300 w-2.5 h-2.5" />
                        <Textinput
                            type="date"
                            label="End Date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(p => ({ ...p, end: e.target.value }))}
                            className="poppins"
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
                            className="poppins text-[13px]"
                        />
                    )}
                </Card>
            </div>

            {/* LEDGER MODAL */}
            <Modal
                title="Collection Ledger Report"
                activeModal={isLedgerOpen}
                onClose={() => setIsLedgerOpen(false)}
                className="max-w-6xl"
            >
                <div className="space-y-6">
                    <div className="flex justify-between items-end border-b pb-4">
                        <div>
                            <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase">Financial Audit Ledger</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{dateRange.start} — {dateRange.end}</p>
                        </div>
                        <Button
                            text="Print Ledger"
                            className="btn-primary btn-sm rounded-lg font-bold uppercase tracking-widest text-[9px]"
                            icon="ph:printer-bold"
                            onClick={() => window.print()}
                        />
                    </div>

                    <div className="overflow-x-auto" id="printable-ledger">
                        <table className="w-full text-left text-[13px] border-collapse border border-slate-200 dark:border-slate-800">
                            <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                <tr className="text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider text-[11px]">
                                    <th className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800">Date</th>
                                    <th className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800">Voucher</th>
                                    <th className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800">Student Info</th>
                                    <th className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800">Fee Type</th>
                                    <th className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800">Month</th>
                                    <th className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 text-right">Amount</th>
                                    <th className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const renderedRows = [];
                                    for (let i = 0; i < ledgerData.length; i++) {
                                        const item = ledgerData[i];
                                        const isFirst = i === 0 || item.VoucherNumber !== ledgerData[i - 1].VoucherNumber;

                                        let rowSpan = 1;
                                        if (isFirst) {
                                            for (let j = i + 1; j < ledgerData.length; j++) {
                                                if (ledgerData[j].VoucherNumber === item.VoucherNumber) rowSpan++;
                                                else break;
                                            }
                                        }

                                        renderedRows.push(
                                            <tr key={i} className={`transition-colors ${isFirst ? 'bg-slate-50/30' : 'bg-transparent'}`}>
                                                {isFirst && (
                                                    <>
                                                        <td rowSpan={rowSpan} className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 font-medium whitespace-nowrap align-middle">
                                                            {moment(item.CreatedAt).format('DD MMM YY')}
                                                        </td>
                                                        <td rowSpan={rowSpan} className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 font-black text-primary-500 uppercase tracking-tighter align-middle">
                                                            {item.VoucherNumber}
                                                        </td>
                                                        <td rowSpan={rowSpan} className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200 align-middle">
                                                            <div className="flex gap-2 items-center">
                                                                <div className="leading-tight">{item.FirstName} {item.LastName}</div>
                                                                <div className="text-[10px] text-muted font-bold">({item.AdmissionNumber})</div>
                                                            </div>
                                                        </td>
                                                    </>
                                                )}
                                                <td className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 font-medium text-slate-600 dark:text-slate-400">
                                                    <div className="flex items-center gap-1.5">
                                                        {!isFirst && <Icon icon="ph:arrow-elbow-down-right-bold" className="w-2.5 h-2.5 text-slate-300" />}
                                                        {item.FeeType}
                                                    </div>
                                                </td>
                                                <td className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 font-black uppercase text-[10px] text-slate-500">{item.Month}</td>
                                                <td className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 text-right font-black text-slate-800 dark:text-slate-100">Rs. {item.Amount.toLocaleString()}</td>
                                                {isFirst && (
                                                    <td rowSpan={rowSpan} className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 align-middle">
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`text-[10px] font-black uppercase ${item.Status === 'Paid' ? 'text-success-600' : 'text-warning-600'}`}>
                                                                {item.Status}
                                                            </span>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    }
                                    return renderedRows;
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal>

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
