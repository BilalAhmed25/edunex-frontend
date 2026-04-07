import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { get } from "@/lib/apiClient";
import { toast } from "react-toastify";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import SkeletonTable from "@/components/skeleton/Table";

const TeacherClasses = () => {
    const { user } = useSelector((state) => state.auth);
    const isAdmin = user?.RoleID === 2;
    const [schedule, setSchedule] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 1);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await get(`/lms/teacher-schedule${selectedStaff ? `?staffID=${selectedStaff}` : ""}`);
            setSchedule(res.data || []);

            if (isAdmin && staffList.length === 0) {
                const sRes = await get("/users/staff");
                setStaffList(sRes.data || []);
            }
        } catch { toast.error("Failed to load schedule"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [selectedStaff]);

    const dayMap = {
        1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday",
        5: "Friday", 6: "Saturday", 7: "Sunday"
    };

    const filteredSchedule = useMemo(() => {
        return schedule.filter(s => s.DayOfWeek === selectedDay);
    }, [schedule, selectedDay]);

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:calendar-bold"
                title={isAdmin ? "Institutional Schedule" : "My Teaching Schedule"}
                description={isAdmin ? "Monitor and manage academic sessions across all faculty members." : "Your upcoming classes and daily academic timeline."}
            />

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-end bg-white dark:bg-[#111111] border dark:border-[#2f3336] p-4 rounded-2xl">
                <div className="space-y-3 w-full md:w-auto">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Select Session Day</div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {[1, 2, 3, 4, 5, 6].map(d => (
                            <button
                                key={d}
                                onClick={() => setSelectedDay(d)}
                                className={`flex-shrink-0 px-5 py-2 rounded-lg text-[12px] font-semibold uppercase tracking-widest border transition-all ${selectedDay === d ? "bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20" : "bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 hover:bg-slate-100"}`}
                            >
                                {dayMap[d].substring(0, 3)}
                            </button>
                        ))}
                    </div>
                </div>

                {isAdmin && (
                    <div className="space-y-3 w-full md:w-64">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Faculty Member</div>
                        <select
                            value={selectedStaff}
                            onChange={(e) => setSelectedStaff(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-transparent rounded-lg text-[13px] px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        >
                            <option value="">All Teachers</option>
                            {staffList.map(s => (
                                <option key={s.ID} value={s.ID}>{s.FirstName} {s.LastName}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Schedule View */}
            {loading ? (
                <div className="card p-6 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-2xl"><SkeletonTable count={4} /></div>
            ) : filteredSchedule.length === 0 ? (
                <div className="card p-20 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-2xl flex flex-col items-center justify-center text-center opacity-30">
                    <Icon icon="ph:calendar-x-light" className="text-7xl mb-4" />
                    <h3 className="text-xl font-black uppercase tracking-widest">No Sessions Found</h3>
                    <p className="text-[13px] font-medium max-w-xs mx-auto mt-2">There are no classes scheduled for the selected day or faculty member.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSchedule.map((item, idx) => (
                        <div key={idx} className="group relative card p-6 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-2xl hover:border-primary-500/50 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300">
                            {/* Time Badge */}
                            <div className="absolute top-4 right-4 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                <span className="text-[11px] font-black text-slate-600 dark:text-slate-300">{item.StartTime?.substring(0, 5)} - {item.EndTime?.substring(0, 5)}</span>
                            </div>

                            <div className="space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${item.IsBreak ? "bg-amber-100 text-amber-600" : "bg-primary-50 dark:bg-primary-900/20 text-primary-500"}`}>
                                        <Icon icon={item.IsBreak ? "ph:coffee-bold" : "ph:folders-bold"} className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Subject</div>
                                        <h4 className="text-lg font-black text-slate-800 dark:text-white leading-tight">{item.SubjectName}</h4>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-slate-800">
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Class & Section</div>
                                        <div className="flex items-center gap-1.5">
                                            <Icon icon="ph:users-bold" className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{item.ClassName} - {item.SectionName || "All"}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Location</div>
                                        <div className="flex items-center gap-1.5">
                                            <Icon icon="ph:map-pin-bold" className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Room {item.RoomNo || "Main Hall"}</span>
                                        </div>
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div className="flex items-center gap-2 pt-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                            <Icon icon="ph:user-bold" className="w-3.5 h-3.5 text-slate-500" />
                                        </div>
                                        <span className="text-[12px] font-bold text-slate-500">Instructor: <span className="text-slate-700 dark:text-slate-300">{item.StaffName}</span></span>
                                    </div>
                                )}
                            </div>

                            {/* Hover Status */}
                            <div className="absolute bottom-0 left-6 right-6 h-1 w-0 bg-primary-500 transition-all duration-300 group-hover:w-[calc(100%-48px)] rounded-full" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeacherClasses;
