import React, { useState, useEffect, useMemo } from "react";
import { get, post, put, del } from "@/lib/apiClient";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";
import DataTable from "@/components/ui/DataTable";
import SkeletonTable from "@/components/skeleton/Table";
import Icon from "@/components/ui/Icon";
import { toast } from "react-toastify";
import PageHeader from "@/components/ui/PageHeader";

const FeeStructures = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [academicYears, setAcademicYears] = useState([]);
    const [classes, setClasses] = useState([]);
    const [filterYearID, setFilterYearID] = useState("");

    const [formData, setFormData] = useState({
        academicYearID: "",
        classID: "",
        feeType: "",
        amount: ""
    });

    // PIVOT Logic: Group flat data by Class and Year
    const pivotedData = useMemo(() => {
        const groups = {};
        const allFeeTypes = new Set();

        const filtered = filterYearID
            ? data.filter(item => item.AcademicYearID === parseInt(filterYearID))
            : data;

        filtered.forEach(item => {
            const key = `${item.ClassID}_${item.AcademicYearID}`;
            if (!groups[key]) {
                groups[key] = {
                    classID: item.ClassID,
                    className: item.ClassName,
                    academicYearID: item.AcademicYearID,
                    academicYearName: item.AcademicYearName
                };
            }
            groups[key][item.FeeType] = item;
            allFeeTypes.add(item.FeeType);
        });

        return {
            rows: Object.values(groups),
            feeTypes: Array.from(allFeeTypes).sort()
        };
    }, [data, filterYearID]);

    const columns = useMemo(() => {
        const cols = [
            {
                Header: "Session",
                accessor: "academicYearName",
                Cell: ({ value }) => <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{value}</span>
            },
            {
                Header: "Class",
                accessor: "className",
                Cell: ({ value }) => <Badge label={value} className="badge-soft-primary px-3 py-1 text-[12px] font-bold" />
            }
        ];

        // Add dynamically generated fee type columns
        pivotedData.feeTypes.forEach(type => {
            cols.push({
                Header: type,
                accessor: type,
                Cell: ({ value }) => value ? (
                    <div className="group relative cursor-pointer" onClick={() => handleEdit(value)}>
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-500 transition-colors">
                            <span className="text-[10px] text-slate-400 font-medium">Rs. </span>
                            {parseFloat(value.Amount).toLocaleString()}
                        </div>
                        <div className="absolute -top-8 left-0 invisible group-hover:visible bg-slate-900 border border-slate-700 text-white text-[9px] px-2 py-1 rounded-md  whitespace-nowrap z-50 shadow-2xl opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                            <span className="flex items-center gap-1">
                                <Icon icon="heroicons-outline:pencil" className="w-3 h-3" /> Click to Edit
                            </span>
                        </div>
                    </div>
                ) : <span className="text-slate-300 dark:text-slate-700  text-[12px]">--</span>
            });
        });

        cols.push({
            Header: "Manage",
            Cell: ({ row }) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => {
                            resetForm();
                            setFormData(prev => ({
                                ...prev,
                                academicYearID: row.original.academicYearID,
                                classID: row.original.classID
                            }));
                            setIsOpen(true);
                        }}
                        className="text-primary-500 hover:text-primary-600 p-1.5 bg-primary-50 dark:bg-primary-900/10 rounded-md transition-all duration-200"
                        title="Add Another Fee to this Class"
                    >
                        <Icon icon="heroicons-outline:plus-circle" className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleDeleteClassFees(row.original)}
                        className="text-slate-500 hover:text-danger-500 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-md transition-all duration-200"
                        title="Delete Class Fee Profile"
                    >
                        <Icon icon="heroicons-outline:trash" className="w-5 h-5" />
                    </button>
                </div>
            )
        });

        return cols;
    }, [pivotedData]);

    const fetchFeeStructures = async () => {
        try {
            setLoading(true);
            const res = await get("/finance/fee-structures");
            if (res?.data) {
                setData(res.data);
            }
        } catch (err) {
            toast.error("Failed to load fee structures");
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdowns = async () => {
        try {
            const [yearsRes, classesRes] = await Promise.all([
                get("/academic/years"),
                get("/academic/classes")
            ]);

            if (yearsRes?.data) {
                const yearOpts = yearsRes.data.map(y => ({ value: y.ID, label: y.Name }));
                setAcademicYears(yearOpts);

                const activeYear = yearsRes.data.find(y => y.IsActive);
                if (activeYear && !isEditMode && !formData.academicYearID) {
                    setFormData(prev => ({ ...prev, academicYearID: activeYear.ID }));
                }
            }
            if (classesRes?.data) {
                setClasses(classesRes.data.map(c => ({ value: c.ID, label: c.Name })));
            }
        } catch (err) {
            toast.error("Failed to load configuration data");
        }
    };

    useEffect(() => {
        fetchFeeStructures();
        fetchDropdowns();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEdit = (item) => {
        setEditId(item.ID);
        setFormData({
            academicYearID: item.AcademicYearID,
            classID: item.ClassID,
            feeType: item.FeeType,
            amount: item.Amount
        });
        setIsEditMode(true);
        setIsOpen(true);
    };

    const handleDeleteClassFees = async (row) => {
        if (!window.confirm(`Delete all fee structures for class ${row.className} in session ${row.academicYearName}?`)) return;

        try {
            // Find all IDs to delete
            const idsToDelete = pivotedData.feeTypes
                .map(type => row[type]?.ID)
                .filter(id => id);

            for (const id of idsToDelete) {
                await del(`/finance/fee-structures/${id}`);
            }
            toast.success("Class fee profile cleared");
            fetchFeeStructures();
        } catch (err) {
            toast.error("Partial failure during deletion");
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (isEditMode) {
                await put(`/finance/fee-structures/${editId}`, formData);
                toast.success("Fee structure successfully synchronized");
            } else {
                await post("/finance/fee-structures", formData);
                toast.success("New fee structure established");
            }
            setIsOpen(false);
            resetForm();
            fetchFeeStructures();
        } catch (err) {
            toast.error(err.response?.data || "Operation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData(prev => ({
            ...prev,
            feeType: "",
            amount: ""
        }));
        setIsEditMode(false);
        setEditId(null);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:wallet-bold"
                title="Fee Structures"
                description="Consolidate and define fee components across different academic tracks."
                buttonText="Add Fee Structure"
                onButtonClick={() => {
                    resetForm();
                    setIsOpen(true);
                }}
            />

            {/* Filter Section */}
            <div className="card p-2 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-xl shadow-none px-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="w-[300px]">
                        <Select
                            name="filterYear"
                            label="Filter by Session"
                            options={[
                                { label: "All Sessions", value: "" },
                                ...academicYears
                            ]}
                            value={academicYears.find(y => y.value === (filterYearID ? parseInt(filterYearID) : null))}
                            onChange={(opt) => setFilterYearID(opt ? opt.value : "")}
                            placeholder="Select Session..."
                            icon="ph:calendar-blank-duotone"
                        />
                    </div>
                    <div className="text-[12px] text-slate-400  self-end" style={{ marginBottom: '20px' }}>
                        Showing <span className="text-primary-500">{pivotedData.rows.length}</span> class profiles across <span className="text-primary-500">{pivotedData.feeTypes.length}</span> billing entities.
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="card p-6 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-xl shadow-none">
                    <SkeletonTable count={5} />
                </div>
            ) : (
                <div className="card border dark:border-[#2f3336] rounded-xl overflow-hidden bg-white dark:bg-[#111111] shadow-none">
                    <DataTable
                        columns={columns}
                        data={pivotedData.rows}
                        pageSize={10}
                    />
                </div>
            )}

            <Modal
                title={isEditMode ? "Modify Fee Entity" : "Establish New Fee Entity"}
                activeModal={isOpen}
                onClose={() => setIsOpen(false)}
                className="max-w-xl"
            >
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400 p-4 py-3 rounded-xl text-[12px]  flex items-start gap-3 border border-primary-100 dark:border-primary-800/30 font-medium leading-relaxed">
                        <Icon icon="ph:info-bold" className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        Fee structures define the standard amounts formatted in <b>Rs.</b> per class for a specific academic year.
                    </div>

                    <div className="grid grid-cols-2 gap-5 text-left">
                        <Select
                            name="academicYearID"
                            label="Academic Year"
                            options={academicYears}
                            value={academicYears.find(opt => opt.value === formData.academicYearID)}
                            onChange={(opt) => setFormData(p => ({ ...p, academicYearID: opt ? opt.value : "" }))}
                            placeholder="Search Year..."
                            required
                            icon="ph:calendar-bold"
                        />
                        <Select
                            name="classID"
                            label="Target Class"
                            options={classes}
                            value={classes.find(opt => opt.value === formData.classID)}
                            onChange={(opt) => setFormData(p => ({ ...p, classID: opt ? opt.value : "" }))}
                            placeholder="Search Class..."
                            required
                            icon="ph:chalkboard-bold"
                        />
                    </div>

                    <Textinput
                        name="feeType"
                        label="Fee Type / Entity Title"
                        placeholder="e.g. Monthly Tuition, Annual Maintenance"
                        value={formData.feeType}
                        onChange={handleChange}
                        required
                        icon="ph:tag-bold"
                    />

                    <Textinput
                        name="amount"
                        label="Standard Amount (Rs.)"
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        className="text-lg"
                        icon="ph:money-bold"
                    />

                    <div className="pt-4 flex items-center justify-end space-x-3 border-t dark:border-slate-800">
                        <Button
                            text="Cancel"
                            disabled={isSubmitting}
                            className="btn-light  px-8 font-bold text-[11px] uppercase tracking-wider h-[44px] rounded-xl"
                            onClick={() => setIsOpen(false)}
                        />
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary  px-10 font-bold text-[11px] uppercase tracking-wider h-[44px] rounded-xl flex items-center gap-2"
                            text={isSubmitting ? "Please wait..." : (isEditMode ? "Synchronize Updates" : "Create Structure")}
                        />
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default FeeStructures;
