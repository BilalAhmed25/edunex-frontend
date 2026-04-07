import React, { useState, useEffect, useMemo } from "react";
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
import Switch from "@/components/ui/Switch";
import DataTable from "@/components/ui/DataTable";
import SkeletonTable from "@/components/skeleton/Table";

const EMPTY_QUESTION = () => ({ text: "", options: ["", "", "", ""], correctAnswer: "", marks: "1" });

const TeacherAssessments = () => {
    const { user } = useSelector((s) => s.auth);

    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [isOpen, setIsOpen]           = useState(false);
    const [isEditMode, setIsEditMode]   = useState(false);
    const [editId, setEditId]           = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [classes, setClasses]   = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [sections, setSections] = useState([]);

    const [formData, setFormData] = useState({
        classID: "", sectionID: "", subjectID: "",
        title: "", description: "",
        assessmentType: "MCQ",
        timeLimitMinutes: "",
        cameraRestriction: false,
        totalMarks: "100",
        startDateTime: "", endDateTime: "",
        status: "draft",
    });
    const [questions, setQuestions] = useState([EMPTY_QUESTION()]);

    const fetchAssessments = async () => {
        try { setLoading(true); const res = await get("/lms/assessments"); setAssessments(res.data || []); }
        catch { toast.error("Failed to load assessments"); }
        finally { setLoading(false); }
    };

    const fetchDropdowns = async () => {
        try {
            const [classRes, subRes] = await Promise.all([get("/academic/classes"), get("/academic/subjects")]);
            setClasses((classRes.data || []).map(c => ({ value: c.ID, label: c.Name, sections: c.sections })));
            setSubjects((subRes.data || []).map(s => ({ value: s.ID, label: s.Name })));
        } catch { toast.error("Failed to load dropdown data"); }
    };

    useEffect(() => { fetchAssessments(); fetchDropdowns(); }, []);

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

    // ── Question helpers ──────────────────────────────────────────────────────
    const addQuestion = () => setQuestions(q => [...q, EMPTY_QUESTION()]);
    const removeQuestion = (idx) => setQuestions(q => q.filter((_, i) => i !== idx));
    const updateQuestion = (idx, field, value) => setQuestions(q => {
        const copy = [...q];
        copy[idx] = { ...copy[idx], [field]: value };
        return copy;
    });
    const updateOption = (qIdx, optIdx, value) => setQuestions(q => {
        const copy = [...q];
        const opts = [...copy[qIdx].options];
        opts[optIdx] = value;
        copy[qIdx] = { ...copy[qIdx], options: opts };
        return copy;
    });

    const handleEdit = (item) => {
        setEditId(item.ID);
        setFormData({
            classID: item.ClassID, sectionID: item.SectionID || "",
            subjectID: item.SubjectID,
            title: item.Title, description: item.Description || "",
            assessmentType: item.AssessmentType,
            timeLimitMinutes: item.TimeLimitMinutes || "",
            cameraRestriction: !!item.CameraRestriction,
            totalMarks: String(item.TotalMarks),
            startDateTime: item.StartDateTime?.slice(0, 16) || "",
            endDateTime: item.EndDateTime?.slice(0, 16) || "",
            status: item.Status,
        });
        try {
            const qs = typeof item.Questions === 'string' ? JSON.parse(item.Questions) : (item.Questions || []);
            setQuestions(qs.length > 0 ? qs : [EMPTY_QUESTION()]);
        } catch { setQuestions([EMPTY_QUESTION()]); }
        setIsEditMode(true);
        setIsOpen(true);
    };

    const resetForm = () => {
        setFormData({ classID: "", sectionID: "", subjectID: "", title: "", description: "", assessmentType: "MCQ", timeLimitMinutes: "", cameraRestriction: false, totalMarks: "100", startDateTime: "", endDateTime: "", status: "draft" });
        setQuestions([EMPTY_QUESTION()]);
        setIsEditMode(false);
        setEditId(null);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        // Validate questions for MCQ
        if (formData.assessmentType === "MCQ") {
            for (const q of questions) {
                if (!q.text.trim()) return toast.error("All questions must have text");
                if (!q.correctAnswer.trim()) return toast.error("All MCQ questions must have a correct answer selected");
            }
        }
        setIsSubmitting(true);
        try {
            const payload = { ...formData, questions: formData.assessmentType === "MCQ" ? questions : questions.map(({ options, correctAnswer, ...rest }) => rest) };
            if (isEditMode) {
                await put(`/lms/assessments/${editId}`, payload);
                toast.success("Assessment updated");
            } else {
                await post("/lms/assessments", payload);
                toast.success("Assessment created");
            }
            setIsOpen(false);
            resetForm();
            fetchAssessments();
        } catch (err) {
            toast.error(err.response?.data || "Operation failed");
        } finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this assessment?")) return;
        try { await del(`/lms/assessments/${id}`); toast.success("Deleted"); fetchAssessments(); }
        catch { toast.error("Failed to delete"); }
    };

    const handleStatusToggle = async (item) => {
        const newStatus = item.Status === "active" ? "closed" : item.Status === "draft" ? "active" : "draft";
        try {
            await put(`/lms/assessments/${item.ID}`, { ...item, status: newStatus, questions: item.Questions });
            toast.success(`Status changed to ${newStatus}`);
            fetchAssessments();
        } catch { toast.error("Failed to update status"); }
    };

    const statusBadge = (s) => {
        const map = { draft: "badge-soft-secondary", active: "badge-soft-success", closed: "badge-soft-danger" };
        return <Badge label={s} className={`text-[11px] capitalize font-semibold px-2.5 ${map[s] || "badge-soft-secondary"}`} />;
    };

    const columns = useMemo(() => [
        {
            Header: "Assessment",
            Cell: ({ row: { original: r } }) => (
                <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{r.Title}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-slate-400">{r.SubjectName}</span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <Badge label={r.AssessmentType} className={`text-[10px] px-2 ${r.AssessmentType === "MCQ" ? "badge-soft-primary" : "badge-soft-warning"}`} />
                    </div>
                </div>
            ),
        },
        {
            Header: "Class",
            Cell: ({ row: { original: r } }) => (
                <div className="flex gap-1">
                    <Badge label={r.ClassName} className="badge-soft-primary text-[11px] font-semibold px-2.5" />
                    {r.SectionName && <Badge label={r.SectionName} className="badge-soft-secondary text-[11px] px-2" />}
                </div>
            ),
        },
        {
            Header: "Window",
            Cell: ({ row: { original: r } }) => (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                    {r.StartDateTime && <div><Icon icon="ph:play-bold" className="w-3 h-3 inline mr-1 text-success-500" />{new Date(r.StartDateTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</div>}
                    {r.EndDateTime   && <div><Icon icon="ph:stop-bold"  className="w-3 h-3 inline mr-1 text-danger-500" />{new Date(r.EndDateTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</div>}
                    {!r.StartDateTime && <span className="text-slate-300 dark:text-slate-700">—</span>}
                </div>
            ),
        },
        {
            Header: "Settings",
            Cell: ({ row: { original: r } }) => (
                <div className="flex items-center gap-2">
                    {r.TimeLimitMinutes && (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium">
                            <Icon icon="ph:timer-bold" className="w-3 h-3" />{r.TimeLimitMinutes}m
                        </span>
                    )}
                    {r.CameraRestriction ? (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-danger-50 dark:bg-danger-900/20 text-danger-600 px-2 py-0.5 rounded-md font-medium">
                            <Icon icon="ph:camera-bold" className="w-3 h-3" />Cam ON
                        </span>
                    ) : null}
                </div>
            ),
        },
        { Header: "Marks", accessor: "TotalMarks", Cell: ({ value }) => <span className="font-bold text-primary-500">{value}</span> },
        {
            Header: "Submissions",
            accessor: "SubmissionCount",
            Cell: ({ value }) => <Badge label={`${value} submitted`} className={`text-[11px] font-semibold px-2.5 ${value > 0 ? "badge-soft-success" : "badge-soft-warning"}`} />,
        },
        { Header: "Status", accessor: "Status", Cell: ({ value }) => statusBadge(value) },
        {
            Header: "Actions",
            Cell: ({ row }) => (
                <div className="flex gap-2">
                    <button onClick={() => handleEdit(row.original)} className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-500 hover:bg-primary-100 transition-colors" title="Edit">
                        <Icon icon="ph:pencil-bold" className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(row.original.ID)} className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-danger-500 transition-colors" title="Delete">
                        <Icon icon="ph:trash-bold" className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ], []);

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:exam-bold"
                title="Assessment Creator"
                description="Build MCQ and text-based assessments with timer and proctoring controls."
                buttonText="Create Assessment"
                onButtonClick={() => { resetForm(); setIsOpen(true); }}
            />

            {loading ? (
                <div className="card p-6 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-xl shadow-none"><SkeletonTable count={5} /></div>
            ) : (
                <div className="card border dark:border-[#2f3336] rounded-xl overflow-hidden bg-white dark:bg-[#111111] shadow-none">
                    <DataTable columns={columns} data={assessments} pageSize={10} />
                </div>
            )}

            {/* ── Assessment Form Modal ── */}
            <Modal
                title={isEditMode ? "Edit Assessment" : "Create Assessment"}
                activeModal={isOpen}
                onClose={() => { setIsOpen(false); resetForm(); }}
                className="max-w-3xl"
            >
                <form onSubmit={onSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <Select name="classID" label="Target Class" required options={classes}
                            value={classes.find(c => c.value === formData.classID) || null}
                            onChange={opt => setFormData(p => ({ ...p, classID: opt?.value || "", sectionID: "" }))}
                            placeholder="Select class..." icon="ph:chalkboard-bold" />
                        <Select name="sectionID" label="Section (Optional)" options={sections}
                            value={sections.find(s => s.value === formData.sectionID) || null}
                            onChange={opt => setFormData(p => ({ ...p, sectionID: opt?.value || "" }))}
                            placeholder="All sections" icon="ph:users-bold" />
                    </div>
                    <Select name="subjectID" label="Subject" required options={subjects}
                        value={subjects.find(s => s.value === formData.subjectID) || null}
                        onChange={opt => setFormData(p => ({ ...p, subjectID: opt?.value || "" }))}
                        placeholder="Select subject..." icon="ph:books-bold" />
                    <Textinput name="title" label="Assessment Title" placeholder="e.g. Mid-Term Quiz – Chapter 3" value={formData.title} onChange={handleChange} required icon="ph:article-medium-bold" />
                    <Textarea label="Instructions" placeholder="Enter instructions for students..." value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} row={2} />

                    {/* Type + Settings Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <Select name="assessmentType" label="Assessment Type" required
                            options={[{ value: "MCQ", label: "MCQ (Auto-graded)" }, { value: "Text", label: "Text (Manual grading)" }]}
                            value={{ value: formData.assessmentType, label: formData.assessmentType === "MCQ" ? "MCQ (Auto-graded)" : "Text (Manual grading)" }}
                            onChange={opt => setFormData(p => ({ ...p, assessmentType: opt?.value || "MCQ" }))}
                            icon="ph:list-checks-bold" />
                        <Textinput name="timeLimitMinutes" label="Time Limit (minutes)" type="number" min="1" placeholder="Leave blank for no limit" value={formData.timeLimitMinutes} onChange={handleChange} icon="ph:timer-bold" />
                    </div>

                    {/* Date Window + Marks */}
                    <div className="grid grid-cols-3 gap-4">
                        <Textinput name="startDateTime" label="Start" type="datetime-local" value={formData.startDateTime} onChange={handleChange} icon="ph:play-bold" />
                        <Textinput name="endDateTime"   label="End"   type="datetime-local" value={formData.endDateTime}   onChange={handleChange} icon="ph:stop-bold" />
                        <Textinput name="totalMarks" label="Total Marks" type="number" min="1" value={formData.totalMarks} onChange={handleChange} required icon="ph:star-bold" />
                    </div>

                    {/* Camera + Status */}
                    <div className="flex items-center justify-between p-4 rounded-xl border dark:border-[#2f3336] bg-slate-50 dark:bg-[#0d0d0d]">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-danger-50 dark:bg-danger-900/20 flex items-center justify-center">
                                <Icon icon="ph:camera-bold" className="w-4 h-4 text-danger-500" />
                            </div>
                            <div>
                                <div className="font-semibold text-sm text-slate-700 dark:text-slate-200">Camera Restriction</div>
                                <div className="text-[11px] text-slate-400">Students must verify camera before starting the exam</div>
                            </div>
                        </div>
                    <Switch
                            value={formData.cameraRestriction}
                            onChange={(e) => setFormData(p => ({ ...p, cameraRestriction: e.target.checked }))}
                        />
                    </div>

                    <Select name="status" label="Status"
                        options={[{ value: "draft", label: "Draft"}, { value: "active", label: "Active – visible to students"}, { value: "closed", label: "Closed" }]}
                        value={{ value: formData.status, label: formData.status === "draft" ? "Draft" : formData.status === "active" ? "Active – visible to students" : "Closed" }}
                        onChange={opt => setFormData(p => ({ ...p, status: opt?.value || "draft" }))}
                        icon="ph:toggle-right-bold" />

                    {/* ── Question Builder ───────────────────────────────────── */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider flex items-center gap-2">
                                <Icon icon="ph:question-bold" className="w-4 h-4 text-primary-500" />
                                Questions ({questions.length})
                            </h4>
                            <button type="button" onClick={addQuestion}
                                className="inline-flex items-center gap-1.5 text-[12px] text-primary-500 hover:text-primary-600 font-semibold bg-primary-50 dark:bg-primary-900/10 px-3 py-1.5 rounded-lg transition-colors">
                                <Icon icon="ph:plus-bold" className="w-3.5 h-3.5" /> Add Question
                            </button>
                        </div>

                        <div className="space-y-4">
                            {questions.map((q, qi) => (
                                <div key={qi} className="border dark:border-[#2f3336] rounded-xl p-4 bg-white dark:bg-[#0d0d0d] space-y-3">
                                    <div className="flex items-start gap-3">
                                        <span className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-500 text-[12px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                            {qi + 1}
                                        </span>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex gap-3">
                                                <div className="flex-1">
                                                    <Textinput
                                                        placeholder={`Question ${qi + 1}`}
                                                        value={q.text}
                                                        onChange={(e) => updateQuestion(qi, "text", e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="w-28">
                                                    <Textinput
                                                        placeholder="Marks"
                                                        type="number" min="0.5" step="0.5"
                                                        value={q.marks}
                                                        onChange={(e) => updateQuestion(qi, "marks", e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {formData.assessmentType === "MCQ" && (
                                                <div className="grid grid-cols-2 gap-2">
                                                    {q.options.map((opt, oi) => (
                                                        <div key={oi} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${q.correctAnswer === String(oi) ? "border-success-400 bg-success-50 dark:bg-success-900/20" : "border-slate-200 dark:border-slate-700 hover:border-primary-300"}`}
                                                            onClick={() => updateQuestion(qi, "correctAnswer", String(oi))}>
                                                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${q.correctAnswer === String(oi) ? "border-success-500 bg-success-500" : "border-slate-300 dark:border-slate-600"}`}>
                                                                {q.correctAnswer === String(oi) && <Icon icon="ph:check-bold" className="w-2.5 h-2.5 text-white" />}
                                                            </div>
                                                            <input
                                                                className="flex-1 text-[12px] bg-transparent outline-none text-slate-700 dark:text-slate-300"
                                                                placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                                                                value={opt}
                                                                onChange={(e) => { e.stopPropagation(); updateOption(qi, oi, e.target.value); }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {questions.length > 1 && (
                                            <button type="button" onClick={() => removeQuestion(qi)}
                                                className="p-1.5 text-slate-400 hover:text-danger-500 transition-colors flex-shrink-0">
                                                <Icon icon="ph:x-bold" className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t dark:border-slate-800">
                        <Button text="Cancel" disabled={isSubmitting} className="btn-light px-8 font-bold text-[11px] uppercase tracking-wider h-[44px] rounded-xl" onClick={() => { setIsOpen(false); resetForm(); }} />
                        <Button type="submit" disabled={isSubmitting} className="btn-primary px-10 font-bold text-[11px] uppercase tracking-wider h-[44px] rounded-xl"
                            text={isSubmitting ? "Saving..." : (isEditMode ? "Update Assessment" : "Save Assessment")} />
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default TeacherAssessments;
