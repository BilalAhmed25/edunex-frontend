import React, { useState, useEffect, useMemo } from "react";
import { get, post } from "@/lib/apiClient";
import { toast } from "react-toastify";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import SkeletonTable from "@/components/skeleton/Table";

const StaffAttendance = () => {
    const [staffList, setStaffList] = useState([]);
    const [attendanceData, setAttendanceData] = useState({}); // { staffID: { status } }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

    const statusOptions = [
        { label: "Present", value: "Present", color: "bg-success-500", text: "text-success-500" },
        { label: "Absent", value: "Absent", color: "bg-danger-500", text: "text-danger-500" },
        { label: "Late", value: "Late", color: "bg-warning-500", text: "text-warning-500" },
        { label: "Half Day", value: "Half Day", color: "bg-primary-500", text: "text-primary-500" },
    ];

    const fetchData = async () => {
        try {
            setLoading(true);
            const [staffRes, attRes] = await Promise.all([
                get("/users/staff"),
                get(`/activity/staff-attendance?date=${selectedDate}`)
            ]);

            setStaffList(staffRes.data || []);

            // Map existing attendance
            const attMap = {};
            (attRes.data || []).forEach(record => {
                attMap[record.StaffID] = { status: record.Status, remarks: record.Remarks };
            });

            // Default to null (Unmarked) for new ones if not specified
            const finalData = {};
            staffRes?.data?.forEach(s => {
                finalData[s.ID] = attMap[s.ID] || { status: null, remarks: "" };
            });

            setAttendanceData(finalData);
        } catch (err) {
            console.error("Staff attendance load error:", err);
            toast.error("Failed to load staff data: " + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const handleStatusChange = (staffID, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [staffID]: { ...prev[staffID], status }
        }));
    };

    const handleRemarksChange = (staffID, remarks) => {
        setAttendanceData(prev => ({
            ...prev,
            [staffID]: { ...prev[staffID], remarks }
        }));
    };

    const handleMarkAllPresent = () => {
        const newData = { ...attendanceData };
        staffList.forEach(s => {
            if (!newData[s.ID]?.status) {
                newData[s.ID] = { ...newData[s.ID], status: "Present" };
            }
        });
        setAttendanceData(newData);
        toast.info("All unmarked staff have been marked as Present.");
    };

    const handleSave = async () => {
        try {
            const keepers = Object.keys(attendanceData).filter(id => attendanceData[id].status !== null);
            if (keepers.length === 0) {
                return toast.warning("No attendance records to save.");
            }

            setSaving(true);
            const formattedData = keepers.map(staffID => ({
                staffID: parseInt(staffID),
                status: attendanceData[staffID].status,
                remarks: attendanceData[staffID].remarks
            }));

            await post("/activity/mark-staff-attendance", {
                date: selectedDate,
                attendanceData: formattedData
            });
            toast.success("Attendance saved successfully");
        } catch (err) {
            toast.error("Failed to save attendance");
        } finally {
            setSaving(false);
        }
    };

    const columns = useMemo(() => [
        {
            Header: "Staff Member",
            accessor: row => `${row.FirstName} ${row.LastName} ${row.EmployeeID}`,
            id: "staffName",
            Cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs uppercase overflow-hidden">
                        {row.original.Photo ? (
                            <img src={row.original.Photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                            `${row.original.FirstName?.charAt(0)}${row.original.LastName?.charAt(0)}`
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                            {row.original.FirstName} {row.original.LastName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                            {row.original.EmployeeID} • {row.original.Designation || "Staff"}
                        </div>
                    </div>
                </div>
            )
        },
        {
            Header: "Attendance Status",
            accessor: "status", // Virtual accessor for sorting if needed
            width: 400,
            Cell: ({ row }) => {
                const currentStatus = attendanceData[row.original.ID]?.status;
                return (
                    <div className="flex items-center gap-2">
                        {statusOptions.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => handleStatusChange(row.original.ID, opt.value)}
                                className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all border ${currentStatus === opt.value
                                    ? `${opt.color} border-transparent text-white shadow-lg shadow-${opt.color}/20`
                                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-300"
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                );
            }
        },
        {
            Header: "Remarks / Notes",
            accessor: "remarks",
            Cell: ({ row }) => (
                <div className="relative group w-full">
                    <input
                        type="text"
                        placeholder="Add optional note..."
                        value={attendanceData[row.original.ID]?.remarks || ""}
                        onChange={(e) => handleRemarksChange(row.original.ID, e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    />
                    <Icon icon="ph:note-pencil" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500" />
                </div>
            )
        }
    ], [attendanceData, staffList]);

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:users-three-bold"
                title="Staff Attendance"
                description="Monitor and mark daily attendance for all administrative and teaching staff."
            />

            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-[#111111] p-4 rounded-2xl border dark:border-[#2f3336] shadow-sm">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Select Attendance Date</label>
                        <div className="relative group">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all w-full md:w-64"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="hidden lg:flex items-center gap-4 px-6 border-x dark:border-slate-800 h-10">
                        <div className="text-center">
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{Object.values(attendanceData).filter(a => a.status === 'Present').length}</div>
                            <div className="text-[9px] text-success-500 font-bold uppercase tracking-widest">Present</div>
                        </div>
                        <div className="text-center border-l dark:border-slate-800 pl-4">
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{Object.values(attendanceData).filter(a => a.status === 'Absent').length}</div>
                            <div className="text-[9px] text-danger-500 font-bold uppercase tracking-widest">Absent</div>
                        </div>
                        <div className="text-center border-l dark:border-slate-800 pl-4">
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{Object.values(attendanceData).filter(a => a.status === 'Late').length}</div>
                            <div className="text-[9px] text-warning-500 font-bold uppercase tracking-widest">Late</div>
                        </div>
                        <div className="text-center border-l dark:border-slate-800 pl-4">
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{Object.values(attendanceData).filter(a => a.status === 'Half Day').length}</div>
                            <div className="text-[9px] text-primary-500 font-bold uppercase tracking-widest">Half Day</div>
                        </div>
                    </div>

                    <button
                        onClick={handleMarkAllPresent}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/5 px-6 py-2.5 rounded-lg text-sm transition-all"
                    >
                        <Icon icon="ph:check-all-bold" className="w-5 h-5" />
                        Mark All Present
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 text-white px-8 py-2.5 rounded-lg text-sm shadow-lg shadow-primary-500/25 transition-all active:scale-95"
                    >
                        {saving ? (
                            <Icon icon="ph:spinner-gap-bold" className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Icon icon="ph:check-circle-bold" className="w-5 h-5" />
                                Save Attendance
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="card p-6 border dark:border-[#2f3336] bg-white dark:bg-[#111111] rounded-2xl"><SkeletonTable count={8} /></div>
            ) : (
                <div className="overflow-hidden border dark:border-[#2f3336] rounded-2xl bg-white dark:bg-[#111111] shadow-sm">
                    <DataTable
                        columns={columns}
                        data={staffList}
                        searchPlaceholder="Search staff by name or ID..."
                    />
                </div>
            )}
        </div>
    );
};

export default StaffAttendance;
