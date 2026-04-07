import React, { useState, useEffect, useRef } from "react";
import { get, post } from "@/lib/apiClient";
import { toast } from "react-toastify";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import SkeletonTable from "@/components/skeleton/Table";

const StatusBadge = ({ dueDate, submission }) => {
    if (submission) {
        if (submission.MarksPublished && submission.Marks != null) {
            const pct = (submission.Marks / 100) * 100;
            return <Badge label={`Graded: ${submission.Marks}`} className={`text-[11px] font-bold px-2.5 ${pct >= 80 ? "badge-soft-success" : pct >= 60 ? "badge-soft-warning" : "badge-soft-danger"}`} />;
        }
        return <Badge label="Submitted" className="badge-soft-primary text-[11px] font-semibold px-2.5" />;
    }
    const isPast = new Date(dueDate) < new Date();
    return <Badge label={isPast ? "Overdue" : "Pending"} className={`text-[11px] font-semibold px-2.5 ${isPast ? "badge-soft-danger" : "badge-soft-warning"}`} />;
};

const StudentAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pending");

    const [submitModal, setSubmitModal] = useState(false);
    const [target, setTarget] = useState(null);
    const [fileInput, setFileInput] = useState(null);
    const [textResponse, setTextResponse] = useState("");
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await get("/lms/assignments");
            const list = res.data || [];
            setAssignments(list);

            // Fetch any existing submissions for each assignment
            const subMap = {};
            await Promise.all(list.map(async (a) => {
                try {
                    const s = await get(`/lms/my-submission?assignmentID=${a.ID}`);
                    if (s.data) subMap[a.ID] = s.data;
                } catch { /* no submission yet */ }
            }));
            setSubmissions(subMap);
        } catch { toast.error("Failed to load assignments"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const openSubmit = (assignment) => {
        setTarget(assignment);
        setTextResponse(submissions[assignment.ID]?.TextResponse || "");
        setFileInput(null);
        if (fileRef.current) fileRef.current.value = "";
        setSubmitModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setFileInput({ dataURL: ev.target.result, name: file.name });
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!fileInput && !textResponse.trim()) return toast.error("Please add a file or text response");
        setUploading(true);
        try {
            await post("/lms/submissions", {
                assignmentID: target.ID,
                fileURL: fileInput?.dataURL || null,
                textResponse: textResponse || null,
            });
            toast.success("Assignment submitted successfully");
            setSubmitModal(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data || "Submission failed");
        } finally { setUploading(false); }
    };

    const pending = assignments.filter(a => !submissions[a.ID]);
    const submitted = assignments.filter(a => submissions[a.ID]);
    const tabList = activeTab === "pending" ? pending : submitted;

    const formatDue = (d) => {
        const dt = new Date(d);
        const isPast = dt < new Date();
        return { text: dt.toLocaleString([], { dateStyle: "medium", timeStyle: "short" }), isPast };
    };

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:clipboard-text-bold"
                title="Assignment Hub"
                description="View and submit your teacher-assigned tasks."
            />

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#1a1a1a] rounded-xl w-fit">
                {[
                    { key: "pending", label: "Pending", count: pending.length, color: "text-warning-500" },
                    { key: "submitted", label: "Submitted", count: submitted.length, color: "text-success-500" },
                ].map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wide transition-all ${activeTab === t.key ? "bg-white dark:bg-[#222] shadow-sm text-primary-600 dark:text-primary-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"}`}>
                        {t.label}
                        <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${activeTab === t.key ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}>
                            {t.count}
                        </span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="card p-6 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-xl shadow-none"><SkeletonTable count={4} /></div>
            ) : tabList.length === 0 ? (
                <div className="card p-12 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-xl shadow-none flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Icon icon={activeTab === "pending" ? "ph:clipboard-text-bold" : "ph:check-circle-bold"} className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 font-medium">
                        {activeTab === "pending" ? "No pending assignments 🎉" : "No submitted assignments yet"}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {tabList.map(a => {
                        const due = formatDue(a.DueDate);
                        const sub = submissions[a.ID];
                        return (
                            <div key={a.ID} className="card border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-xl shadow-none p-5 flex items-start gap-4 hover:border-primary-200 dark:hover:border-primary-800/50 transition-all group">
                                <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                                    <Icon icon="ph:clipboard-text-bold" className="w-5 h-5 text-primary-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3 flex-wrap">
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">{a.Title}</h3>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <Badge label={a.SubjectName} className="badge-soft-primary text-[10px] font-semibold px-2" />
                                                <Badge label={a.ClassName} className="badge-soft-secondary text-[10px] px-2" />
                                                <span className="text-[11px] text-slate-400">by {a.TeacherName}</span>
                                            </div>
                                        </div>
                                        <StatusBadge dueDate={a.DueDate} submission={sub} />
                                    </div>
                                    {a.Description && <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{a.Description}</p>}
                                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                                        <span className={`flex items-center gap-1.5 text-[12px] font-medium ${due.isPast && !sub ? "text-danger-500" : "text-slate-500 dark:text-slate-400"}`}>
                                            <Icon icon="ph:clock-bold" className="w-3.5 h-3.5" /> Due: {due.text}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
                                            <Icon icon="ph:star-bold" className="w-3.5 h-3.5 text-warning-400" /> {a.MaxMarks} marks
                                        </span>
                                        {a.FileURL && (
                                            <a href={a.FileURL} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-[12px] text-primary-500 hover:text-primary-600 font-semibold">
                                                <Icon icon="ph:paperclip-bold" className="w-3.5 h-3.5" /> Download
                                            </a>
                                        )}
                                        {sub?.Feedback && (
                                            <div className="flex items-start gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 border-l dark:border-slate-700 pl-3 ml-1">
                                                <Icon icon="ph:chat-bold" className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-primary-400" />
                                                <span className="italic">"{sub.Feedback}"</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {(!sub || (sub.Marks == null && !sub.MarksPublished)) ? (
                                    <button
                                        onClick={() => openSubmit(a)}
                                        className={`flex-shrink-0 px-4 py-2 rounded-lg text-[12px] font-bold transition-all ${sub ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700" : "bg-primary-500 hover:bg-primary-600 text-white shadow-sm shadow-primary-200 dark:shadow-primary-900/30"}`}>
                                        {sub ? "Update" : "Submit"}
                                    </button>
                                ) : (
                                    <div className="flex-shrink-0 px-4 py-2 rounded-lg bg-success-50 dark:bg-success-900/10 text-success-600 dark:text-success-400 text-[12px] font-bold border border-success-100 dark:border-success-800/20">
                                        Graded
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Submit Modal */}
            <Modal title={`Submit: ${target?.Title}`} activeModal={submitModal} onClose={() => setSubmitModal(false)} className="max-w-lg">
                {target && (
                    <div className="space-y-5">
                        <div className="p-4 bg-slate-50 dark:bg-[#0d0d0d] rounded-xl border dark:border-[#2f3336] space-y-1.5 text-[13px]">
                            <div className="flex justify-between"><span className="text-slate-400">Subject</span><span className="font-semibold text-slate-700 dark:text-slate-200">{target.SubjectName}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Due</span><span className={`font-semibold ${new Date(target.DueDate) < new Date() ? "text-danger-500" : "text-slate-700 dark:text-slate-200"}`}>{new Date(target.DueDate).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Max Marks</span><span className="font-semibold text-slate-700 dark:text-slate-200">{target.MaxMarks}</span></div>
                        </div>

                        {/* File upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Upload File <span className="text-slate-400 font-normal">(PDF, image, doc)</span></label>
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:border-primary-400 transition-colors cursor-pointer"
                                onClick={() => fileRef.current?.click()}>
                                {fileInput ? (
                                    <div className="flex items-center justify-center gap-2 text-sm text-primary-600 dark:text-primary-400">
                                        <Icon icon="ph:file-bold" className="w-5 h-5" />
                                        <span className="font-medium">{fileInput.name}</span>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); setFileInput(null); if (fileRef.current) fileRef.current.value = ""; }}
                                            className="ml-2 text-danger-400 hover:text-danger-600">
                                            <Icon icon="ph:x-circle-bold" className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <Icon icon="ph:upload-simple-bold" className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                        <span className="text-[12px] text-slate-400">Click to upload</span>
                                    </div>
                                )}
                            </div>
                            <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileChange} />
                        </div>

                        <div className="flex items-center gap-3 text-slate-400 text-[12px]">
                            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />or write a response
                            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                        </div>

                        <Textarea label="Write your solution or answer here..." value={textResponse} className="w-100" onChange={e => setTextResponse(e.target.value)} row={4} />

                        <div className="pt-4 flex items-center justify-end gap-3 border-t dark:border-slate-800">
                            <Button text="Cancel" disabled={uploading} className="btn-light px-6 text-[11px] uppercase tracking-wider h-[42px] rounded-lg" onClick={() => setSubmitModal(false)} />
                            <Button text={uploading ? "Submitting..." : "Submit Assignment"} disabled={uploading} className="btn-primary px-8 text-[11px] uppercase tracking-wider h-[42px] rounded-lg" onClick={handleSubmit} />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default StudentAssignments;
