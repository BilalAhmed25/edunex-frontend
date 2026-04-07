import React, { useState, useEffect, useMemo, useRef } from "react";
import { get, post, put, del } from "@/lib/apiClient";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import Textinput from "@/components/ui/Textinput";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Fileinput from "@/components/ui/Fileinput";
import DataTable from "@/components/ui/DataTable";
import SkeletonTable from "@/components/skeleton/Table";

const TeacherAssignments = () => {
    const { user } = useSelector((s) => s.auth);
    const isAdmin = user?.RoleID === 2;

    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filePreview, setFilePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [sections, setSections] = useState([]);

    const [formData, setFormData] = useState({
        classID: "", sectionID: "", subjectID: "",
        title: "", description: "", fileURL: "",
        dueDate: "", maxMarks: "100", status: "active",
    });

    const fileRef = useRef(null);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const res = await get("/lms/assignments");
            setAssignments(res.data || []);
        } catch { toast.error("Failed to load assignments"); }
        finally { setLoading(false); }
    };

    const fetchDropdowns = async () => {
        try {
            const [classRes, subRes] = await Promise.all([
                get("/academic/classes"), get("/academic/subjects"),
            ]);
            setClasses((classRes.data || []).map(c => ({ value: c.ID, label: c.Name, sections: c.sections })));
            setSubjects((subRes.data || []).map(s => ({ value: s.ID, label: s.Name })));
        } catch { toast.error("Failed to load class/subject data"); }
    };

    useEffect(() => { fetchAssignments(); fetchDropdowns(); }, []);

    // Dynamic sections based on selected class
    useEffect(() => {
        if (!formData.classID) { setSections([]); return; }
        const cls = classes.find(c => c.value === formData.classID);
        if (cls?.sections) {
            try {
                const secs = typeof cls.sections === 'string' ? JSON.parse(cls.sections) : cls.sections;
                setSections((secs || []).map(s => ({ value: s.ID, label: s.Name })));
            } catch { setSections([]); }
        } else { setSections([]); }
    }, [formData.classID, classes]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setFormData(p => ({ ...p, fileURL: ev.target.result }));
            setFilePreview({ name: file.name, type: file.type });
        };
        reader.readAsDataURL(file);
    };

    const handleEdit = (item) => {
        setEditId(item.ID);
        setFormData({
            classID: item.ClassID, sectionID: item.SectionID || "",
            subjectID: item.SubjectID,
            title: item.Title, description: item.Description || "",
            fileURL: item.FileURL || "", dueDate: item.DueDate?.slice(0, 16) || "",
            maxMarks: String(item.MaxMarks), status: item.Status,
        });
        setFilePreview(item.FileURL ? { name: "Attached file", type: "" } : null);
        setIsEditMode(true);
        setIsOpen(true);
    };

    const resetForm = () => {
        setFormData({ classID: "", sectionID: "", subjectID: "", title: "", description: "", fileURL: "", dueDate: "", maxMarks: "100", status: "active" });
        setFilePreview(null);
        setIsEditMode(false);
        setEditId(null);
        if (fileRef.current) fileRef.current.value = "";
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (isEditMode) {
                await put(`/lms/assignments/${editId}`, formData);
                toast.success("Assignment updated");
            } else {
                await post("/lms/assignments", formData);
                toast.success("Assignment published");
            }
            setIsOpen(false);
            resetForm();
            fetchAssignments();
        } catch (err) {
            toast.error(err.response?.data || "Operation failed");
        } finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this assignment? All submissions will also be removed.")) return;
        try {
            await del(`/lms/assignments/${id}`);
            toast.success("Assignment deleted");
            fetchAssignments();
        } catch { toast.error("Failed to delete"); }
    };

    const columns = useMemo(() => [
        {
            Header: "Title",
            accessor: "Title",
            Cell: ({ row }) => (
                <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{row.original.Title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{row.original.SubjectName}</div>
                </div>
            ),
        },
        {
            Header: "Class",
            accessor: "ClassName",
            width: 200,
            Cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Badge label={row.original.ClassName} className="badge-soft-primary text-[11px] font-semibold px-2.5" />
                    {row.original.SectionName && <Badge label={row.original.SectionName} className="badge-soft-secondary text-[11px] px-2" />}
                </div>
            ),
        },
        {
            Header: "Due Date",
            accessor: "DueDate",
            Cell: ({ value }) => {
                const d = new Date(value);
                const isPast = d < new Date();
                return (
                    <span className={`text-[12px] font-medium ${isPast ? "text-danger-500" : "text-slate-600 dark:text-slate-300"}`}>
                        {d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                );
            },
        },
        {
            Header: "Max Marks",
            accessor: "MaxMarks",
            Cell: ({ value }) => <span className="font-bold text-primary-500">{value}</span>,
        },
        {
            Header: "Submissions",
            accessor: "SubmissionCount",
            Cell: ({ value }) => (
                <Badge
                    label={`${value} submitted`}
                    className={`text-[11px] font-semibold px-2.5 ${value > 0 ? "badge-soft-success" : "badge-soft-warning"}`}
                />
            ),
        },
        {
            Header: "Status",
            accessor: "Status",
            Cell: ({ value }) => (
                <Badge label={value} className={`text-[11px] capitalize font-semibold px-2.5 ${value === "active" ? "badge-soft-success" : "badge-soft-secondary"}`} />
            ),
        },
        {
            Header: "Attachment",
            accessor: "FileURL",
            Cell: ({ value }) => value ? (
                <a href={value} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-primary-500 hover:text-primary-600 font-semibold">
                    <Icon icon="ph:paperclip-bold" className="w-3.5 h-3.5" /> View File
                </a>
            ) : <span className="text-slate-300 dark:text-slate-700 text-[11px]">—</span>,
        },
        {
            Header: "Actions",
            Cell: ({ row }) => (
                <div className="flex gap-2">
                    <button onClick={() => handleEdit(row.original)}
                        className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-500 hover:bg-primary-100 transition-colors"
                        title="Edit">
                        <Icon icon="ph:pencil-bold" className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(row.original.ID)}
                        className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
                        title="Delete">
                        <Icon icon="ph:trash-bold" className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ], []);

    const stats = useMemo(() => ({
        total: assignments.length,
        active: assignments.filter(a => a.Status === "active").length,
        totalSubmissions: assignments.reduce((s, a) => s + (parseInt(a.SubmissionCount) || 0), 0),
    }), [assignments]);

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:clipboard-text-bold"
                title="Assignment Manager"
                description="Create, distribute, and track assignments for your classes."
                buttonText="New Assignment"
                onButtonClick={() => { resetForm(); setIsOpen(true); }}
            />

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Total Assignments", value: stats.total, icon: "ph:clipboard-text", color: "text-primary-500 bg-primary-50 dark:bg-primary-900/10" },
                    { label: "Active", value: stats.active, icon: "ph:check-circle", color: "text-success-500 bg-success-50 dark:bg-success-900/10" },
                    { label: "Total Submissions", value: stats.totalSubmissions, icon: "ph:upload-simple", color: "text-warning-500 bg-warning-50 dark:bg-warning-900/10" },
                ].map((s) => (
                    <div key={s.label} className="card p-4 flex-row items-center gap-4 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-xl shadow-none">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                            <Icon icon={s.icon} className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-white">{s.value}</div>
                            <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="card p-6 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-xl shadow-none">
                    <SkeletonTable count={5} />
                </div>
            ) : (
                <div className="card border dark:border-[#2f3336] rounded-xl overflow-hidden bg-white dark:bg-[#111111] shadow-none">
                    <DataTable columns={columns} data={assignments} pageSize={10} />
                </div>
            )}

            {/* Modal */}
            <Modal
                title={isEditMode ? "Edit Assignment" : "New Assignment"}
                activeModal={isOpen}
                onClose={() => { setIsOpen(false); resetForm(); }}
                className="max-w-2xl"
            >
                <form onSubmit={onSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            name="classID" label="Target Class" required
                            options={classes}
                            value={classes.find(c => c.value === formData.classID) || null}
                            onChange={opt => setFormData(p => ({ ...p, classID: opt?.value || "", sectionID: "" }))}
                            placeholder="Select class..." icon="ph:chalkboard-bold"
                        />
                        <Select
                            name="sectionID" label="Section (Optional)"
                            options={sections}
                            value={sections.find(s => s.value === formData.sectionID) || null}
                            onChange={opt => setFormData(p => ({ ...p, sectionID: opt?.value || "" }))}
                            placeholder="All sections" icon="ph:users-bold"
                        />
                    </div>
                    <Select
                        name="subjectID" label="Subject" required
                        options={subjects}
                        value={subjects.find(s => s.value === formData.subjectID) || null}
                        onChange={opt => setFormData(p => ({ ...p, subjectID: opt?.value || "" }))}
                        placeholder="Select subject..." icon="ph:books-bold"
                    />
                    <Textinput name="title" label="Assignment Title" placeholder="e.g. Chapter 5 Exercise" value={formData.title} onChange={handleChange} required icon="ph:pencil-bold" />
                    <Textarea label="Description / Instructions" placeholder="Describe what students need to do..." value={formData.description} onChange={handleChange} row={3} />
                    <div className="grid grid-cols-2 gap-4">
                        <Textinput name="dueDate" label="Due Date & Time" type="datetime-local" value={formData.dueDate} onChange={handleChange} required icon="ph:clock-bold" />
                        <Textinput name="maxMarks" label="Max Marks" type="number" min="1" value={formData.maxMarks} onChange={handleChange} required icon="ph:star-bold" />
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Attachment <span className="text-slate-400 font-normal">(PDF, image, doc)</span>
                        </label>
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:border-primary-400 transition-colors cursor-pointer"
                            onClick={() => fileRef.current?.click()}>
                            {filePreview ? (
                                <div className="flex items-center justify-center gap-2 text-sm text-primary-600 dark:text-primary-400">
                                    <Icon icon="ph:file-bold" className="w-5 h-5" />
                                    <span className="font-medium">{filePreview.name}</span>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setFilePreview(null); setFormData(p => ({ ...p, fileURL: "" })); }}
                                        className="ml-2 text-danger-400 hover:text-danger-600">
                                        <Icon icon="ph:x-circle-bold" className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-1">
                                    <Icon icon="ph:upload-simple-bold" className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                    <span className="text-[12px] text-slate-400">Click to upload or drag and drop</span>
                                </div>
                            )}
                        </div>
                        <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileChange} />
                    </div>

                    {isEditMode && (
                        <Select
                            name="status" label="Status"
                            options={[{ value: "active", label: "Active" }, { value: "closed", label: "Closed" }]}
                            value={{ value: formData.status, label: formData.status === "active" ? "Active" : "Closed" }}
                            onChange={opt => setFormData(p => ({ ...p, status: opt?.value || "active" }))}
                            icon="ph:toggle-right-bold"
                        />
                    )}

                    <div className="pt-4 flex items-center justify-end gap-3 border-t dark:border-slate-800">
                        <Button text="Cancel" disabled={isSubmitting} className="btn-light px-8 font-bold text-[11px] uppercase tracking-wider h-[44px] rounded-xl" onClick={() => { setIsOpen(false); resetForm(); }} />
                        <Button type="submit" disabled={isSubmitting} className="btn-primary px-10 font-bold text-[11px] uppercase tracking-wider h-[44px] rounded-xl"
                            text={isSubmitting ? "Saving..." : (isEditMode ? "Update Assignment" : "Publish Assignment")} />
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default TeacherAssignments;
