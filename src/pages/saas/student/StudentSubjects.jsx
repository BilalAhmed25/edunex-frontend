import React, { useState, useEffect, useMemo } from "react";
import { get } from "@/lib/apiClient";
import { toast } from "react-toastify";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import SkeletonTable from "@/components/skeleton/Table";

const StudentSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("subjects");
    const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 1); // 1 = Monday, 0 = Sunday (but system uses 1-7)

    const fetchData = async () => {
        try {
            setLoading(true);
            const [sRes, tRes] = await Promise.all([
                get("/lms/my-subjects"),
                get("/lms/my-timetable")
            ]);
            setSubjects(sRes.data || []);
            setTimetable(tRes.data || []);
        } catch { toast.error("Failed to load academic records"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const dayMap = {
        1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday",
        5: "Friday", 6: "Saturday", 7: "Sunday"
    };

    const filteredTimetable = useMemo(() => {
        return timetable.filter(t => t.DayOfWeek === selectedDay);
    }, [timetable, selectedDay]);

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:books-bold"
                title="Academic Hub"
                description="Your registered subjects and weekly lesson schedule."
            />

            {/* Tab Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#1a1a1a] rounded-xl w-fit">
                {[
                    { key: "subjects", label: "My Subjects", icon: "ph:book-open-bold" },
                    { key: "timetable", label: "Timetable", icon: "ph:calendar-bold" },
                ].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all ${tab === t.key ? "bg-white dark:bg-[#222] shadow-sm text-primary-600 dark:text-primary-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"}`}>
                        <Icon icon={t.icon} className="w-4 h-4" />
                        {t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="card p-6 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-2xl"><SkeletonTable count={5} /></div>
            ) : tab === "subjects" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.length === 0 ? (
                        <div className="col-span-full py-20 flex flex-col items-center opacity-40">
                            <Icon icon="ph:books-light" className="text-7xl mb-4" />
                            <div className="text-lg font-bold">No Subjects Assigned</div>
                        </div>
                    ) : subjects.map(s => (
                        <div key={s.ID} className="group relative card p-6 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-2xl hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300">
                            {/* Decorative Background Icon */}
                            <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Icon icon="ph:book-bookmark-fill" className="text-6xl text-primary-500" />
                            </div>

                            <div className="space-y-4">
                                <Badge label={s.Code || "SUB"} className="badge-soft-primary px-3 text-[10px]" />
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight mb-1">{s.Name}</h3>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                        <span className="text-[12px] font-bold uppercase tracking-wider">{s.Code ? `Code: ${s.Code}` : "Academic Core"}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <Icon icon="ph:user-bold" className="text-slate-400" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 leading-none mb-1">Instructor</div>
                                            <div className="text-[13px] font-black text-slate-700 dark:text-slate-200">{s.TeacherName || "Not Assigned"}</div>
                                        </div>
                                    </div>
                                    <button className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary-500 transition-colors">
                                        <Icon icon="ph:arrow-right-bold" className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Day Selector */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {[1, 2, 3, 4, 5, 6, 7].map(d => (
                            <button
                                key={d}
                                onClick={() => setSelectedDay(d)}
                                className={`flex-shrink-0 px-5 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest border transition-all ${selectedDay === d ? "bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20" : "bg-white dark:bg-[#111111] border-slate-200 dark:border-[#2f3336] text-slate-500 hover:border-slate-300"}`}
                            >
                                {dayMap[d].substring(0, 3)}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {filteredTimetable.length === 0 ? (
                            <div className="py-20 flex flex-col items-center opacity-30 text-center">
                                <Icon icon="ph:calendar-x-light" className="text-7xl mb-4" />
                                <div className="text-lg font-bold uppercase tracking-widest">No classes scheduled</div>
                                <div className="text-[13px] mt-1 font-medium italic">Enjoy your break!</div>
                            </div>
                        ) : filteredTimetable.map((item, idx) => (
                            <div key={idx} className="group relative flex flex-col md:flex-row md:items-center gap-4 p-5 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-2xl transition-all hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                                {/* Time Column */}
                                <div className="flex flex-row md:flex-col md:items-center md:justify-center md:w-32 md:border-r border-slate-100 dark:border-slate-800 md:pr-4">
                                    <div className="text-base font-black text-slate-800 dark:text-white">{item.StartTime?.substring(0, 5)}</div>
                                    <div className="mx-2 md:mx-0 md:my-1 text-slate-300 dark:text-slate-700">
                                        <Icon icon="ph:arrow-down-bold" className="hidden md:block" />
                                        <span className="md:hidden">—</span>
                                    </div>
                                    <div className="text-[13px] font-bold text-slate-400">{item.EndTime?.substring(0, 5)}</div>
                                </div>

                                {/* Class Info */}
                                <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Icon icon="ph:chalkboard-teacher-bold" className="text-primary-500 w-4 h-4" />
                                            <span className="text-[11px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">{item.SlotName || "Module Session"}</span>
                                        </div>
                                        <h4 className="text-lg font-black text-slate-800 dark:text-white leading-tight">{item.SubjectName}</h4>
                                        <p className="text-[13px] text-slate-400 mt-0.5">Instructor: {item.StaffName}</p>
                                    </div>

                                    {/* Action/Badge */}
                                    <div className="flex items-center gap-4">
                                        {item.IsBreak ? (
                                            <Badge label="B R E A K" className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black border-none px-4" />
                                        ) : (
                                            <div className="flex -space-x-2">
                                                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-[10px] font-bold text-primary-600">
                                                    {item.SubjectName?.charAt(0)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Status Dot */}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 group-hover:bg-primary-500 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentSubjects;
