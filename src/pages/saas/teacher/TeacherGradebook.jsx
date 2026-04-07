import React, { useState, useEffect, useMemo } from "react";
import { get, put } from "@/lib/apiClient";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Textinput from "@/components/ui/Textinput";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/ui/Modal";
import SkeletonTable from "@/components/skeleton/Table";
import DataTable from "@/components/ui/DataTable";

const ScoreBadge = ({ score, total }) => {
    if (score == null) return <span className="text-slate-300 dark:text-slate-700 text-[12px]">—</span>;
    const pct = (score / total) * 100;
    const cls = pct >= 80 ? "badge-soft-success" : pct >= 60 ? "badge-soft-warning" : "badge-soft-danger";
    return <Badge label={`${score} / ${total}`} className={`text-[12px] font-bold px-2.5 ${cls}`} />;
};

const TeacherGradebook = () => {
    const { user } = useSelector((s) => s.auth);

    const [tab, setTab] = useState("assignments"); // "assignments" | "assessments"

    const [assignments, setAssignments] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [loadingList, setLoadingList] = useState(true);

    const [selectedRecord, setSelectedRecord] = useState(null);
    const [gradebookData, setGradebookData] = useState(null);
    const [loadingGrade, setLoadingGrade] = useState(false);

    // Grade modal state
    const [gradeModal, setGradeModal] = useState(false);
    const [gradeTarget, setGradeTarget] = useState(null); // { studentRow, submission }
    const [gradeForm, setGradeForm] = useState({ marks: "", manualScore: "", feedback: "" });
    const [submitting, setSubmitting] = useState(false);

    const fetchLists = async () => {
        try {
            setLoadingList(true);
            const [asgRes, assRes] = await Promise.all([get("/lms/assignments"), get("/lms/assessments")]);
            setAssignments(asgRes.data || []);
            setAssessments(assRes.data || []);
        } catch { toast.error("Failed to load records"); }
        finally { setLoadingList(false); }
    };

    useEffect(() => { fetchLists(); }, []);

    const recordOptions = useMemo(() => {
        const list = tab === "assignments" ? assignments : assessments;
        return list.map(r => ({ value: r.ID, label: `${r.Title} — ${r.ClassName}${r.SectionName ? ` (${r.SectionName})` : ""}`, raw: r }));
    }, [tab, assignments, assessments]);

    const loadGradebook = async (record) => {
        if (!record) { setGradebookData(null); return; }
        try {
            setLoadingGrade(true);
            const res = await get(`/lms/gradebook?type=${tab === "assignments" ? "assignment" : "assessment"}&id=${record.value}`);
            setGradebookData(res.data);
        } catch { toast.error("Failed to load gradebook"); }
        finally { setLoadingGrade(false); }
    };

    const openGradeModal = (studentRow) => {
        setGradeTarget(studentRow);
        setGradeForm({
            marks: studentRow.submission?.Marks ?? "",
            manualScore: studentRow.submission?.ManualScore ?? "",
            feedback: studentRow.submission?.Feedback ?? "",
        });
        setGradeModal(true);
    };

    const saveGrade = async () => {
        if (!gradeTarget?.submission) return;
        setSubmitting(true);
        try {
            if (tab === "assignments") {
                await put(`/lms/submissions/${gradeTarget.submission.ID}/grade`, { marks: gradeForm.marks, feedback: gradeForm.feedback });
            } else {
                await put(`/lms/assessment-submissions/${gradeTarget.submission.ID}/grade`, { manualScore: gradeForm.manualScore, feedback: gradeForm.feedback });
            }
            toast.success("Grade saved");
            setGradeModal(false);
            loadGradebook(selectedRecord);
        } catch { toast.error("Failed to save grade"); }
        finally { setSubmitting(false); }
    };

    const publishOne = async (sub) => {
        try {
            if (tab === "assignments") await put(`/lms/submissions/${sub.ID}/publish`, {});
            else await put(`/lms/assessment-submissions/${sub.ID}/publish`, {});
            toast.success("Marks published to student");
            loadGradebook(selectedRecord);
        } catch { toast.error("Failed to publish"); }
    };

    const publishAll = async () => {
        if (!selectedRecord) return;
        if (!window.confirm("Publish all marks for this record to students?")) return;
        try {
            if (tab === "assignments") await put("/lms/submissions/publish-all", { assignmentID: selectedRecord.value });
            else await put("/lms/assessment-submissions/publish-all", { assessmentID: selectedRecord.value });
            toast.success("All marks published");
            loadGradebook(selectedRecord);
        } catch { toast.error("Failed to publish all"); }
    };

    const getScore = (sub) => {
        if (!sub) return null;
        if (tab === "assessments") return sub.ManualScore ?? sub.AutoScore;
        return sub.Marks;
    };

    const totalMarks = gradebookData?.record?.MaxMarks ?? gradebookData?.record?.TotalMarks ?? "—";
    const submitted = gradebookData?.rows?.filter(r => r.submission).length ?? 0;
    const graded = gradebookData?.rows?.filter(r => getScore(r.submission) != null).length ?? 0;
    const published = gradebookData?.rows?.filter(r => r.submission?.MarksPublished).length ?? 0;

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${day} ${month} ${year} ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
    };

    const columns = useMemo(() => [
        {
            Header: "Roll",
            accessor: "RollNumber",
        },
        {
            Header: "Student",
            accessor: "Name",
            Cell: ({ row }) => <span className="font-semibold text-slate-800 dark:text-slate-100">{row.original.Name}</span>
        },
        {
            Header: "Submission",
            Cell: ({ row }) => {
                const sub = row.original.submission;
                return sub ? (
                    <div className="space-y-0.5">
                        <Badge label="Submitted" className="badge-soft-success text-[10px] px-2" />
                        <div className="text-[10px] text-slate-400">{formatDate(sub.SubmittedAt)}</div>
                        {(sub.FileURL || sub.TextResponse) && (
                            sub.FileURL
                                ? <a href={sub.FileURL} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary-500 flex items-center gap-1"><Icon icon="ph:paperclip-bold" className="w-3 h-3" />View File</a>
                                : <span className="text-[10px] text-slate-400 line-clamp-1">{sub.TextResponse}</span>
                        )}
                    </div>
                ) : <Badge label="Not submitted" className="badge-soft-secondary text-[10px] px-2" />;
            }
        },
        {
            Header: "Score",
            Cell: ({ row }) => <ScoreBadge score={getScore(row.original.submission)} total={totalMarks} />
        },
        {
            Header: "Feedback",
            accessor: row => row.submission?.Feedback || "—",
            Cell: ({ value }) => <span className="text-[11px] text-slate-500 max-w-[150px] truncate block">{value}</span>
        },
        {
            Header: "Status",
            Cell: ({ row }) => {
                const sub = row.original.submission;
                if (!sub) return null;
                return sub.MarksPublished
                    ? <Badge label="Published" className="badge-soft-success text-[10px] px-2" />
                    : <Badge label="Pending" className="badge-soft-warning text-[10px] px-2" />;
            }
        },
        {
            Header: "Actions",
            Cell: ({ row }) => {
                const sub = row.original.submission;
                if (!sub) return null;
                const score = getScore(sub);
                return (
                    <div className="flex gap-2">
                        <button onClick={() => openGradeModal(row.original)}
                            className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-500 hover:bg-primary-100 transition-colors" title="Grade">
                            <Icon icon="ph:pencil-bold" className="w-3.5 h-3.5" />
                        </button>
                        {!sub.MarksPublished && score != null && (
                            <button onClick={() => publishOne(sub)}
                                className="p-1.5 rounded-lg bg-success-50 dark:bg-success-900/20 text-success-500 hover:bg-success-100 transition-colors" title="Publish marks">
                                <Icon icon="ph:paper-plane-tilt-bold" className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                );
            }
        }
    ], [gradebookData, tab, selectedRecord]);

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:chart-bar-bold"
                title="Gradebook"
                description="Review submissions, assign marks, and publish results to students."
            />

            {/* Tab Toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#1a1a1a] rounded-xl w-fit">
                {["assignments", "assessments"].map(t => (
                    <button key={t} onClick={() => { setTab(t); setSelectedRecord(null); setGradebookData(null); }}
                        className={`px-5 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wide transition-all ${tab === t ? "bg-white dark:bg-[#222] shadow-sm text-primary-600 dark:text-primary-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"}`}>
                        <Icon icon={t === "assignments" ? "ph:clipboard-text-bold" : "ph:exam-bold"} className="w-3.5 h-3.5 inline mr-1.5" />
                        {t === "assignments" ? "Assignments" : "Assessments"}
                    </button>
                ))}
            </div>

            {/* Record Selector */}
            <div className="card p-4 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-xl shadow-none">
                <div className="flex items-end gap-4">
                    <div className="flex-1">
                        <Select
                            label={`Select ${tab === "assignments" ? "Assignment" : "Assessment"}`}
                            options={recordOptions}
                            value={selectedRecord}
                            onChange={opt => { setSelectedRecord(opt); loadGradebook(opt); }}
                            placeholder={loadingList ? "Loading..." : `Choose a ${tab === "assignments" ? "assignment" : "assessment"}...`}
                            icon={tab === "assignments" ? "ph:clipboard-text-bold" : "ph:exam-bold"}
                        />
                    </div>
                    {gradebookData && (
                        <Button text="Publish All Marks" className="btn-primary h-[42px] px-6 font-bold text-[11px] uppercase tracking-wider rounded-xl flex items-center gap-2"
                            onClick={publishAll}>
                            <Icon icon="ph:paper-plane-tilt-bold" className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats */}
            {gradebookData && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-2">
                    {[
                        { label: "Total Students", value: gradebookData.rows?.length, icon: "ph:users-bold", color: "text-slate-500 bg-slate-100 dark:bg-slate-800" },
                        { label: "Submitted", value: submitted, icon: "ph:upload-simple-bold", color: "text-primary-500 bg-primary-50 dark:bg-primary-900/10" },
                        { label: "Graded", value: graded, icon: "ph:check-circle-bold", color: "text-success-500 bg-success-50 dark:bg-success-900/10" },
                        { label: "Published", value: published, icon: "ph:paper-plane-tilt-bold", color: "text-warning-500 bg-warning-50 dark:bg-warning-900/10" },
                    ].map(s => (
                        <div key={s.label} className="card p-4 flex-row items-center gap-3 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-xl shadow-none">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                                <Icon icon={s.icon} className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-xl font-bold text-slate-800 dark:text-white">{s.value}</div>
                                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Gradebook Table */}
            {loadingGrade ? (
                <div className="card p-6 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-xl shadow-none"><SkeletonTable count={6} /></div>
            ) : gradebookData ? (
                <DataTable
                    columns={columns}
                    data={gradebookData.rows || []}
                    pageSize={10}
                />
            ) : !loadingList && (
                <div className="card p-12 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-xl shadow-none flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Icon icon="ph:chart-bar-bold" className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 font-medium">Select an assignment or assessment above to view grades</div>
                </div>
            )}

            {/* Grade Modal */}
            <Modal title="Grade Submission" activeModal={gradeModal} onClose={() => setGradeModal(false)} className="max-w-lg">
                {gradeTarget && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#0d0d0d] rounded-xl border dark:border-[#2f3336]">
                            <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500 font-bold text-sm">{gradeTarget.RollNumber}</div>
                            <div>
                                <div className="font-semibold text-slate-800 dark:text-slate-100">{gradeTarget.Name}</div>
                                <div className="text-[11px] text-slate-400">{gradeTarget.AdmissionNumber}</div>
                            </div>
                        </div>

                        {gradeTarget.submission?.FileURL && (
                            <a href={gradeTarget.submission.FileURL} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 rounded-xl border dark:border-[#2f3336] text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors">
                                <Icon icon="ph:paperclip-bold" className="w-4 h-4" />
                                <span className="text-sm font-medium">View Submitted File</span>
                            </a>
                        )}
                        {gradeTarget.submission?.TextResponse && (
                            <div className="p-3 bg-slate-50 dark:bg-[#0d0d0d] rounded-xl border dark:border-[#2f3336]">
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Student Response</div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{gradeTarget.submission.TextResponse}</p>
                            </div>
                        )}
                        {gradeTarget.submission?.Answers && tab === "assessments" && (
                            <div className="p-3 bg-slate-50 dark:bg-[#0d0d0d] rounded-xl border dark:border-[#2f3336]">
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Submitted Answers (MCQ Auto-score: {gradeTarget.submission.AutoScore})</div>
                            </div>
                        )}

                        {tab === "assignments" ? (
                            <Textinput name="marks" label={`Marks (out of ${totalMarks})`} type="number" min="0" max={totalMarks} value={gradeForm.marks}
                                onChange={e => setGradeForm(p => ({ ...p, marks: e.target.value }))} icon="ph:star-bold" />
                        ) : (
                            gradebookData?.record?.AssessmentType === "Text" ? (
                                <Textinput name="manualScore" label={`Manual Score (out of ${totalMarks})`} type="number" min="0" max={totalMarks} value={gradeForm.manualScore}
                                    onChange={e => setGradeForm(p => ({ ...p, manualScore: e.target.value }))} icon="ph:star-bold" />
                            ) : (
                                <div className="p-3 bg-success-50 dark:bg-success-900/10 rounded-xl border border-success-100 dark:border-success-800/30 text-success-700 dark:text-success-400 text-sm font-medium">
                                    <Icon icon="ph:check-circle-bold" className="w-4 h-4 inline mr-2" />
                                    MCQ auto-score: {gradeTarget.submission.AutoScore} / {totalMarks}
                                </div>
                            )
                        )}
                        <Textarea label="Add feedback visible to the student..." value={gradeForm.feedback} onChange={e => setGradeForm(p => ({ ...p, feedback: e.target.value }))} row={3} className="w-100" />
                        <div className="pt-4 flex items-center justify-end gap-3 border-t dark:border-slate-800">
                            <Button text="Cancel" disabled={submitting} className="btn-light px-6 text-[11px] tracking-wider h-[42px] rounded-lg" onClick={() => setGradeModal(false)} />
                            <Button text={submitting ? "Saving..." : "Save Grade"} disabled={submitting} className="btn-primary px-8 text-[11px] tracking-wider h-[42px] rounded-lg" onClick={saveGrade} />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TeacherGradebook;
