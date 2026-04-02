import React, { useState, useMemo } from "react";
import { get, post } from "@/lib/apiClient";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import { toast } from "react-toastify";
import moment from "moment";

const Invoices = () => {
    const [loading, setLoading] = useState(false);
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState("");

    // Search & Student Info
    const [admNo, setAdmNo] = useState("");
    const [student, setStudent] = useState(null);
    const [classFeeStructures, setClassFeeStructures] = useState([]);
    const [paidFees, setPaidFees] = useState([]); // [{ FeeType, Month }]
    const [studentHistory, setStudentHistory] = useState([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Voucher Creation State
    const [selectedFees, setSelectedFees] = useState([]); // [{ type, amount, months: [] }]

    // Modal for Voucher Preview
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [activeVoucher, setActiveVoucher] = useState(null);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ].map(m => ({ value: m, label: m }));

    const fetchSessions = async () => {
        try {
            const res = await get('/academic/years');
            setYears(res.data.map(y => ({ value: y.ID, label: y.Name, isActive: y.IsActive })));
            const active = res.data.find(y => y.IsActive);
            if (active) setSelectedYear(active.ID);
        } catch (err) {
            toast.error("Failed to load sessions");
        }
    };

    React.useEffect(() => {
        fetchSessions();
    }, []);

    const handleSearchStudent = async () => {
        if (!admNo.trim()) return;
        if (!selectedYear) return toast.warning("Select academic session first");

        setLoading(true);
        try {
            const res = await get(`/finance/student-lookup/${admNo}`);
            setStudent(res.data);

            // Fetch fee structures for this student's class and session
            const fsRes = await get(`/finance/fee-structures?academicYearID=${selectedYear}&classID=${res.data.ClassID}`);
            setClassFeeStructures(fsRes.data);

            // Fetch already paid fees to filter months
            const paidRes = await get(`/finance/student-paid-fees/${res.data.ID}`);
            setPaidFees(paidRes.data);

            setSelectedFees([]); // Reset previous selection
            toast.success("Student records synchronized");
        } catch (err) {
            toast.error("Student not found or lookup failed");
            setStudent(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentHistory = async () => {
        if (!student) return;
        try {
            const res = await get(`/finance/student-history/${student.ID}`);
            setStudentHistory(res.data);
            setIsHistoryOpen(true);
        } catch (err) {
            toast.error("Failed to load history");
        }
    };

    const handleAddFeeType = (fee) => {
        if (selectedFees.find(f => f.FeeType === fee.FeeType)) {
            return toast.info("Fee type already added");
        }
        setSelectedFees(prev => [...prev, { ...fee, months: [] }]);
    };

    const handleRemoveFeeType = (type) => {
        setSelectedFees(prev => prev.filter(f => f.FeeType !== type));
    };

    const handleMonthChange = (type, selectedMonths) => {
        setSelectedFees(prev => prev.map(f =>
            f.FeeType === type ? { ...f, months: selectedMonths || [] } : f
        ));
    };

    const calculation = useMemo(() => {
        let total = 0;
        selectedFees.forEach(f => {
            const count = (f.months?.length || 0);
            total += (f.Amount * count);
        });
        const concession = parseFloat(student?.ConcessionValue || 0);
        const payable = Math.max(0, total - concession);
        return { total, concession, payable };
    }, [selectedFees, student]);

    const handleGenerateVoucher = async () => {
        if (selectedFees.length === 0) return toast.warning("Select at least one fee type");
        if (selectedFees.some(f => f.months.length === 0)) return toast.warning("Select months for all added fee types");

        try {
            setLoading(true);
            const items = [];
            selectedFees.forEach(f => {
                f.months.forEach(m => {
                    items.push({ feeType: f.FeeType, month: m.value, amount: f.Amount });
                });
            });

            const payload = {
                studentID: student.ID,
                academicYearID: selectedYear,
                totalAmount: calculation.total,
                concessionAmount: calculation.concession,
                payableAmount: calculation.payable,
                items: items
            };

            const res = await post('/finance/vouchers', payload);
            toast.success("Invoice generated successfully");

            // Clear current view
            setAdmNo("");
            setStudent(null);
            setSelectedFees([]);

            // Fetch voucher for preview
            const vRes = await get(`/finance/vouchers/${res.data.voucherID}`);
            setActiveVoucher(vRes.data);
            setIsPreviewOpen(true);
        } catch (err) {
            toast.error("Failed to generate voucher");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:receipt-bold"
                title="Fees & Invoicing"
                description="Generate student fee vouchers and manage collection records."
            >
                <div className="flex gap-3 items-center">
                    <Select
                        options={years}
                        value={selectedYear}
                        onChange={(val) => setSelectedYear(val)}
                        className="w-[180px] poppins text-[13px]"
                        icon="ph:calendar-bold"
                        label="Academic Session"
                    />
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* INVOICE GENERATOR */}
                <div className="lg:col-span-8 space-y-4">
                    <Card
                        title="Voucher Generator"
                        className="border dark:border-[#2f3336]"
                        headerslot={
                            <div className="flex gap-2 items-center min-w-[450px]">
                                <Textinput
                                    label="Enter admission #"
                                    value={admNo}
                                    onChange={(e) => setAdmNo(e.target.value)}
                                    className="poppins flex-1"
                                    inputClass="h-[38px] text-[12px] bg-slate-50 dark:bg-slate-900/50"
                                    icon="ph:identification-card-bold"
                                />
                                <Button
                                    text={loading ? "..." : "Sync"}
                                    className="btn-primary px-4 rounded-lg font-bold uppercase tracking-wider text-[10px] h-[38px]"
                                    onClick={handleSearchStudent}
                                    disabled={loading}
                                    icon="ph:magnifying-glass-bold"
                                />
                                <Button
                                    text="Account Ledger"
                                    className="btn-light px-4 rounded-lg font-bold uppercase tracking-wider text-[10px] h-[38px] border-dashed"
                                    onClick={fetchStudentHistory}
                                    icon="ph:book-bold"
                                    disabled={!student}
                                />
                            </div>
                        }
                    >
                        {student ? (
                            <div className="space-y-6 animate-fade-in">
                                {/* Student Quick Info */}
                                <div className="bg-slate-50 dark:bg-slate-800/20 p-3.5 rounded-xl border dark:border-slate-700/50 flex flex-wrap gap-4 items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                                            <Icon icon="ph:student-bold" className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{student.FirstName} {student.LastName}</h4>
                                            <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">{student.ClassName} • {student.AcademicYearName}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6 border-l dark:border-slate-700/50 pl-5">
                                        <div className="text-center">
                                            <div className="text-[9px] uppercase font-bold text-slate-400 tracking-widest leading-tight">Concession</div>
                                            <div className="font-bold text-primary-500 text-xs">Rs. {student.ConcessionValue}</div>
                                        </div>
                                        <div className="text-center pl-4 border-l dark:border-slate-700/50">
                                            <div className="text-[9px] uppercase font-bold text-slate-400 tracking-widest leading-tight">Roll No</div>
                                            <div className="font-bold text-slate-700 dark:text-slate-300 text-xs">#{student.RollNumber}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Fee Type Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2 mb-1">
                                            <Icon icon="ph:plus-circle-bold" className="text-success-500 w-4 h-4" />
                                            Available Charges
                                        </h5>
                                        <div className="grid grid-cols-1 gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                            {classFeeStructures.map((fs) => (
                                                <button
                                                    key={fs.ID}
                                                    onClick={() => handleAddFeeType(fs)}
                                                    className="flex items-center justify-between p-3 rounded-xl border dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all text-left bg-white dark:bg-[#111111] group"
                                                >
                                                    <div>
                                                        <div className="text-[12px] font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary-500">{fs.FeeType}</div>
                                                        <div className="text-[9px] text-slate-400 font-medium uppercase">Class Standard</div>
                                                    </div>
                                                    <div className="font-black text-slate-800 dark:text-slate-100 text-xs text-right">Rs. {fs.Amount}</div>
                                                </button>
                                            ))}
                                            {classFeeStructures.length === 0 && <div className="py-8 text-center text-[10px] text-slate-400 font-medium">No structures found for this class.</div>}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2 mb-1">
                                            <Icon icon="ph:list-checks-bold" className="text-primary-500 w-4 h-4" />
                                            Charge Assignments
                                        </h5>
                                        <div className="space-y-2.5">
                                            {selectedFees.length === 0 && (
                                                <div className="py-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-slate-300">
                                                    <Icon icon="ph:shopping-cart-simple-duotone" className="w-10 h-10 opacity-20" />
                                                    <p className="text-[10px] poppins font-medium mt-2">No charges selected</p>
                                                </div>
                                            )}
                                            {selectedFees.map((f) => (
                                                <div key={f.FeeType} className="bg-white dark:bg-[#111111] rounded-xl border dark:border-slate-700 p-3 shadow-sm space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">{f.FeeType}</div>
                                                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Rs. {f.Amount} / Month</div>
                                                        </div>
                                                        <button onClick={() => handleRemoveFeeType(f.FeeType)} className="text-slate-200 hover:text-danger-500 transition-colors">
                                                            <Icon icon="ph:minus-circle-bold" className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                    <Select
                                                        label="Select Month(s)"
                                                        isMulti
                                                        options={months.filter(m => !paidFees.some(pf => pf.FeeType === f.FeeType && pf.Month === m.value))}
                                                        value={f.months}
                                                        onChange={(m) => handleMonthChange(f.FeeType, m)}
                                                        className="poppins text-[12px]"
                                                        icon="ph:calendar-bold"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-32 flex flex-col items-center justify-center text-slate-400 opacity-60">
                                <Icon icon="ph:user-focus-duotone" className="w-16 h-16 mb-1" />
                                <p className="text-[14px] poppins text-center leading-loose">Synchronize student profile to begin voucher generation.</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* SUMMARY & ACTIONS */}
                <div className="lg:col-span-4 sticky top-6">
                    <Card title="Payment Summary" className="border dark:border-[#2f3336]">
                        <div className="space-y-5">
                            {/* Breakdown Section */}
                            {selectedFees.length > 0 && (
                                <div className="space-y-3 pb-4 border-b dark:border-slate-800">
                                    <div className="text-[11px] font-bold text-slate-400 tracking-wider mb-2 flex items-center justify-between">
                                        <span>Fee Breakdown</span>
                                        <div className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-bold">{selectedFees.length} Items</div>
                                    </div>
                                    {selectedFees.map((f) => (
                                        <div key={f.FeeType} className="flex justify-between items-start">
                                            <div className="flex-1 pr-4">
                                                <div className="text-[13px] font-bold text-slate-700 dark:text-slate-200 leading-none mb-1">{f.FeeType}</div>
                                                <div className="text-[11px] text-slate-400 font-medium truncate max-w-[200px]">
                                                    {f.months.length > 0 ? f.months.map(m => m.label).join(', ') : 'No months selected'}
                                                </div>
                                            </div>
                                            <div className="text-[13px] font-bold text-slate-600 dark:text-slate-300">
                                                Rs. {(f.Amount * f.months.length).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-slate-500 font-medium text-[13px]">Gross Total</span>
                                    <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Rs. {calculation.total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-slate-500 font-medium text-[13px]">Fee Concession</span>
                                    <span className="text-[15px] font-bold text-success-500">- Rs. {calculation.concession.toLocaleString()}</span>
                                </div>

                                <div className="pt-4 border-t dark:border-slate-800 flex justify-between items-center px-1">
                                    <span className="text-slate-800 dark:text-slate-100 font-bold text-sm">Net Payable Amount</span>
                                    <span className="text-xl font-bold text-primary-500 tracking-tight">Rs. {calculation.payable.toLocaleString()}</span>
                                </div>
                            </div>

                            <Button
                                text={loading ? "Generating..." : "Finalize & Issue Voucher"}
                                className="btn-primary w-full mt-4 rounded-xl font-bold text-[13px] shadow-lg shadow-primary-500/10"
                                disabled={loading || !student || selectedFees.length === 0}
                                onClick={handleGenerateVoucher}
                                icon="ph:paper-plane-tilt-bold"
                            />
                            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">
                                <Icon icon="ph:lock-key-bold" className="text-success-500 w-3 h-3" />
                                Official Transaction
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* VOUCHER HISTORY MODAL */}
            <Modal
                title="Student Voucher History"
                activeModal={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                className="max-w-4xl"
            >
                <div className="space-y-4 p-2">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[12px] border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                    <th className="px-4">Voucher #</th>
                                    <th className="px-4">Date</th>
                                    <th className="px-4">Session</th>
                                    <th className="px-4">Amount</th>
                                    <th className="px-4">Status</th>
                                    <th className="px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentHistory.map((v) => (
                                    <tr key={v.ID} className="bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                                        <td className="px-4 py-3 font-bold text-primary-500">{v.VoucherNumber}</td>
                                        <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">{moment(v.CreatedAt).format('DD MMM YYYY')}</td>
                                        <td className="px-4 py-3 text-slate-500 font-bold uppercase text-[10px]">{v.AcademicYearName}</td>
                                        <td className="px-4 py-3 font-black text-slate-800 dark:text-slate-100">Rs. {v.PayableAmount.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <Badge label={v.Status} className={v.Status === 'Paid' ? 'badge-soft-success' : 'badge-soft-warning'} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={async () => {
                                                    const res = await get(`/finance/vouchers/${v.ID}`);
                                                    setActiveVoucher(res.data);
                                                    setIsPreviewOpen(true);
                                                }}
                                                className="h-7 w-7 rounded bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-slate-500 hover:text-primary-500 transition-colors"
                                            >
                                                <Icon icon="ph:printer-bold" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {studentHistory.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-400">No previous vouchers found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal>

            {/* VOUCHER PREVIEW MODAL */}
            <Modal
                title="Electronic Fee Voucher"
                activeModal={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                className="max-w-2xl"
            >
                {activeVoucher && (
                    <div className="p-2 space-y-6">
                        <div className="flex border boder-dashed dark:border-slate-700 p-8 rounded-3xl bg-slate-50/20 flex-col space-y-8" id="printable-voucher">
                            {/* Header */}
                            <div className="flex justify-between items-start pb-6 border-b-2 border-slate-200 dark:border-slate-800">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">EDUNEX <span className="text-primary-500">FISCAL</span></h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Official Fee Payment Advice</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Voucher Number</div>
                                    <div className="text-lg font-black text-primary-500">{activeVoucher.VoucherNumber}</div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1.5">Student Credentials</div>
                                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{activeVoucher.FirstName} {activeVoucher.LastName}</div>
                                        <div className="text-[11px] text-slate-500 font-medium">{activeVoucher.AdmissionNumber} • {activeVoucher.ClassName}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1.5">Academic Session</div>
                                        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{activeVoucher.AcademicYearName}</div>
                                    </div>
                                </div>
                                <div className="space-y-4 text-right">
                                    <div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1.5">Issue Date</div>
                                        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{moment(activeVoucher.CreatedAt).format('MMMM DD, YYYY')}</div>
                                    </div>
                                    <div className="inline-block px-3 py-1 bg-warning-50 dark:bg-warning-500/10 text-warning-600 text-[10px] font-black rounded-lg uppercase border border-warning-200 dark:border-warning-800/30">
                                        Status: {activeVoucher.Status}
                                    </div>
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border dark:border-slate-800 shadow-sm">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-4 font-black uppercase text-[10px] text-slate-400 tracking-widest">Description / Fee Type</th>
                                            <th className="px-6 py-4 font-black uppercase text-[10px] text-slate-400 tracking-widest text-right">Amount (Rs.)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-slate-800 font-medium text-slate-600 dark:text-slate-400">
                                        {activeVoucher.items?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-6 py-4">{item.FeeType} <span className="ml-2 text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold uppercase">{item.Month}</span></td>
                                                <td className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-200">{item.Amount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="bg-slate-50/50 dark:bg-slate-800/30 px-6 py-5 space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400">SUBTOTAL</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-200">Rs. {activeVoucher.TotalAmount}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400 uppercase tracking-widest">Scholarship/Concession</span>
                                        <span className="font-bold text-success-500">-Rs. {activeVoucher.ConcessionAmount}</span>
                                    </div>
                                    <div className="pt-3 border-t dark:border-slate-700 flex justify-between items-center">
                                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase">Net Payable Amount</span>
                                        <span className="text-xl font-black text-primary-500 italic">Rs. {activeVoucher.PayableAmount}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex flex-col items-center">
                                <div className="text-[9px] text-slate-400 font-medium max-w-sm text-center">This is a computer generated voucher for the purpose of fee collection. Please deposit the amount at the institution's designated counter.</div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                text="Download PDF"
                                className="btn-outline-secondary flex-1 py-3 font-bold uppercase tracking-wide text-[11px] rounded-xl"
                                icon="ph:download-simple-bold"
                            />
                            <Button
                                text="Print Voucher"
                                className="btn-primary flex-1 py-3 font-bold uppercase tracking-wide text-[11px] rounded-xl shadow-lg shadow-primary-500/10"
                                icon="ph:printer-bold"
                                onClick={() => window.print()}
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Invoices;
