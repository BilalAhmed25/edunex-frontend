import React, { useState, useEffect, useRef, useCallback } from "react";
import { get, post } from "@/lib/apiClient";
import { toast } from "react-toastify";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import SkeletonTable from "@/components/skeleton/Table";
import useCamera from "@/hooks/useCamera";

// ── Camera Check Modal ──────────────────────────────────────────────────────
const CameraCheckModal = ({ isOpen, onConfirm, onCancel, assessmentTitle }) => {
    const { stream, hasPermission, error, isLoading, requestCamera, stopCamera } = useCamera();
    const videoRef = useRef(null);

    useEffect(() => {
        if (isOpen) requestCamera();
        return () => stopCamera();
    }, [isOpen]);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const handleConfirm = () => {
        stopCamera();
        onConfirm();
    };

    const handleCancel = () => {
        stopCamera();
        onCancel();
    };

    return (
        <Modal title="Camera Verification Required" activeModal={isOpen} onClose={handleCancel} className="max-w-md">
            <div className="space-y-5">
                <div className="flex items-start gap-3 p-3 bg-danger-50 dark:bg-danger-900/10 rounded-xl border border-danger-100 dark:border-danger-800/30">
                    <Icon icon="ph:shield-warning-bold" className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
                    <div className="text-[13px] text-danger-700 dark:text-danger-400 leading-relaxed">
                        <strong className="block mb-0.5">Proctored Exam</strong>
                        This assessment requires your camera to be active. Your camera feed will be verified before you can proceed.
                    </div>
                </div>

                <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center">
                    {isLoading && (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                            <div className="w-8 h-8 border-2 border-slate-600 border-t-primary-500 rounded-full animate-spin" />
                            <span className="text-[12px]">Requesting camera access…</span>
                        </div>
                    )}
                    {error && !isLoading && (
                        <div className="flex flex-col items-center gap-3 px-6 text-center">
                            <Icon icon="ph:camera-slash-bold" className="w-10 h-10 text-danger-400" />
                            <p className="text-[12px] text-slate-400 leading-relaxed">{error}</p>
                            <button onClick={requestCamera}
                                className="text-[12px] text-primary-400 hover:text-primary-300 font-semibold underline">
                                Try again
                            </button>
                        </div>
                    )}
                    {stream && !error && (
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover rounded-xl" />
                    )}
                    {hasPermission && (
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-success-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            LIVE
                        </div>
                    )}
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t dark:border-slate-800">
                    <Button text="Cancel" className="btn-light px-6 font-bold text-[11px] uppercase tracking-wider h-[42px] rounded-xl" onClick={handleCancel} />
                    <Button
                        text={hasPermission ? "Camera OK – Start Exam" : "Waiting for camera…"}
                        disabled={!hasPermission}
                        className="btn-primary px-8 font-bold text-[11px] uppercase tracking-wider h-[42px] rounded-xl flex items-center gap-2"
                        onClick={handleConfirm}
                    />
                </div>
            </div>
        </Modal>
    );
};

