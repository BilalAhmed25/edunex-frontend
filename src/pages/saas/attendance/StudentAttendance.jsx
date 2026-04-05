import React, { useState, useEffect, useMemo } from "react";
import { get, post } from "@/lib/apiClient";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Textinput from "@/components/ui/Textinput";
import { toast } from "react-toastify";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import SkeletonTable from "@/components/skeleton/Table";
import { formatDate } from "@/lib/utils";
import Modal from "@/components/ui/Modal";

import { useSelector } from "react-redux";

const StudentAttendance = () => {
    const { user } = useSelector((state) => state.auth);
    const isAdmin = user?.RoleID <= 2;

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [attendanceData, setAttendanceData] = useState([]);

    // History Modal
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedStudentForHistory, setSelectedStudentForHistory] = useState(null);
    const [studentHistoryLog, setStudentHistoryLog] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Metadata & Permissions
    const [classes, setClasses] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [sections, setSections] = useState([]);
    const [myAssignments, setMyAssignments] = useState([]); // Array of {ClassID, SectionID}

    // Filters
    const [filters, setFilters] = useState({
        yearID: "",
        classID: "",
        sectionID: "",
        date: new Date().toISOString().split("T")[0]
    });

    const fetchMetadata = async () => {
        try {
            setLoading(true);
            const [clsRes, sessRes] = await Promise.all([
                get("/academic/classes"),
                get("/academic/years")
            ]);

            let fetchedClasses = clsRes?.data || [];
            let fetchedYears = sessRes?.data || [];

            setSessions(fetchedYears.map(s => ({ value: s.ID, label: s.Name })));

            // Role-based filtering
            if (!isAdmin) {
                // Fetch current user's profile to get StaffID
                const profileRes = await get("/users/profile");
                const staffID = profileRes?.StaffID;

                if (staffID) {
                    const assignRes = await get(`/academic/assignments?staffID=${staffID}`);
                    const assignments = assignRes?.data || [];
                    setMyAssignments(assignments);

                    const assignedClassIDs = new Set(assignments.map(a => a.ClassID));
                    fetchedClasses = fetchedClasses.filter(c => assignedClassIDs.has(c.ID));
                } else {
                    // No staff profile, no assignments
                    fetchedClasses = [];
                }
            }

            setClasses(fetchedClasses.map(c => ({ value: c.ID, label: c.Name, sections: c.sections })));
        } catch (err) {
            toast.error("Failed to load metadata");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetadata();
    }, []);

    const fetchStudentsAndAttendance = async () => {
        if (!filters.yearID || !filters.classID || !filters.sectionID) return;

        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                yearID: filters.yearID,
                classID: filters.classID,
                sectionID: filters.sectionID
            });

            // Get students and current attendance
            const [studentsRes, attendRes] = await Promise.all([
                get(`/users/students?${queryParams.toString()}`),
                get(`/activity/attendance?date=${filters.date}`)
            ]);

            const students = studentsRes?.data || [];
            const attendanceMap = {};

            // Handle both array and object response styles
            const attendData = attendRes?.data || attendRes || [];
            if (Array.isArray(attendData)) {
                attendData.forEach(a => {
                    attendanceMap[a.StudentID] = a;
                });
            }

            // Initialize local attendance data
            const initialData = students.map(s => {
                const sID = s.StudentID || s.ID;
                const existing = attendanceMap[sID];
                return {
                    studentID: sID,
                    firstName: s.FirstName,
                    lastName: s.LastName,
                    admissionNumber: s.AdmissionNumber,
                    rollNumber: s.RollNumber,
                    photo: s.Photo,
                    status: existing ? existing.Status : "Present",
                    remarks: existing ? existing.Remarks : ""
                };
            });

            setAttendanceData(initialData);
        } catch (err) {
            toast.error("Failed to load student attendance board");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentsAndAttendance();
    }, [filters]);

    const fetchStudentHistory = async (student) => {
        try {
            setLoadingHistory(true);
            setSelectedStudentForHistory(student);
            setIsHistoryModalOpen(true);
            const res = await get(`/activity/attendance?studentID=${student.studentID}`);
            setStudentHistoryLog(res?.data || res || []);
        } catch (err) {
            toast.error("Failed to load attendance history");
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleStatusChange = (studentID, status) => {
        setAttendanceData(prev => prev.map(a => a.studentID === studentID ? { ...a, status } : a));
    };

    const handleMarkAll = (status) => {
        setAttendanceData(prev => prev.map(a => ({ ...a, status })));
    };

    const markAttendance = async () => {
        try {
            setSubmitting(true);
            const payload = {
                date: filters.date,
                attendanceData: attendanceData.map(a => ({
                    studentID: a.studentID,
                    status: a.status,
                    remarks: a.remarks
                }))
            };
            await post("/activity/mark-attendance", payload);
            toast.success("Attendance synchronized successfully");
            fetchStudentsAndAttendance();
        } catch (err) {
            toast.error("Failed to save attendance");
        } finally {
            setSubmitting(false);
        }
    };

    const statusOptions = [
        { value: "Present", label: "P", className: "bg-success-500 text-white" },
        { value: "Absent", label: "A", className: "bg-danger-500 text-white" },
        { value: "Late", label: "L", className: "bg-warning-500 text-white" },
        { value: "Leave", label: "LV", className: "bg-info-500 text-white" }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:clipboard-text-bold"
                title="Student Attendance"
                description="Monitor daily presence, mark status for entire classes, and review historical attendance trends."
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filtration Controls */}
                <div className="lg:col-span-1 space-y-4">
                    <Card title="Attendance Settings" className="border-t-4 border-primary-500 shadow-sm rounded-3xl">
                        <div className="space-y-4">
                            <Select
                                label="Session"
                                options={sessions}
                                value={sessions.find(s => s.value === filters.yearID)}
                                onChange={(s) => setFilters(p => ({ ...p, yearID: s?.value || "" }))}
                                placeholder="Select session..."
                                icon="ph:calendar-bold"
                            />
                            <Select
                                label="Class"
                                options={classes}
                                value={classes.find(c => c.value === filters.classID)}
                                onChange={(s) => {
                                    setFilters(p => ({ ...p, classID: s?.value || "", sectionID: "" }));
                                    const cls = classes.find(c => c.value === s?.value);
                                    let classSections = cls?.sections ? (typeof cls.sections === 'string' ? JSON.parse(cls.sections) : cls.sections) : [];

                                    if (!isAdmin) {
                                        // Get sections specifically assigned for this ClassID
                                        const assignedSectionsForThisClass = myAssignments
                                            .filter(a => a.ClassID === s?.value)
                                            .map(a => a.SectionID);

                                        // If any assignment for this class has SectionID null, allow all sections. 
                                        // Otherwise, filter to only assigned section IDs.
                                        const hasAllSectionAccess = assignedSectionsForThisClass.includes(null);
                                        if (!hasAllSectionAccess) {
                                            const assignedSet = new Set(assignedSectionsForThisClass);
                                            classSections = classSections.filter(sec => assignedSet.has(sec.ID));
                                        }
                                    }

                                    setSections(classSections.map(sec => ({ value: sec.ID, label: sec.Name })));
                                }}
                                placeholder="Select class..."
                                icon="ph:chalkboard-bold"
                            />
                            <Select
                                label="Section"
                                options={sections}
                                value={sections.find(s => s.value === filters.sectionID)}
                                onChange={(s) => setFilters(p => ({ ...p, sectionID: s?.value || "" }))}
                                placeholder="Select section..."
                                icon="ph:layout-bold"
                            />
                            <Textinput
                                type="date"
                                label="Attendance Date"
                                value={filters.date}
                                onChange={(e) => setFilters(p => ({ ...p, date: e.target.value }))}
                                icon="ph:calendar-plus-bold"
                            />

                            <div className="pt-2 flex flex-col gap-2">
                                <Button
                                    text="Mark All Present"
                                    icon="ph:checks-bold"
                                    className="bg-primary-500 text-white btn-sm w-full font-bold shadow-lg shadow-primary-500/20"
                                    onClick={() => handleMarkAll("Present")}
                                    disabled={loading || attendanceData.length === 0}
                                />
                            </div>
                        </div>
                    </Card>

                    {attendanceData.length > 0 && (
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl animate-fade-in lg:block hidden">
                            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Live Statistics</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-success-500/10 rounded-2xl border border-success-500/20">
                                    <div className="text-xl font-black text-success-500">{attendanceData.filter(a => a.status === 'Present').length}</div>
                                    <div className="text-[8px] text-slate-400 font-bold uppercase">Present</div>
                                </div>
                                <div className="p-3 bg-danger-500/10 rounded-2xl border border-danger-500/20">
                                    <div className="text-xl font-black text-danger-500">{attendanceData.filter(a => a.status === 'Absent').length}</div>
                                    <div className="text-[8px] text-slate-400 font-bold uppercase">Absent</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content Board */}
                <div className="lg:col-span-3 space-y-6">
                    {!filters.sectionID ? (
                        <div className="flex flex-col items-center justify-center p-20 text-center space-y-4 bg-white dark:bg-[#111111] rounded-3xl border dark:border-[#2f3336]">
                            <Icon icon="ph:users-three-duotone" className="text-6xl text-primary-500/30" />
                            <div>
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Board Initialization</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">Please select Class and Section from the panel to initialize the student attendance ledger.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Daily Attendance Board</h2>
                                    <p className="text-[12px] text-slate-400 font-semibold flex items-center gap-1.5">
                                        <Icon icon="ph:calendar-bold" className="text-lg" />
                                        {formatDate(filters.date)}
                                    </p>
                                </div>
                                <Button
                                    text={submitting ? "Synchronizing..." : "Submit Attendance"}
                                    icon="ph:cloud-arrow-up-fill"
                                    className="bg-primary-500 hover:bg-primary-600 text-white px-8 rounded-xl font-bold tracking-wider shadow-xl shadow-primary-500/25 transition-all active:scale-95 disabled:grayscale"
                                    disabled={loading || submitting || attendanceData.length === 0}
                                    onClick={markAttendance}
                                />
                            </div>

                            {loading ? (
                                <SkeletonTable count={8} />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {attendanceData.map((a) => (
                                        <div key={a.studentID} className={`group p-4 bg-white dark:bg-[#111111] border dark:border-[#2f3336] rounded-3xl shadow-sm hover:shadow-md transition-all relative overflow-hidden ${a.status === 'Absent' ? 'border-l-4 border-l-danger-500' : a.status === 'Late' ? 'border-l-4 border-l-warning-500' : 'border-l-4 border-l-success-500'}`}>
                                            <div className="flex items-center space-x-4">
                                                <div
                                                    className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-primary-500 text-lg border dark:border-slate-700 shadow-inner cursor-pointer"
                                                    onClick={() => fetchStudentHistory(a)}
                                                >
                                                    {a.photo ? <img src={a.photo} className="h-full w-full object-cover rounded-2xl" alt="P" /> : (a.firstName[0] + a.lastName[0])}
                                                </div>
                                                <div className="flex-1 cursor-pointer" onClick={() => fetchStudentHistory(a)}>
                                                    <div className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase truncate">
                                                        {a.firstName} {a.lastName}
                                                    </div>
                                                    <div className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-1.5 mt-0.5">
                                                        <span>ROLL: {a.rollNumber}</span>
                                                        <span className="opacity-40">|</span>
                                                        <span className="text-primary-500">GR: {a.admissionNumber}</span>
                                                    </div>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => fetchStudentHistory(a)} className="p-1.5 rounded-lg bg-primary-50 text-primary-500 hover:bg-primary-500 hover:text-white transition-all">
                                                        <Icon icon="ph:clock-counter-clockwise-bold" className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Status Switcher */}
                                            <div className="mt-4 flex items-center justify-between p-1 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border dark:border-slate-700">
                                                {statusOptions.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => handleStatusChange(a.studentID, opt.value)}
                                                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all transform active:scale-90 ${a.status === opt.value ? opt.className + ' shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Attendance History Modal */}
            <Modal
                title={selectedStudentForHistory ? `Attendance History: ${selectedStudentForHistory.firstName} ${selectedStudentForHistory.lastName}` : "History"}
                activeModal={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                className="max-w-2xl"
            >
                <div className="space-y-6 py-2">
                    {loadingHistory ? (
                        <div className="py-10 text-center text-slate-400 font-bold uppercase animate-pulse">Retrieving Logs...</div>
                    ) : studentHistoryLog.length === 0 ? (
                        <div className="text-center py-10 opacity-40">
                            <Icon icon="ph:calendar-x" className="text-5xl mx-auto mb-2" />
                            <p className="text-xs">No attendance records found for this student.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {studentHistoryLog.map((log, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs ${log.Status === 'Present' ? 'bg-success-500/10 text-success-500 border border-success-500/20' :
                                            log.Status === 'Absent' ? 'bg-danger-500/10 text-danger-500 border border-danger-500/20' :
                                                log.Status === 'Late' ? 'bg-warning-500/10 text-warning-500 border border-warning-500/20' :
                                                    'bg-info-500/10 text-info-500 border border-info-500/20'
                                            }`}>
                                            {log.Status === 'Present' ? 'P' : log.Status === 'Absent' ? 'A' : log.Status === 'Late' ? 'L' : 'LV'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase">{formatDate(log.Date)}</div>
                                            <div className="text-[9px] text-slate-400 font-bold uppercase">{log.Remarks || "No Remarks"}</div>
                                        </div>
                                    </div>
                                    <Badge
                                        label={log.Status}
                                        className={log.Status === 'Present' ? "badge-soft-success" : log.Status === 'Absent' ? "badge-soft-danger" : "badge-soft-warning"}
                                    />
                                </div>
                            )).reverse()}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default StudentAttendance;
