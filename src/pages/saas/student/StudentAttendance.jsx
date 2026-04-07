import React, { useState, useEffect, useMemo } from "react";
import { get } from "@/lib/apiClient";
import { toast } from "react-toastify";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import SkeletonTable from "@/components/skeleton/Table";
import DataTable from "@/components/ui/DataTable";

const CircularProgress = ({ pct, size = 120, strokeWidth = 10 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (pct / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-slate-100 dark:text-slate-800" />
                <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="text-primary-500 transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">{pct}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-tight">Present</span>
            </div>
        </div>
    );
};

const StudentAttendance = () => {
    const [data, setData] = useState({ attendance: [], summary: {} });
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const res = await get(`/lms/my-attendance?month=${selectedMonth}&year=${selectedYear}`);
            setData(res.data || { attendance: [], summary: {} });
        } catch { toast.error("Failed to load attendance"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAttendance(); }, [selectedMonth, selectedYear]);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentMonthData = useMemo(() => {
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        const grid = [];
        const attMap = {};
        data.attendance.forEach(a => {
            const d = new Date(a.Date).getDate();
            attMap[d] = a;
        });

        for (let i = 1; i <= daysInMonth; i++) {
            grid.push({ day: i, record: attMap[i] || null });
        }
        return grid;
    }, [data, selectedMonth, selectedYear]);

    const pct = data.summary.totalDays ? Math.round((data.summary.presentCount / data.summary.totalDays) * 100) : 0;

    const columns = [
        {
            Header: "Date",
            accessor: d => new Date(d.Date).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }),
        },
        {
            Header: "Day",
            Cell: ({ row }) => <span className="font-medium text-slate-500">{new Date(row.original.Date).toLocaleDateString([], { weekday: 'long' })}</span>
        },
        {
            Header: "Status",
            Cell: ({ row }) => (
                <Badge
                    label={row.original.Status}
                    className={row.original.Status === "Present" ? "badge-soft-success" : "badge-soft-danger"}
                />
            )
        },
        {
            Header: "Remarks",
            accessor: "Remarks",
            Cell: ({ value }) => <span className="text-slate-400 italic text-[12px]">{value || "—"}</span>
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:calendar-check-bold"
                title="Attendance Overview"
                description="Monitor your institutional presence and monthly attendance metrics."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Summary Card */}
                <div className="card p-6 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-2xl shadow-none flex flex-col items-center justify-center text-center space-y-6">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Attendance Health</div>
                    <CircularProgress pct={pct} />
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full pt-4 border-t dark:border-slate-800">
                        <div>
                            <div className="text-xl font-black text-slate-800 dark:text-white">{data.summary.presentCount || 0}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">Days Present</div>
                        </div>
                        <div>
                            <div className="text-xl font-black text-danger-500">{data.summary.absentCount || 0}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">Days Absent</div>
                        </div>
                    </div>
                </div>

                {/* Right: Monthly Grid & Selector */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-[#111111] border dark:border-[#2f3336] p-4 rounded-2xl">
                        <div className="flex items-center gap-2">
                            <Icon icon="ph:calendar-bold" className="text-primary-500 w-5 h-5" />
                            <h3 className="font-bold text-slate-800 dark:text-white">Monthly Tracker</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedMonth}
                                onChange={e => setSelectedMonth(Number(e.target.value))}
                                className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[12px] font-bold px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={e => setSelectedYear(Number(e.target.value))}
                                className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[12px] font-bold px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="card p-6 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-2xl shadow-none">
                        {loading ? <SkeletonTable count={3} /> : (
                            <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-10 gap-2">
                                {currentMonthData.map(d => (
                                    <div key={d.day} className="flex flex-col items-center gap-1 group">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-bold transition-all relative ${d.record
                                            ? d.record.Status === "Present"
                                                ? "bg-success-500 text-white shadow-sm shadow-success-200 dark:shadow-none"
                                                : "bg-danger-500 text-white shadow-sm shadow-danger-200 dark:shadow-none"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                            }`}>
                                            {d.day}
                                            {d.record && (
                                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center p-[1px]">
                                                    <div className={`w-full h-full rounded-full ${d.record.Status === "Present" ? "bg-success-500" : "bg-danger-500"}`} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-8 flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-success-500" /><span className="dark:text-slate-500">Present</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-danger-500" /><span className="dark:text-slate-500">Absent</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800" /><span className="dark:text-slate-500">No Record</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed History */}
            <div className="card p-0 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-2xl shadow-none overflow-hidden mt-6">
                <div className="p-3 px-4 border-b dark:border-[#2f3336] flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 dark:text-white">Detailed Attendance Log</h3>
                </div>
                {loading ? <div className="p-6"><SkeletonTable count={4} /></div> : (
                    <DataTable columns={columns} data={data.attendance || []} pageSize={5} />
                )}
            </div>
        </div>
    );
};

export default StudentAttendance;