// ── Exam Interface ──────────────────────────────────────────────────────────
const ExamInterface = ({ assessment, onSubmit, onClose }) => {
    const questions = (() => { try { return typeof assessment.Questions === 'string' ? JSON.parse(assessment.Questions) : (assessment.Questions || []); } catch { return []; } })();
    const [answers, setAnswers] = useState({});
    const [textAnswers, setTextAnswers] = useState({});
    const [current, setCurrent] = useState(0);
    const [timeLeft, setTimeLeft] = useState(assessment.TimeLimitMinutes ? assessment.TimeLimitMinutes * 60 : null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!timeLeft) return;
        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) { clearInterval(timer); handleSubmit(true); return 0; }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (s) => {
        const m = Math.floor(s / 60), sec = s % 60;
        return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    };

    const handleSubmit = useCallback(async (autoSubmit = false) => {
        if (!autoSubmit && !window.confirm("Submit exam? You cannot change your answers after submission.")) return;
        setSubmitting(true);
        const finalAnswers = assessment.AssessmentType === "MCQ"
            ? questions.map((_, qi) => ({ questionIndex: qi, answer: answers[qi] || "" }))
            : questions.map((_, qi) => ({ questionIndex: qi, answer: textAnswers[qi] || "" }));
        await onSubmit(finalAnswers);
        setSubmitting(false);
    }, [answers, textAnswers, questions]);

    const isText = assessment.AssessmentType === "Text";
    const answered = isText
        ? questions.filter((_, qi) => textAnswers[qi]?.trim()).length
        : questions.filter((_, qi) => answers[qi] !== undefined).length;

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
                <div>
                    <h1 className="font-bold text-white text-lg">{assessment.Title}</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <Badge label={assessment.SubjectName} className="badge-soft-primary text-[10px] px-2" />
                        <span className="text-[11px] text-slate-400">{answered} / {questions.length} answered</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {timeLeft !== null && (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${timeLeft < 300 ? "bg-danger-900/40 text-danger-400 border border-danger-700/50" : "bg-slate-800 text-slate-200"}`}>
                            <Icon icon="ph:timer-bold" className={`w-5 h-5 ${timeLeft < 300 ? "text-danger-400" : "text-slate-400"}`} />
                            {formatTime(timeLeft)}
                        </div>
                    )}
                    <Button
                        text={submitting ? "Submitting..." : "Submit Exam"}
                        disabled={submitting}
                        onClick={() => handleSubmit(false)}
                        className="btn-primary px-8 font-bold text-[12px] uppercase tracking-wider h-[44px] rounded-xl"
                    />
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Question Navigator (sidebar) */}
                <div className="w-64 border-r border-slate-800 bg-slate-900 p-4 overflow-y-auto flex-shrink-0">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Questions</div>
                    <div className="grid grid-cols-5 gap-1.5">
                        {questions.map((_, qi) => {
                            const isAns = isText ? !!textAnswers[qi]?.trim() : answers[qi] !== undefined;
                            const isCur = qi === current;
                            return (
                                <button key={qi} onClick={() => setCurrent(qi)}
                                    className={`w-full aspect-square rounded-lg text-[12px] font-bold transition-all ${isCur ? "bg-primary-500 text-white scale-105 shadow-lg shadow-primary-500/30" : isAns ? "bg-success-500/20 text-success-400 border border-success-500/30" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
                                    {qi + 1}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-4 space-y-2 text-[11px]">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-success-500/20 border border-success-500/30" /><span className="text-slate-400">Answered</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-slate-800" /><span className="text-slate-400">Not answered</span></div>
                    </div>
                </div>

                {/* Question Panel */}
                <div className="flex-1 overflow-y-auto p-8">
                    {questions.length === 0 ? (
                        <div className="text-center text-slate-500 mt-20">No questions found for this assessment.</div>
                    ) : (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary-500/20 text-primary-400 text-[13px] font-bold flex items-center justify-center">Q{current + 1}</div>
                                <span className="text-[12px] text-slate-500">{questions[current].marks} mark{questions[current].marks !== "1" ? "s" : ""}</span>
                            </div>
                            <p className="text-white text-lg font-medium leading-relaxed">{questions[current].text}</p>

                            {isText ? (
                                <textarea
                                    value={textAnswers[current] || ""}
                                    onChange={e => setTextAnswers(p => ({ ...p, [current]: e.target.value }))}
                                    placeholder="Write your answer here..."
                                    rows={6}
                                    className="w-full rounded-xl bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-600 px-4 py-3 text-[14px] outline-none focus:border-primary-500 transition-colors resize-none"
                                />
                            ) : (
                                <div className="space-y-3">
                                    {(questions[current].options || []).map((opt, oi) => (
                                        <button key={oi} type="button"
                                            onClick={() => setAnswers(p => ({ ...p, [current]: String(oi) }))}
                                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all ${answers[current] === String(oi) ? "border-primary-500 bg-primary-500/10 text-white" : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:bg-slate-800"}`}>
                                            <div className={`w-7 h-7 rounded-lg border-2 flex-shrink-0 flex items-center justify-center font-bold text-[12px] transition-all ${answers[current] === String(oi) ? "border-primary-500 bg-primary-500 text-white" : "border-slate-600 text-slate-500"}`}>
                                                {String.fromCharCode(65 + oi)}
                                            </div>
                                            <span className="text-[14px]">{opt}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Prev / Next */}
                            <div className="flex items-center justify-between pt-4">
                                <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                    <Icon icon="ph:arrow-left-bold" className="w-4 h-4" /> Previous
                                </button>
                                {current < questions.length - 1 ? (
                                    <button onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold bg-primary-500 hover:bg-primary-600 text-white transition-all">
                                        Next <Icon icon="ph:arrow-right-bold" className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button onClick={() => handleSubmit(false)} disabled={submitting}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold bg-success-500 hover:bg-success-600 text-white transition-all disabled:opacity-50">
                                        <Icon icon="ph:check-circle-bold" className="w-4 h-4" /> Finish & Submit
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Main Page ───────────────────────────────────────────────────────────────
const StudentAssessments = () => {
    const [assessments, setAssessments] = useState([]);
    const [mySubmissions, setMySubmissions] = useState({});
    const [loading, setLoading] = useState(true);

    // Camera gate
    const [cameraTarget, setCameraTarget] = useState(null);
    const [showCameraModal, setShowCameraModal] = useState(false);

    // Active exam
    const [activeExam, setActiveExam] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [submitResult, setSubmitResult] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await get("/lms/assessments");
            const list = res.data || [];
            setAssessments(list);

            const subMap = {};
            await Promise.all(list.map(async (a) => {
                try {
                    const s = await get(`/lms/my-assessment-submission?assessmentID=${a.ID}`);
                    if (s.data) subMap[a.ID] = s.data;
                } catch { /* not submitted */ }
            }));
            setMySubmissions(subMap);
        } catch { toast.error("Failed to load assessments"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleStart = (assessment) => {
        if (assessment.CameraRestriction) {
            setCameraTarget(assessment);
            setShowCameraModal(true);
        } else {
            setActiveExam(assessment);
        }
    };

    const handleCameraConfirm = () => {
        setShowCameraModal(false);
        setActiveExam(cameraTarget);
        setCameraTarget(null);
    };

    const handleExamSubmit = async (answers) => {
        try {
            const res = await post("/lms/assessment-submissions", { assessmentID: activeExam.ID, answers });
            setSubmitResult(res.data);
            setSubmitted(true);
            setActiveExam(null);
            toast.success("Exam submitted successfully!");
            fetchData();
        } catch (err) {
            toast.error(err.response?.data || "Submission failed");
        }
    };

    const getTimeStatus = (a) => {
        const now = new Date();
        const start = a.StartDateTime ? new Date(a.StartDateTime) : null;
        const end = a.EndDateTime ? new Date(a.EndDateTime) : null;
        if (end && now > end) return { label: "Closed", color: "badge-soft-secondary" };
        if (start && now < start) return { label: "Upcoming", color: "badge-soft-warning" };
        return { label: "Active", color: "badge-soft-success" };
    };

    if (activeExam) {
        return <ExamInterface assessment={activeExam} onSubmit={handleExamSubmit} onClose={() => setActiveExam(null)} />;
    }

    const formatDateTime = (d) => {
        const dt = new Date(d);
        const now = new Date();

        // Check if the date is in the past
        const isPast = dt < now;

        // Check if it's "Coming Up Soon" (e.g., within 1 hour)
        // Useful for showing a "Starting Soon" badge for Online MCQs
        const isSoon = !isPast && (dt - now) < 3600000;

        return {
            display: dt.toLocaleString([], {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            isPast,
            isSoon
        };
    };

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:exam-bold"
                title="Assessment Center"
                description="Take exams assigned by your teachers. Camera restrictions may apply."
            />

            {submitted && submitResult && (
                <div className="card p-5 border border-success-200 dark:border-success-800/30 bg-success-50 dark:bg-success-900/10 rounded-xl shadow-none flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-success-500 flex items-center justify-center flex-shrink-0">
                        <Icon icon="ph:check-bold" className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="font-bold text-success-700 dark:text-success-400">Exam submitted successfully!</div>
                        {submitResult.autoScore != null && (
                            <div className="text-[13px] text-success-600 dark:text-success-500 mt-0.5">
                                Auto-score: <strong>{submitResult.autoScore}</strong> marks (pending teacher review)
                            </div>
                        )}
                    </div>
                    <button onClick={() => { setSubmitted(false); setSubmitResult(null); }} className="ml-auto text-success-400 hover:text-success-600 transition-colors">
                        <Icon icon="ph:x-bold" className="w-4 h-4" />
                    </button>
                </div>
            )}

            {loading ? (
                <div className="card p-6 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-xl shadow-none"><SkeletonTable count={4} /></div>
            ) : assessments.length === 0 ? (
                <div className="card p-12 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-xl shadow-none flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Icon icon="ph:exam-bold" className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 font-medium">No active assessments at the moment</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {assessments.map(a => {
                        const sub = mySubmissions[a.ID];
                        const status = getTimeStatus(a);
                        const isActive = status.label === "Active";
                        return (
                            <div key={a.ID} className="card border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-xl shadow-none p-5 flex items-start gap-4 hover:border-primary-200 dark:hover:border-primary-800/50 transition-all">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${a.AssessmentType === "MCQ" ? "bg-primary-50 dark:bg-primary-900/20" : "bg-warning-50 dark:bg-warning-900/20"}`}>
                                    <Icon icon={a.AssessmentType === "MCQ" ? "ph:list-checks-bold" : "ph:pencil-line-bold"} className={`w-5 h-5 ${a.AssessmentType === "MCQ" ? "text-primary-500" : "text-warning-500"}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3 flex-wrap">
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">{a.Title}</h3>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <Badge label={a.SubjectName} className="badge-soft-primary text-[10px] font-semibold px-2" />
                                                <Badge label={a.AssessmentType} className={`text-[10px] px-2 ${a.AssessmentType === "MCQ" ? "badge-soft-primary" : "badge-soft-warning"}`} />
                                                <span className="text-[11px] text-slate-400">by {a.TeacherName}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {sub && <Badge label="Submitted" className="badge-soft-success text-[11px] font-semibold px-2.5" />}
                                            <Badge label={status.label} className={`text-[11px] font-semibold px-2.5 ${status.color}`} />
                                        </div>
                                    </div>
                                    {a.Description && <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-1">{a.Description}</p>}
                                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                                        <span className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
                                            <Icon icon="ph:star-bold" className="w-3.5 h-3.5 text-warning-400" /> {a.TotalMarks} marks
                                        </span>
                                        {a.TimeLimitMinutes && (
                                            <span className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
                                                <Icon icon="ph:timer-bold" className="w-3.5 h-3.5 text-primary-400" /> {a.TimeLimitMinutes} min
                                            </span>
                                        )}
                                        {a.CameraRestriction ? (
                                            <span className="flex items-center gap-1.5 text-[12px] text-danger-500 font-semibold">
                                                <Icon icon="ph:camera-bold" className="w-3.5 h-3.5" /> Camera required
                                            </span>
                                        ) : null}
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                                        {status.label === "Upcoming" && a.StartDateTime && (
                                            <span className="flex items-center gap-1.5 text-[12px] text-warning-600 dark:text-warning-400 font-bold">
                                                <Icon icon="ph:calendar-check-bold" className="w-3.5 h-3.5" /> Starts {formatDateTime(a.StartDateTime).display}
                                            </span>
                                        )}
                                        {a.EndDateTime && (
                                            <span className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
                                                <Icon icon="ph:clock-bold" className="w-3.5 h-3.5" /> Closes {formatDateTime(a.EndDateTime).display}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {!sub && isActive && (
                                    <button onClick={() => handleStart(a)}
                                        className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold bg-primary-500 hover:bg-primary-600 text-white shadow-sm shadow-primary-200 dark:shadow-primary-900/30 transition-all">
                                        {a.CameraRestriction && <Icon icon="ph:camera-bold" className="w-4 h-4" />}
                                        Start Exam
                                    </button>
                                )}
                                {sub && (
                                    <div className="flex-shrink-0 text-center">
                                        {sub.MarksPublished
                                            ? <div className="px-4 py-2 rounded-xl bg-success-50 dark:bg-success-900/10 text-success-600 dark:text-success-400 text-[13px] font-bold">
                                                Score: {sub.ManualScore ?? sub.AutoScore ?? "—"} / {a.TotalMarks}
                                            </div>
                                            : <div className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-[12px] font-medium">Awaiting results</div>}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Camera Check Modal */}
            <CameraCheckModal
                isOpen={showCameraModal}
                assessmentTitle={cameraTarget?.Title}
                onConfirm={handleCameraConfirm}
                onCancel={() => { setShowCameraModal(false); setCameraTarget(null); }}
            />
        </div>
    );
};

export default StudentAssessments;
