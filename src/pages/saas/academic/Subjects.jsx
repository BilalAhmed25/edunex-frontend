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
import Select from "react-select";
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
        setIsAssignOpen(true);
        try {
            const res = await get(`/academic/class-subjects?subjectID=${subject.ID}`);
            if (res?.data) {
                const assignedIds = res.data.map(a => a.ClassID);
                setAssignClasses(classes.filter(c => assignedIds.includes(c.value)));
            }
        } catch (err) {
            toast.error("Failed to load assignments");
        }
    };

    const handleSaveAssignments = async () => {
        try {
            // Since our backend endpoint is POST /api/class-subjects which syncs by classID,
            // we need to consider if we want to sync by subjectID instead.
            // Actually, the current backend endpoint handles syncing by classID.
            // Let's add a backend endpoint for syncing by subjectID or just loop it.
            // Better to have a robust backend endpoint.
            
            // For now, let's assume we can loop or better, update backend.
            // Wait, I just added /class-subjects which deletes by ClassID.
            // If I want to sync assignments for a SUBJECT, I need another endpoint.
            
            // I'll update the backend to handle subject-based sync too.
            // Or I can just call the class-based one for each selected class? No, that's wrong.
            
            // Let's update `academicRoutes.js` first to handle Subject-based sync.
            toast.info("Updating assignments...");
            // ... will come back here
        } catch (err) {
            toast.error("Failed to save assignments");
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
            >
                <form onSubmit={onSubmit} className="space-y-5 py-2">
                    <Textinput
                        name="name"
                        label="Subject Name"
                        placeholder="e.g. Mathematics"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="poppins"
                    />
                    <Textinput
                        name="code"
                        label="Subject Code"
                        placeholder="e.g. MATH101"
                        value={formData.code}
                        onChange={handleChange}
                        className="poppins font-mono"
                    />
                    <div className="flex items-center space-x-3 pt-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300 poppins">Active Status</label>
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
                        className="btn-primary block w-full text-center mt-6 py-3 font-bold uppercase tracking-wider" 
                        text={isEditMode ? "Update Subject" : "Create Subject"} 
                    />
                </form>
            </Modal>

            {/* Assignment Modal */}
            <Modal
                title={`Assign Subject - ${selectedSubject?.Name}`}
                activeModal={isAssignOpen}
                onClose={() => setIsAssignOpen(false)}
            >
                <div className="space-y-6 py-2">
                    <div className="alert bg-primary-50 text-primary-600 p-4 rounded-xl text-sm poppins flex items-start gap-3">
                        <Icon icon="heroicons-outline:information-circle" className="w-5 h-5 flex-shrink-0" />
                        Assigning a subject to a class makes it available for section teacher allocations.
                    </div>
                    
                    <div>
                        <label className="form-label mb-2 block poppins font-bold text-slate-700">Select Classes</label>
                        <Select
                            isMulti
                            options={classes}
                            value={assignClasses}
                            onChange={setAssignClasses}
                            placeholder="Select classes..."
                            className="react-select poppins"
                            classNamePrefix="select"
                        />
                    </div>

                    <div className="pt-4 border-t flex justify-end gap-3">
                        <Button 
                            text="Cancel" 
                            className="btn-outline-secondary btn-sm poppins px-6" 
                            onClick={() => setIsAssignOpen(false)} 
                        />
                        <Button 
                            text="Save Assignments" 
                            className="btn-primary btn-sm poppins px-6" 
                            onClick={async () => {
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
                            }} 
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Subjects;
