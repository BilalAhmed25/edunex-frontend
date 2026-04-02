import React, { useState, useEffect, useMemo } from "react";
import { get, post, put, del } from "@/lib/apiClient";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import DataTable from "@/components/ui/DataTable";
import SkeletonTable from "@/components/skeleton/Table";
import Icon from "@/components/ui/Icon";
import { toast } from "react-toastify";
import MultiSelect from "@/components/ui/MultiSelect";
import PageHeader from "@/components/ui/PageHeader";

const Subjects = () => {
    const [data, setData] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [assignClasses, setAssignClasses] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        isActive: true
    });

    const columns = useMemo(() => [
        {
            Header: "ID",
            accessor: "ID",
            Cell: ({ cell: { value } }) => (
                <span className="font-bold text-slate-400">#{value}</span>
            )
        },
        {
            Header: "Subject Name",
            accessor: "Name",
            Cell: ({ cell: { value } }) => (
                <span className="font-semibold text-slate-700 dark:text-slate-200">{value}</span>
            )
        },
        {
            Header: "Subject Code",
            accessor: "Code",
            Cell: ({ cell: { value } }) => (
                <span className="font-mono text-slate-500 dark:text-slate-400">{value || "N/A"}</span>
            )
        },
        {
            Header: "Status",
            accessor: "IsActive",
            Cell: ({ cell: { value, row } }) => (
                <button
                    onClick={() => handleToggleStatus(row.original)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                    <Badge
                        label={value ? "Active" : "Inactive"}
                        className={value ? "badge-soft-success" : "badge-soft-warning"}
                    />
                </button>
            )
        },
        {
            Header: "Actions",
            Cell: ({ row }) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleAssignClick(row.original)}
                        className="text-primary-500 hover:text-primary-600 p-1 bg-primary-50 dark:bg-primary-500/10 rounded-md transition-colors"
                        title="Assign to Classes"
                    >
                        <Icon icon="heroicons-outline:link" className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleEdit(row.original)}
                        className="text-slate-500 hover:text-primary-500 p-1 bg-slate-50 dark:bg-slate-700 rounded-md transition-colors"
                        title="Edit Subject"
                    >
                        <Icon icon="heroicons-outline:pencil-alt" className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.original.ID)}
                        className="text-slate-500 hover:text-danger-500 p-1 bg-slate-50 dark:bg-slate-700 rounded-md transition-colors"
                        title="Delete Subject"
                    >
                        <Icon icon="heroicons-outline:trash" className="w-5 h-5" />
                    </button>
                </div>
            )
        }
    ], []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const res = await get("/academic/subjects");
            if (res?.data) {
                setData(res.data);
            }
        } catch (err) {
            toast.error("Failed to load subjects");
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await get("/academic/classes");
            if (res?.data) {
                setClasses(res.data.map(c => ({ value: c.ID, label: c.Name })));
            }
        } catch (err) {
            console.error("Failed to load classes");
        }
    };

    useEffect(() => {
        fetchSubjects();
        fetchClasses();
    }, []);

    const handleEdit = (subject) => {
        setEditId(subject.ID);
        setFormData({
            name: subject.Name,
            code: subject.Code || "",
            isActive: !!subject.IsActive
        });
        setIsEditMode(true);
        setIsOpen(true);
    };

    const handleToggleStatus = async (subject) => {
        try {
            await put(`/academic/subjects/${subject.ID}`, {
                name: subject.Name,
                code: subject.Code,
                isActive: !subject.IsActive
            });
            toast.success("Status updated");
            fetchSubjects();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this subject?")) return;
        try {
            await del(`/academic/subjects/${id}`);
            toast.success("Subject deleted");
            fetchSubjects();
        } catch (err) {
            toast.error("Failed to delete subject");
        }
    };

    const handleAssignClick = async (subject) => {
        setSelectedSubject(subject);
        setAssignClasses([]); // Clear existing first
        setIsAssignOpen(true);
        try {
            const res = await get(`/academic/class-subjects?subjectID=${subject.ID}`);
            if (res?.data) {
                const assignedIds = res.data.map(a => a.ClassID);
                // Ensure we match specifically against class values
                setAssignClasses(classes.filter(c => assignedIds.includes(c.value)));
            }
        } catch (err) {
            toast.error("Failed to load assignments");
        }
    };

    const handleSaveAssignments = async () => {
        try {
            await post('/academic/subject-classes', {
                subjectID: selectedSubject.ID,
                classIDs: assignClasses.map(c => c.value)
            });
            toast.success("Assignments updated successfully");
            setIsAssignOpen(false);
        } catch (err) {
            toast.error("Failed to update assignments");
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await put(`/academic/subjects/${editId}`, formData);
                toast.success("Subject updated");
            } else {
                await post("/academic/subjects", formData);
                toast.success("Subject created");
            }
            setIsOpen(false);
            resetForm();
            fetchSubjects();
        } catch (err) {
            toast.error(err.message || "Operation failed");
        }
    };

    const resetForm = () => {
        setFormData({ name: "", code: "", isActive: true });
        setIsEditMode(false);
        setEditId(null);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:books"
                title="Academic Subjects"
                description="Manage global subject registry and their class assignments."
                buttonText="Add New Subject"
                onButtonClick={() => { resetForm(); setIsOpen(true); }}
            />

            {loading ? (
                <div className="card p-6 border dark:border-[#2f3336] bg-white dark:bg-[#111111]">
                    <SkeletonTable count={5} />
                </div>
            ) : (
                <div className="card border dark:border-[#2f3336] rounded-xl overflow-hidden bg-white dark:bg-[#111111] shadow-sm">
                    <DataTable
                        columns={columns}
                        data={data}
                        pageSize={10}
                        className="poppins"
                    />
                </div>
            )}

            <Modal
                title={isEditMode ? "Edit Subject" : "Create Subject"}
                activeModal={isOpen}
                onClose={() => setIsOpen(false)}
                className="max-w-xl"
            >
                <form onSubmit={onSubmit} className="space-y-4 py-2">
                    <Textinput
                        name="name"
                        label="Subject Name"
                        placeholder="e.g. Mathematics"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="poppins"
                        icon="ph:book-bold"
                    />
                    <Textinput
                        name="code"
                        label="Subject Code"
                        placeholder="e.g. MATH101"
                        value={formData.code}
                        onChange={handleChange}
                        className="poppins font-mono"
                        icon="ph:hash-bold"
                    />
                    <div className="flex items-center space-x-3 pt-1">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 poppins">Active Status</label>
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="btn-primary block w-full text-center mt-6 py-3 font-bold uppercase tracking-wider text-[12px] rounded-xl"
                        text={isEditMode ? "Update Subject" : "Create Subject"}
                    />
                </form>
            </Modal>

            {/* Assignment Modal */}
            <Modal
                title={`Assign Subject - ${selectedSubject?.Name}`}
                activeModal={isAssignOpen}
                onClose={() => setIsAssignOpen(false)}
                className="max-w-2xl"
            >
                <div className="space-y-4">
                    <div className="bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400 p-3 rounded-xl text-[12px] poppins flex items-start gap-3 border border-primary-100 dark:border-primary-800/30 font-medium leading-relaxed mb-3">
                        <Icon icon="ph:info-bold" className="w-5 h-5 flex-shrink-0" />
                        Assigning a subject to a class registers it within that academic track, enabling section-level teacher allocations and timetable integration.
                    </div>

                    <div className="mt-2">
                        <MultiSelect
                            label="Select Participating Classes"
                            options={classes}
                            value={assignClasses}
                            onChange={setAssignClasses}
                            placeholder="Select classes..."
                            className="poppins text-[13px]"
                        />
                    </div>

                    <div className="pt-6 border-t dark:border-slate-700 flex justify-end gap-3 mt-4">
                        <Button
                            text="Cancel"
                            className="btn-light poppins px-8 font-bold text-[11px] uppercase tracking-wider"
                            onClick={() => setIsAssignOpen(false)}
                        />
                        <Button
                            text="Synchronize Assignments"
                            className="btn-primary poppins px-10 font-bold text-[11px] uppercase tracking-wider h-[40px] rounded-xl"
                            onClick={handleSaveAssignments}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Subjects;
