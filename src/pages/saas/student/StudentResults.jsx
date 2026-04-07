import React, { useState, useEffect, useMemo } from "react";
import { get } from "@/lib/apiClient";
import { toast } from "react-toastify";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import SkeletonTable from "@/components/skeleton/Table";

const ScoreCard = ({ score, total }) => {
    if (score == null || total == null) return <span className="text-slate-300 dark:text-slate-700 text-[13px]">—</span>;
    const pct = Math.round((score / total) * 100);
    const grade = pct >= 80 ? { label: "A", color: "from-success-500 to-emerald-400" }
        : pct >= 65 ? { label: "B", color: "from-primary-500 to-blue-400" }
            : pct >= 50 ? { label: "C", color: "from-warning-500 to-amber-400" }
                : { label: "F", color: "from-danger-500 to-red-400" };

    return (
        <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grade.color} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                {grade.label}
            </div>
            <div>
                <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">{score} <span className="font-normal text-slate-400 text-xs">/ {total}</span></div>
                <div className="text-[11px] text-slate-400">{pct}%</div>
            </div>
        </div>
    );
};

const StudentResults = () => {
    const [data, setData] = useState({ assignments: [], assessments: [] });
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("all");

    const fetchResults = async () => {
        try {
            setLoading(true);
            const res = await get("/lms/results");
            setData(res.data || { assignments: [], assessments: [] });
        } catch { toast.error("Failed to load results"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchResults(); }, []);

    const combined = useMemo(() => {
        const all = [
            ...data.assignments.map(a => ({ ...a, itemType: "assignment" })),
            ...data.assessments.map(a => ({ ...a, itemType: "assessment" })),
        ].sort((a, b) => new Date(b.SubmittedAt) - new Date(a.SubmittedAt));
        if (tab === "assignments") return all.filter(a => a.itemType === "assignment");
        if (tab === "assessments") return all.filter(a => a.itemType === "assessment");
        return all;
    }, [data, tab]);

    const stats = useMemo(() => {
        const scores = combined.filter(i => i.Score != null).map(i => ({ s: parseFloat(i.Score), t: parseFloat(i.TotalMarks) }));
        if (!scores.length) return { avg: null, best: null, count: combined.length };
        const avg = scores.reduce((s, i) => s + (i.s / i.t) * 100, 0) / scores.length;
        const best = Math.max(...scores.map(i => (i.s / i.t) * 100));
        return { avg: Math.round(avg), best: Math.round(best), count: combined.length };
    }, [combined]);

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:trophy-bold"
                title="Performance View"
                description="All your published marks and teacher feedback in one place."
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Results Published", value: stats.count, icon: "ph:list-checks-bold", color: "from-primary-500 to-blue-400" },
                    { label: "Average Score", value: stats.avg != null ? `${stats.avg}%` : "—", icon: "ph:chart-line-up-bold", color: "from-warning-500 to-amber-400" },
                    { label: "Best Score", value: stats.best != null ? `${stats.best}%` : "—", icon: "ph:trophy-bold", color: "from-success-500 to-emerald-400" },
                ].map(s => (
                    <div key={s.label} className="card p-4 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-xl shadow-none flex-row items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-sm`}>
                            <Icon icon={s.icon} className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-extrabold text-slate-800 dark:text-white">{s.value}</div>
                            <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tab Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#1a1a1a] rounded-xl w-full sm:w-fit overflow-x-auto">
                {[
                    { key: "all", label: "All Results" },
                    { key: "assignments", label: "Assignments" },
                    { key: "assessments", label: "Assessments" },
                ].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`px-5 py-2 rounded-lg text-[11px] sm:text-[12px] font-bold uppercase tracking-wide transition-all flex-1 sm:flex-none whitespace-nowrap ${tab === t.key ? "bg-white dark:bg-[#222] shadow-sm text-primary-600 dark:text-primary-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Results List */}
            {loading ? (
                <div className="card p-6 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-xl shadow-none"><SkeletonTable count={5} /></div>
            ) : combined.length === 0 ? (
                <div className="card p-12 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-xl shadow-none flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Icon icon="ph:trophy-bold" className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 font-medium">No published results yet</div>
                    <div className="text-slate-400 text-[13px]">Your teacher will publish marks once grading is complete</div>
                </div>
            ) : (
                <div className="card border dark:border-[#2f3336] rounded-xl overflow-hidden bg-white dark:bg-[#111111] shadow-none">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b dark:border-slate-800 bg-slate-50 dark:bg-[#0d0d0d]">
                                {["Type", "Title", "Subject", "Score", "Feedback", "Submitted On"].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {combined.map((item, i) => (
                                <tr key={i} className={`border-b dark:border-slate-800/60 ${i % 2 === 0 ? "" : "bg-slate-50/40 dark:bg-[#0d0d0d]/40"} hover:bg-primary-50/30 dark:hover:bg-primary-900/5 transition-colors`}>
                                    <td className="px-5 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${item.itemType === "assignment" ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400" : "bg-warning-50 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400"}`}>
                                            <Icon icon={item.itemType === "assignment" ? "ph:clipboard-text-bold" : "ph:exam-bold"} className="w-3 h-3" />
                                            {item.itemType === "assignment" ? "Assignment" : item.AssessmentType || "Assessment"}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100 max-w-[200px] truncate">{item.Title}</td>
                                    <td className="px-5 py-4">
                                        <Badge label={item.SubjectName} className="badge-soft-secondary text-[11px] px-2" />
                                    </td>
                                    <td className="px-5 py-4">
                                        <ScoreCard score={item.Score} total={item.TotalMarks} />
                                    </td>
                                    <td className="px-5 py-4 max-w-[200px]">
                                        {item.Feedback ? (
                                            <div className="flex items-start gap-1.5">
                                                <Icon icon="ph:chat-bold" className="w-3.5 h-3.5 text-primary-400 flex-shrink-0 mt-0.5" />
                                                <span className="text-[12px] text-slate-500 dark:text-slate-400 italic line-clamp-2">"{item.Feedback}"</span>
                                            </div>
                                        ) : <span className="text-slate-300 dark:text-slate-700 text-[12px]">—</span>}
                                    </td>
                                    <td className="px-5 py-4 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                        {new Date(item.SubmittedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StudentResults;
