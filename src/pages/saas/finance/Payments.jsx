import React, { useState, useEffect } from "react";
import { get, post, del } from "@/lib/apiClient";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import SkeletonTable from "@/components/skeleton/Table";
import PageHeader from "@/components/ui/PageHeader";
import { toast } from "react-toastify";
import moment from "moment";
import ReportHeader from "@/components/ui/ReportHeader";
import ReportViewer from "@/components/ui/ReportViewer";

const Payments = () => {
    const [loading, setLoading] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);

    const [dateRange, setDateRange] = useState({
        start: moment().startOf('month').format('YYYY-MM-DD'),
        end: moment().format('YYYY-MM-DD')
    });

    const [formData, setFormData] = useState({
        date: moment().format('YYYY-MM-DD'),
        category: "",
        description: "",
        amount: ""
    });

    const categories = [
        { value: "Salaries", label: "Staff Salaries" },
        { value: "Utilities", label: "Utilities (Electricity, Water)" },
        { value: "Maintenance", label: "Maintenance & Repairs" },
        { value: "Supplies", label: "Office & School Supplies" },
        { value: "Rent", label: "Rent / Lease" },
        { value: "Marketing", label: "Marketing & Advertising" },
        { value: "Other", label: "Other Expenses" }
    ];

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const res = await get(`/finance/expenses?startDate=${dateRange.start}&endDate=${dateRange.end}`);
            setExpenses(res.data);
        } catch (err) {
            toast.error("Failed to load records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [dateRange]);

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            await post('/finance/expenses', formData);
            toast.success("Expense recorded successfully");
            setIsModalOpen(false);
            setFormData({
                date: moment().format('YYYY-MM-DD'),
                category: "",
                description: "",
                amount: ""
            });
            fetchExpenses();
        } catch (err) {
            toast.error("Failed to record expense");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        try {
            await del(`/finance/expenses/${id}`);
            toast.success("Record deleted");
            fetchExpenses();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const columns = [
        {
            Header: "Date",
            accessor: "ExpenseDate",
            Cell: ({ value }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-[11px]">{moment(value).format('DD MMM YYYY')}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Log: {moment(value).fromNow()}</span>
                </div>
            )
        },
        {
            Header: "Classification",
            accessor: "Category",
            Cell: ({ value }) => (
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        <Icon icon="ph:tag-bold" className="w-3 h-3" />
                    </div>
                    <span className="font-black text-[11px] text-slate-800 dark:text-slate-100 uppercase">{value}</span>
                </div>
            )
        },
        {
            Header: "Item Description",
            accessor: "Description",
            Cell: ({ value }) => <span className="text-[12px] text-slate-500 italic max-w-[300px] truncate block">{value || "No description provided"}</span>
        },
        {
            Header: "Authorized By",
            Cell: ({ row }) => {
                const name = row.original.FirstName ? `${row.original.FirstName} ${row.original.LastName}` : "System Admin";
                return (
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-[10px] font-black uppercase">
                            {name.charAt(0)}
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{name}</span>
                    </div>
                );
            }
        },
        {
            Header: "Financial Outflow",
            accessor: "Amount",
            Cell: ({ value }) => <span className="font-black text-rose-500 text-[13px]">Rs. {parseFloat(value).toLocaleString()}</span>
        },
        {
            Header: "Actions",
            Cell: ({ row }) => (
                <button
                    onClick={() => handleDelete(row.original.ID)}
                    className="h-8 w-8 text-slate-400 hover:text-rose-500 transition-colors"
                >
                    <Icon icon="ph:trash-bold" className="w-4 h-4" />
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:hand-coins-bold"
                title="Expense Management"
                description="Monitor institutional expenditures, authorize staff reimbursements, and manage operational outflows."
            >
                <div className="flex gap-3">
                    <Button
                        text="Expense Audit Report"
                        className="btn-light px-4 rounded-lg font-bold uppercase tracking-wider text-[10px] h-10 border-dashed"
                        icon="ph:file-pdf-bold"
                        onClick={() => setIsReportOpen(true)}
                    />
                    <Button
                        text="Record New Expense"
                        className="btn-primary px-4 rounded-lg font-bold uppercase tracking-wider text-[10px] h-10 shadow-lg shadow-primary-500/10"
                        icon="ph:plus-circle-bold"
                        onClick={() => setIsModalOpen(true)}
                    />
                </div>
            </PageHeader>

            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-950 border dark:border-slate-800 p-2 px-3 rounded-xl">
                <div className="flex gap-3 items-center">
                    <div className="flex items-center px-3 rounded-lg gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-r dark:border-slate-800 pr-3 h-5 flex items-center">Audit Period</span>
                        <div className="flex items-center gap-2">
                            <Textinput
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(p => ({ ...p, start: e.target.value }))}
                                className=""
                                inputClass="h-7 text-[11px] border-0 bg-transparent font-bold !no-border p-0 w-[95px]"
                                label="Start Date"
                            />
                            <Icon icon="ph:arrow-right-bold" className="text-slate-300 w-2.5 h-2.5" />
                            <Textinput
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(p => ({ ...p, end: e.target.value }))}
                                className=""
                                inputClass="h-7 text-[11px] border-0 bg-transparent font-bold !no-border p-0 w-[95px]"
                                label="End Date"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6 pr-2">
                    <div className="flex flex-col text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Verified Total Outflow</span>
                        <span className="text-lg font-black text-rose-500">Rs. {expenses.reduce((acc, curr) => acc + parseFloat(curr.Amount), 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <Card className="border dark:border-[#2f3336]" bodyClass="p-0">
                {loading ? (
                    <SkeletonTable count={10} />
                ) : (
                    <DataTable
                        columns={columns}
                        data={expenses}
                        className=" text-[13px]"
                    />
                )}
            </Card>

            {/* ADD EXPENSE MODAL */}
            <Modal
                title="Log Operational Expenditure"
                activeModal={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                className="max-w-xl"
            >
                <form onSubmit={handleAddExpense} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Textinput
                            label="Transaction Date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                            icon="ph:calendar-bold"
                        />
                        <Select
                            label="Expense Category"
                            options={categories}
                            value={categories.find(c => c.value === formData.category)}
                            onChange={(val) => setFormData({ ...formData, category: val.value })}
                            required
                            icon="ph:tag-bold"
                        />
                    </div>
                    <Textinput
                        label="Amount (Rs.)"
                        type="number"
                        placeholder="Enter expenditure amount..."
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                        icon="ph:bank-bold"
                    />
                    <Textinput
                        label="Purpose / Memo"
                        placeholder="Detail the reason for this expenditure..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        icon="ph:note-pencil-bold"
                    />
                    <div className="pt-4 flex gap-3">
                        <Button
                            text="Discard"
                            className="btn-light flex-1 py-3 font-bold uppercase text-[11px] rounded-xl"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <Button
                            text="Authorize Log"
                            type="submit"
                            className="btn-primary flex-1 py-3 font-bold uppercase text-[11px] rounded-xl shadow-lg shadow-primary-500/10"
                        />
                    </div>
                </form>
            </Modal>

            {/* EXPENSE AUDIT REPORT VIEWER */}
            {isReportOpen && (
                <ReportViewer
                    title="Expense Audit Report"
                    onClose={() => setIsReportOpen(false)}
                >
                    <div className="bg-white border px-4 w-[210mm] min-h-[297mm] text-slate-900 shadow-sm print:shadow-none">
                        <ReportHeader className="mb-8" />

                        <div className="flex justify-between items-end border-b-2 border-slate-800 pb-4 mb-6">
                            <div>
                                <h4 className="text-xl font-black text-slate-900 uppercase leading-none mb-1">Operational Expenditure Ledger</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Audit Period: {moment(dateRange.start).format('DD MMM YYYY')} — {moment(dateRange.end).format('DD MMM YYYY')}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Generated On</p>
                                <p className="text-[11px] font-black text-slate-700 uppercase">{moment().format('DD MMM YYYY [@] hh:mm A')}</p>
                            </div>
                        </div>

                        <div className="overflow-visible">
                            <table className="w-full text-left text-[11px] border-collapse border border-slate-300 text-slate-800">
                                <thead className="bg-slate-50 border-b border-slate-300">
                                    <tr className="text-slate-700 font-black uppercase tracking-wider text-[9px]">
                                        <th className="px-3 py-2 border border-slate-300">Date</th>
                                        <th className="px-3 py-2 border border-slate-300">Classification</th>
                                        <th className="px-3 py-2 border border-slate-300">Description / Memo</th>
                                        <th className="px-3 py-2 border border-slate-300">Authorized By</th>
                                        <th className="px-3 py-2 border border-slate-300 text-right">Amount (Rs.)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map((item, id) => (
                                        <tr key={id} className="border-b border-slate-200">
                                            <td className="px-3 py-2 border border-slate-300 whitespace-nowrap">{moment(item.ExpenseDate).format('DD MMM YYYY')}</td>
                                            <td className="px-3 py-2 border border-slate-300 font-bold uppercase text-[10px]">{item.Category}</td>
                                            <td className="px-3 py-2 border border-slate-300 italic text-slate-600 line-clamp-2">{item.Description || "—"}</td>
                                            <td className="px-3 py-2 border border-slate-300">{item.FirstName ? `${item.FirstName} ${item.LastName}` : "System Admin"}</td>
                                            <td className="px-3 py-2 border border-slate-300 text-right font-black text-slate-900 uppercase tracking-tighter">
                                                Rs. {parseFloat(item.Amount).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-100 font-black">
                                        <td colSpan={4} className="px-3 py-2 border border-slate-300 text-right uppercase tracking-widest text-[9px]">Total Operational Outflow</td>
                                        <td className="px-3 py-2 border border-slate-300 text-right text-lg text-rose-600 italic">
                                            Rs. {expenses.reduce((acc, curr) => acc + parseFloat(curr.Amount), 0).toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Audit Footer */}
                        <div className="mt-12 flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-widest border-t border-dashed border-slate-300 pt-6">
                            <div>System Voucher Audit: {moment().format('X')}</div>
                            <div>Institutional Expenditure Verification Log</div>
                        </div>
                    </div>
                </ReportViewer>
            )}
        </div>
    );
};

export default Payments;
