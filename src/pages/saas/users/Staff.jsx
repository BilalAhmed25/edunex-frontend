import React, { useState, useEffect, useMemo } from "react";
import { get, post, put, del } from "@/lib/apiClient";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";
import { toast } from "react-toastify";
import DataTable from "@/components/ui/DataTable";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import SkeletonTable from "@/components/skeleton/Table";

const Staff = () => {
    const [staffList, setStaffList] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isSalaryOpen, setIsSalaryOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [salaryHistory, setSalaryHistory] = useState([]);

    // Form States
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [selectedRole, setSelectedRole] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        employeeID: "",
        department: "",
        designation: "",
        joiningDate: new Date().toISOString().split('T')[0]
    });

    const [salaryData, setSalaryData] = useState({
        amount: "",
        notes: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [staffRes, rolesRes] = await Promise.all([
                get("/users/staff"),
                get("/roles/all")
            ]);

            if (staffRes?.data) setStaffList(staffRes.data);
            if (rolesRes?.data) {
                setRoles(rolesRes.data.map(r => ({ value: r.ID, label: r.Name })));
            }
        } catch (err) {
            toast.error("Failed to load staff metadata");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSalaryClick = async (staff) => {
        setSelectedStaff(staff);
        setIsSalaryOpen(true);
        try {
            const res = await get(`/users/staff/salaries/${staff.ID}`);
            if (res?.data) setSalaryHistory(res.data);
        } catch (err) {
            toast.error("Failed to load salary history");
        }
    };

    const onSalarySubmit = async (e) => {
        e.preventDefault();
        try {
            await post("/users/staff/salaries", {
                staffID: selectedStaff.ID,
                amount: salaryData.amount,
                notes: salaryData.notes
            });
            toast.success("Salary updated");
            setIsSalaryOpen(false);
            setSalaryData({ amount: "", notes: "" });
            fetchData();
        } catch (err) {
            toast.error("Failed to update salary");
        }
    };

    const toggleStaffStatus = async (staff) => {
        const newStatus = staff.Status === 'active' ? 'inactive' : 'active';
        try {
            await post("/users/update-employee-status", { empID: staff.UserID, status: newStatus });
            toast.success(`Staff ${newStatus}d`);
            fetchData();
        } catch (err) {
            toast.error("Status update failed");
        }
    };

    const handleEdit = (staff) => {
        setEditId(staff.ID);
        setFormData({
            firstName: staff.FirstName,
            lastName: staff.LastName,
            email: staff.Email,
            employeeID: staff.EmployeeID || "",
            department: staff.Department || "",
            designation: staff.Designation || "",
            joiningDate: staff.JoiningDate ? staff.JoiningDate.split('T')[0] : ""
        });
        setSelectedRole(roles.find(r => r.label === staff.RoleName));
        setIsEditMode(true);
        setIsOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this staff member? This will also remove their login account.")) return;
        try {
            await del(`/users/staff/${id}`);
            toast.success("Staff member deleted");
            fetchData();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const columns = useMemo(() => [
        {
            Header: "Employee",
            accessor: "ID",
            Cell: ({ row }) => (
                <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-primary-500">
                        {row.original.FirstName[0]}{row.original.LastName[0]}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase">
                            {row.original.FirstName} {row.original.LastName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 lowercase">
                            {row.original.Email}
                        </div>
                    </div>
                </div>
            )
        },
        {
            Header: "Role & Designation",
            accessor: "RoleName",
            Cell: ({ row }) => (
                <div>
                    <div className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-tight">
                        {row.original.RoleName}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase truncate max-w-[120px]">
                        {row.original.Designation || "No Designation"}
                    </div>
                </div>
            )
        },
        {
            Header: "Department",
            accessor: "Department",
            Cell: ({ value }) => (
                <Badge label={value || "N/A"} className="badge-soft-slate poppins font-bold text-[10px]" />
            )
        },
        {
            Header: "Salary",
            accessor: "Salary",
            Cell: ({ value, row }) => (
                <div
                    onClick={() => handleSalaryClick(row.original)}
                    className="cursor-pointer group flex flex-col"
                >
                    <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 poppins">
                        PKR {value?.toLocaleString() || "0.00"}
                    </span>
                    <span className="text-[10px] text-primary-500 font-bold uppercase group-hover:underline flex items-center gap-1">
                        <Icon icon="heroicons-outline:clock" className="w-3 h-3" /> History
                    </span>
                </div>
            )
        },
        {
            Header: "Status",
            accessor: "Status",
            Cell: ({ value, row }) => (
                <button
                    onClick={() => toggleStaffStatus(row.original)}
                    className="cursor-pointer hover:opacity-80 transition-all active:scale-95"
                >
                    <Badge
                        label={value}
                        className={value === 'active' ? "badge-soft-success" : "badge-soft-danger"}
                    />
                </button>
            )
        },
        {
            Header: "Actions",
            Cell: ({ row }) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleEdit(row.original)}
                        className="text-slate-400 hover:text-primary-500 transition-colors p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                    >
                        <Icon icon="heroicons-outline:pencil-alt" className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.original.ID)}
                        className="text-slate-400 hover:text-danger-500 transition-colors p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                    >
                        <Icon icon="heroicons-outline:trash" className="w-5 h-5" />
                    </button>
                </div>
            )
        }
    ], [roles]);

    const onSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.firstName?.trim() || !formData.lastName?.trim()) return toast.error("Name is required");
        if (!formData.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return toast.error("Valid email is required");
        if (!isEditMode && (!formData.password || formData.password.length < 6)) return toast.error("Temporary password must be at least 6 characters");
        if (!selectedRole) return toast.error("Please assign a work role");

        const payload = { ...formData, roleID: selectedRole?.value };
        try {
            setSubmitting(true);
            if (isEditMode) {
                await put(`/users/staff/${editId}`, payload);
                toast.success("Staff profile updated");
            } else {
                await post("/users/staff", payload);
                toast.success("Staff member onboarded successfully");
            }
            setIsOpen(false);
            resetForm();
            fetchData();
        } catch (err) {
            toast.error(err.response?.data || err.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            employeeID: "",
            department: "",
            designation: "",
            joiningDate: new Date().toISOString().split('T')[0]
        });
        setSelectedRole(null);
        setIsEditMode(false);
        setEditId(null);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:identification-card"
                title="Staff Management"
                description="Manage profiles, access permissions, and salary history for your institution's workforce."
                buttonText="Add Staff member"
                onButtonClick={() => setIsOpen(true)}
            />

            <div className="bg-white dark:bg-[#111111] rounded-2xl border dark:border-[#2f3336] shadow-sm overflow-hidden transition-all">
                {loading ? (
                    <div className="p-10"><SkeletonTable count={7} /></div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={staffList}
                        pageSize={10}
                        className="poppins"
                    />
                )}
            </div>

            <Modal
                title={selectedStaff ? `Salary: ${selectedStaff.FirstName}` : "Manage Salary"}
                activeModal={isSalaryOpen}
                onClose={() => setIsSalaryOpen(false)}
                className="max-w-xl"
            >
                <div className="space-y-4 py-2">
                    <form onSubmit={onSalarySubmit} className="dark:bg-slate-800/20 p-4 rounded-xl border dark:border-slate-700 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Textinput
                                type="number"
                                label="Update Amount (PKR)"
                                placeholder="e.g. 50000"
                                classGroup="mb-0"
                                value={salaryData.amount}
                                onChange={(e) => setSalaryData({ ...salaryData, amount: e.target.value })}
                                required
                            />
                            <Textinput
                                label="History Notes"
                                placeholder="Reason..."
                                classGroup="mb-0"
                                value={salaryData.notes}
                                onChange={(e) => setSalaryData({ ...salaryData, notes: e.target.value })}
                            />
                        </div>
                        <Button type="submit" text="Confirm Salary Update" className="btn-primary w-full btn-sm font-bold" />
                    </form>

                    <div className="border-t dark:border-slate-700 pt-4">
                        <div className="text-[10px] font-bold uppercase text-slate-400 mb-3 tracking-widest pl-1">Salary Log</div>
                        <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {salaryHistory.length === 0 ? (
                                <div className="text-center py-6 border-2 border-dashed dark:border-slate-800 rounded-xl opacity-40 text-xs poppins">No previous salary updates found.</div>
                            ) : salaryHistory.map((h, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-lg border dark:border-[#2f3336] bg-white dark:bg-[#16181c]">
                                    <div>
                                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">PKR {h.Amount.toLocaleString()}</div>
                                        <div className="text-[10px] uppercase text-slate-400 font-bold">{new Date(h.ChangeDate).toLocaleDateString()}</div>
                                    </div>
                                    <div className="text-[11px] text-slate-500 italic max-w-[200px] text-right truncate">
                                        {h.Notes}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal title={isEditMode ? `Edit Profile: ${formData.firstName}` : "Onboard New Staff Member"} activeModal={isOpen} onClose={() => { setIsOpen(false); resetForm(); }} className="max-w-5xl">
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-1">
                        <Textinput name="firstName" label="First Name" placeholder="John" value={formData.firstName} onChange={handleChange} required />
                        <Textinput name="lastName" label="Last Name" placeholder="Smith" value={formData.lastName} onChange={handleChange} required />
                        <Textinput type="date" name="joiningDate" label="Joining Date" value={formData.joiningDate} onChange={handleChange} />

                        <div className="col-span-full border-t dark:border-slate-700 pt-3">
                            <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-widest">Account & Access</h4>
                        </div>

                        <div className="md:col-span-1">
                            <Textinput type="email" name="email" label="Email Address" placeholder="staff@edunex.edu" value={formData.email} onChange={handleChange} required />
                        </div>
                        {!isEditMode && (
                            <div className="md:col-span-1">
                                <Textinput type="password" name="password" label="Temporary Password" value={formData.password} onChange={handleChange} required />
                            </div>
                        )}
                        <div className={isEditMode ? "md:col-span-2" : "md:col-span-1"}>
                            <Select
                                label="Assign Work Role"
                                options={roles}
                                onChange={setSelectedRole}
                                value={selectedRole}
                                placeholder="Select a role..."
                            />
                        </div>

                        <div className="col-span-full border-t dark:border-slate-700 pt-3">
                            <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-widest">Job Details</h4>
                        </div>

                        <div className="md:col-span-1">
                            <Textinput name="department" label="Department" placeholder="e.g. Science, Accounts" value={formData.department} onChange={handleChange} />
                        </div>
                        <div className="md:col-span-1">
                            <Textinput name="designation" label="Designation" placeholder="e.g. Senior Lecturer" value={formData.designation} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="pt-4 border-t dark:border-slate-700 px-1 text-right">
                        <Button
                            type="submit"
                            className="btn-primary px-10 py-2.5 rounded-lg shadow-lg font-bold text-sm"
                            text={isEditMode ? (submitting ? "Applying..." : "Update Profile") : (submitting ? "Please wait..." : "Create Account")}
                            disabled={submitting}
                        />
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Staff;
