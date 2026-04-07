import React, { useState, useEffect, useMemo, useCallback } from "react";
import { get, post } from "@/lib/apiClient";
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

const Payroll = () => {
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [payingId, setPayingId] = useState(null);
    const [staffList, setStaffList] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(moment().format('YYYY-MM'));

    // For Receipt Preview
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [activeReceipt, setActiveReceipt] = useState(null);

    const [selectedYear, selectedMonth] = selectedPeriod.split('-');
    const monthName = moment(selectedPeriod, 'YYYY-MM').format('MMMM');
    const monthDays = moment(selectedPeriod, 'YYYY-MM').daysInMonth();

    const fetchStaffData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await get(`/payroll/staff?month=${monthName}&year=${selectedYear}`);
            const data = res.data || [];

            const initialized = data.map(s => {
                const basic = parseFloat(s.BasicSalary) || 0;
                const pres = parseInt(s.attendance?.Present || 0);
                const late = parseInt(s.attendance?.Late || 0);
                const half = parseInt(s.attendance?.HalfDay || 0);

                const attendanceSalary = monthDays > 0 ?
                    Math.round((basic / monthDays) * (pres + late + (half * 0.5))) : 0;

                return {
                    ...s,
                    BasicSalary: basic,
                    AttendanceSalary: attendanceSalary,
                };
            });
            setStaffList(initialized);
        } catch (err) {
            console.error("Staff attendance load error:", err);
            toast.error("Failed to load payroll data");
        } finally {
            setLoading(false);
        }
    }, [selectedPeriod, monthName, selectedYear, monthDays]);

    useEffect(() => {
        fetchStaffData();
    }, [fetchStaffData]);

    const handleAdjustmentChange = useCallback((staffId, field, value) => {
        setStaffList(prev => prev.map(s => {
            if (s.ID === staffId) {
                return { ...s, [field]: parseFloat(value) || 0 };
            }
            return s;
        }));
    }, []);

    const handleSavePayroll = async () => {
        try {
            setActionLoading(true);
            const payrollData = staffList.map(s => ({
                StaffID: s.ID,
                BasicSalary: s.BasicSalary,
                PresentDays: s.attendance.Present,
                AbsentDays: s.attendance.Absent,
                LateDays: s.attendance.Late,
                HalfDays: s.attendance.HalfDay,
                AttendanceSalary: s.AttendanceSalary,
                Bonus: s.Bonus,
                Deductions: s.Deductions,
                NetSalary: s.AttendanceSalary + s.Bonus - s.Deductions,
            }));

            await post('/payroll/generate', { month: monthName, year: selectedYear, payrollData });
            toast.success("Payroll records saved");
            await fetchStaffData();
        } catch (err) {
            toast.error("Save failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDisburse = async (id) => {
        try {
            setPayingId(id);
            // First Save then Pay
            await handleSavePayroll();

            // Find the specific record in staffList to get its PayrollID
            const staff = staffList.find(s => s.ID === id);
            
            // We need to fetch again or use the returned ID if we changed the backend to return it.
            // But fetchStaffData is called in handleSavePayroll.
            // To be safe, we'll fetch again manually if needed, but fetchStaffData already does it.
            // Let's re-find after fetch
            const res = await get(`/payroll/staff?month=${monthName}&year=${selectedYear}`);
            const updatedStaff = res.data.find(s => s.ID === id);

            if (!updatedStaff?.PayrollID) {
                throw new Error("Could not find payroll ID after saving. Please try again.");
            }

            await post('/payroll/pay', { payrollID: updatedStaff.PayrollID });
            toast.success("Salary disbursed & notifications sent");
            fetchStaffData();
        } catch (err) {
            console.error(err);
            toast.error("Payment failed: " + (err.response?.data || err.message));
        } finally {
            setPayingId(null);
        }
    };

    const handleBulkDisburse = async () => {
        const toPay = staffList.filter(s => s.Status !== 'Paid' && s.PayrollID);
        if (toPay.length === 0) return toast.info("No saved records ready for disbursement");

        const totalCalculated = toPay.reduce((acc, s) => acc + (parseFloat(s.SavedNetSalary) || (s.AttendanceSalary + s.Bonus - s.Deductions)), 0);
        
        if (!window.confirm(`Confirm Bulk Disbursement?\n\nTotal staff to pay: ${toPay.length}\nTotal Outlay: Rs. ${totalCalculated.toLocaleString()}\n\nThis will send SMS and Email alerts to all recipients. Proceed?`)) return;

        try {
            setActionLoading(true);
            await post('/payroll/bulk-pay', { payrollIDs: toPay.map(s => s.PayrollID) });
            toast.success("Bulk disbursement completed");
            fetchStaffData();
        } catch (err) {
            toast.error("Bulk payment failed");
        } finally {
            setActionLoading(false);
        }
    };

    const openReceipt = (record) => {
        // Build receipt data from staff record
        const receiptData = {
            ...record,
            Month: monthName,
            Year: selectedYear,
            NetSalary: record.Status === 'Paid' ? record.SavedNetSalary : (record.AttendanceSalary + record.Bonus - record.Deductions),
            PresentDays: record.attendance.Present,
            LateDays: record.attendance.Late,
            HalfDays: record.attendance.HalfDay
        };
        setActiveReceipt(receiptData);
        setIsReceiptOpen(true);
    };

    const columns = useMemo(() => [
        {
            Header: "Staff Detail",
            accessor: "FirstName",
            Cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{row.original.FirstName} {row.original.LastName}</span>
                    <span className="text-[10px] text-primary-500 font-bold uppercase tracking-widest">{row.original.Role}</span>
                </div>
            )
        },
        {
            Header: "Base Pay",
            accessor: "BasicSalary",
            Cell: ({ value }) => <span className="font-bold text-[12px]">Rs. {value.toLocaleString()}</span>
        },
        {
            Header: "Attendance (E.D)",
            accessor: "attendance",
            Cell: ({ value }) => {
                const effective = value.Present + value.Late + (value.HalfDay * 0.5);
                return (
                    <div className="flex flex-col">
                        <span className="text-success-600 font-black text-[12px]">{effective} / {monthDays}</span>
                        <div className="flex gap-1 text-[9px] font-bold text-slate-400">
                            <span>P:{value.Present}</span>
                            <span className="text-rose-400">A:{value.Absent}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            Header: "Pro-rated",
            accessor: "AttendanceSalary",
            Cell: ({ value }) => <span className="font-bold text-slate-600 dark:text-slate-400">Rs. {value.toLocaleString()}</span>
        },
        {
            Header: "Bonus (+)",
            Cell: ({ row }) => (
                <input
                    type="number"
                    disabled={row.original.Status === 'Paid'}
                    className="w-20 bg-slate-50 dark:bg-slate-900 border-0 rounded text-[11px] font-bold p-1 px-2 text-success-600 h-8 disabled:opacity-50"
                    value={row.original.Bonus}
                    onChange={(e) => handleAdjustmentChange(row.original.ID, "Bonus", e.target.value)}
                />
            )
        },
        {
            Header: "Deductions (-)",
            Cell: ({ row }) => (
                <input
                    type="number"
                    disabled={row.original.Status === 'Paid'}
                    className="w-20 bg-slate-50 dark:bg-slate-900 border-0 rounded text-[11px] font-bold p-1 px-2 text-rose-600 h-8 disabled:opacity-50"
                    value={row.original.Deductions}
                    onChange={(e) => handleAdjustmentChange(row.original.ID, "Deductions", e.target.value)}
                />
            )
        },
        {
            Header: "Net Payable",
            Cell: ({ row }) => {
                const net = row.original.Status === 'Paid' ? row.original.SavedNetSalary : (row.original.AttendanceSalary + row.original.Bonus - row.original.Deductions);
                return <span className="font-black text-primary-600 text-[14px]">Rs. {parseFloat(net).toLocaleString()}</span>;
            }
        },
        {
            Header: "Status",
            accessor: "Status",
            Cell: ({ value }) => (
                <div className={`px-3 py-1 rounded-full w-fit text-[9px] font-black uppercase tracking-widest ${value === 'Paid' ? 'bg-green-100 text-success-600' : value === 'Generated' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    {value}
                </div>
            )
        },
        {
            Header: "Actions",
            Cell: ({ row }) => (
                <div className="flex gap-2">
                    {row.original.Status !== 'Paid' ? (
                        <button
                            onClick={() => handleDisburse(row.original.ID)}
                            disabled={payingId !== null || actionLoading}
                            className="h-8 px-4 rounded-lg bg-primary-600 text-white text-[10px] font-bold uppercase hover:bg-primary-700 shadow-lg shadow-primary-500/20 disabled:opacity-50 flex items-center gap-2"
                        >
                            {payingId === row.original.ID ? (
                                <><Icon icon="ph:circle-notch-bold" className="animate-spin w-3 h-3" /> Processing...</>
                            ) : "Pay Now"}
                        </button>
                    ) : (
                        <button
                            onClick={() => openReceipt(row.original)}
                            className="h-8 px-4 rounded-lg bg-slate-900 text-white text-[10px] font-bold uppercase flex items-center gap-2"
                        >
                            <Icon icon="ph:file-pdf-bold" className="w-4 h-4" /> Receipt
                        </button>
                    )}
                </div>
            )
        }
    ], [monthDays, handleAdjustmentChange, payingId, actionLoading]);

    const totalOutlay = useMemo(() => {
        return staffList.reduce((acc, s) => {
            const net = s.Status === 'Paid' ? s.SavedNetSalary : (s.AttendanceSalary + s.Bonus - s.Deductions);
            return acc + parseFloat(net || 0);
        }, 0);
    }, [staffList]);

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:coins-bold"
                title="Payroll Management"
                description={`Process and manage staff remunerations for ${monthName} ${selectedYear}.`}
            >
                <div className="flex gap-3">
                    <Button
                        text={actionLoading ? "Please wait..." : "Save Changes"}
                        disabled={actionLoading}
                        className="btn-light px-6 rounded-lg font-bold uppercase tracking-wider text-[10px] h-10 border-dashed"
                        icon={actionLoading ? "ph:circle-notch-bold" : "ph:floppy-disk-bold"}
                        onClick={handleSavePayroll}
                    />
                    <Button
                        text={actionLoading ? "Processing..." : "Bulk Disbursement"}
                        disabled={actionLoading}
                        className="btn-primary px-8 rounded-lg font-bold uppercase tracking-wider text-[10px] h-10 shadow-xl shadow-primary-500/20"
                        icon={actionLoading ? "ph:circle-notch-bold" : "ph:lightning-bold"}
                        onClick={handleBulkDisburse}
                    />
                </div>
            </PageHeader>

            {/* Unified Filter & Metrics */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-950 border dark:border-slate-800 p-2 px-4 rounded-xl">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-r pr-4 h-5 flex items-center">Payroll Period</span>
                        <input
                            type="month"
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="h-9 bg-slate-50 dark:bg-slate-900 border-0 rounded-lg text-[13px] text-slate-700 dark:text-slate-200 outline-none px-4 focus:ring-2 ring-primary-500/20 transition-all"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-10 pr-2">
                    <div className="flex flex-col text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Monthly Outlay</span>
                        <span className="text-xl font-black text-primary-600">
                            Rs. {totalOutlay.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <Card className="border dark:border-[#2f3336] !rounded-2xl overflow-hidden" bodyClass="p-0">
                {loading ? (
                    <SkeletonTable count={10} />
                ) : (
                    <DataTable
                        columns={columns}
                        data={staffList}
                        className="text-[13px]"
                    />
                )}
            </Card>

            {/* SALARY RECEIPT MODAL */}
            {isReceiptOpen && activeReceipt && (
                <ReportViewer
                    title="Salary Payment Advice"
                    onClose={() => setIsReceiptOpen(false)}
                >
                    <div className="bg-white border px-10 py-12 w-[210mm] min-h-[297mm] text-slate-900 shadow-sm print:shadow-none">
                        <ReportHeader className="mb-12" />

                        <div className="flex justify-between border-b-4 border-slate-900 pb-8 mb-10">
                            <div>
                                <h1 className="text-4xl font-black uppercase text-slate-900 mb-1 italic">Salary Advice</h1>
                                <p className="text-[14px] text-slate-500 font-bold uppercase tracking-[0.3em] pl-1">{activeReceipt.Month} {activeReceipt.Year}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Audit Reference</div>
                                <div className="text-2xl font-black text-primary-600 tracking-tighter italic">#{activeReceipt.VoucherNumber || 'PENDING'}</div>
                                <div className="text-[11px] font-bold text-slate-500 mt-2">{moment(activeReceipt.PaymentDate).format('DD MMMM YYYY')}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-16 mb-16">
                            <div>
                                <h4 className="text-[10px] font-black uppercase text-slate-500 mb-4 border-b-2 border-slate-100 pb-1 w-fit pr-10">Employee Profile</h4>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">{activeReceipt.FirstName} {activeReceipt.LastName}</p>
                                    <p className="text-[13px] font-bold text-primary-600 uppercase tracking-widest">{activeReceipt.Designation}</p>
                                    <div className="h-4"></div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase">Employee ID: <span className="text-slate-900">{activeReceipt.EmployeeID}</span></p>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase">Contact: <span className="text-slate-900 lowercase">{activeReceipt.Email}</span></p>
                                </div>
                            </div>
                            <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden flex flex-col justify-center">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                <h4 className="text-[10px] font-black uppercase text-primary-400 mb-2 tracking-[0.2em] relative z-10 pl-1">Net Compensation</h4>
                                <div className="text-5xl font-black italic relative z-10">Rs. {parseFloat(activeReceipt.NetSalary).toLocaleString()}</div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold mt-4 tracking-widest relative z-10 border-t border-slate-800 pt-4">Institutional Disbursement Advice</p>
                            </div>
                        </div>

                        <div className="mb-16">
                            <h4 className="text-[10px] font-black uppercase text-slate-500 mb-6 border-b-2 border-slate-100 pb-1 w-fit pr-10">Earnings & Deductions</h4>
                            <table className="w-full text-left text-[14px]">
                                <thead className="text-slate-400 uppercase text-[11px] font-black">
                                    <tr className="border-b-2 border-slate-900">
                                        <th className="py-3">Line Description</th>
                                        <th className="py-3 text-right">Metric</th>
                                        <th className="py-3 text-right pr-4">Subtotal (Rs.)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-100">
                                        <td className="py-5 font-bold text-slate-800">Contractual Base Salary</td>
                                        <td className="py-5 text-right font-bold text-slate-400 italic">Full Month</td>
                                        <td className="py-5 text-right pr-4 font-bold text-slate-900">Rs. {parseFloat(activeReceipt.BasicSalary).toLocaleString()}</td>
                                    </tr>
                                    <tr className="border-b border-slate-100">
                                        <td className="py-5 font-bold text-slate-800">Attendance Adjusted Pay</td>
                                        <td className="py-5 text-right text-success-600 font-extrabold italic uppercase text-[11px] tracking-tight">{activeReceipt.PresentDays}P, {activeReceipt.LateDays}L, {activeReceipt.HalfDays}H</td>
                                        <td className="py-5 text-right pr-4 font-bold text-slate-900">Rs. {parseFloat(activeReceipt.AttendanceSalary).toLocaleString()}</td>
                                    </tr>
                                    <tr className="border-b border-slate-100">
                                        <td className="py-5 font-bold text-slate-800 italic">Institutional Performance Bonus</td>
                                        <td className="py-5 text-right text-success-600 font-black uppercase text-[10px]">+ Institutional</td>
                                        <td className="py-5 text-right pr-4 font-black text-success-600">Rs. {parseFloat(activeReceipt.Bonus || 0).toLocaleString()}</td>
                                    </tr>
                                    <tr className="border-b border-slate-100">
                                        <td className="py-5 font-bold text-slate-800 italic">Tax & Standard Deductions</td>
                                        <td className="py-5 text-right text-rose-600 font-black uppercase text-[10px]">- Institutional</td>
                                        <td className="py-5 text-right pr-4 font-black text-rose-600">(Rs. {parseFloat(activeReceipt.Deductions || 0).toLocaleString()})</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-50 border-t-4 border-slate-900">
                                        <td colSpan="2" className="py-6 px-10 font-black uppercase text-[13px] tracking-[0.2em] italic">Total Disbursed Amount</td>
                                        <td className="py-6 pr-10 text-right font-black text-3xl italic text-slate-900">Rs. {parseFloat(activeReceipt.NetSalary).toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="grid grid-cols-2 gap-24 pt-16 mt-auto">
                            <div className="text-center">
                                <div className="border-b border-slate-300 pb-3 mb-3 italic text-slate-300 text-[12px]">Approved By</div>
                                <p className="text-[11px] font-black uppercase text-slate-900 tracking-widest">Director of Finance</p>
                                <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Verified Electronic Entry</p>
                            </div>
                            <div className="text-center">
                                <div className="border-b border-slate-300 pb-3 mb-3 italic text-slate-300 text-[12px]">Employee Signature</div>
                                <p className="text-[11px] font-black uppercase text-slate-900 tracking-widest">{activeReceipt.FirstName} {activeReceipt.LastName}</p>
                                <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Recipient Acknowledgment</p>
                            </div>
                        </div>

                        <div className="mt-24 border-t-2 border-dashed border-slate-200 pt-8 flex justify-between items-center opacity-40 grayscale group">
                            <div className="text-[10px] font-black uppercase tracking-tighter text-slate-400">System Audit: {moment().format('YYYYMMDD-HHmmss')} • IP: {window.location.hostname}</div>
                            <div className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Edunex ERP Cloud Document • ID: {activeReceipt.PayrollID}</div>
                        </div>
                    </div>
                </ReportViewer>
            )}
        </div>
    );
};

export default Payroll;
