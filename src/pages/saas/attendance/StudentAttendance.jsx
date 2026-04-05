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
import Checkbox from "@/components/ui/Checkbox";
import Tooltip from "@/components/ui/Tooltip";

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

    // Register Modal
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [registerData, setRegisterData] = useState([]);
    const [loadingRegister, setLoadingRegister] = useState(false);
    const [registerRange, setRegisterRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0]
    });

    const [selectedStudents, setSelectedStudents] = useState(new Set());

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
                    <Card title="Attendance Settings" className="border-t-4 border-primary-500 shadow-sm rounded-xl">
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
                                    className="bg-primary-500 text-white btn-sm w-full"
                                    onClick={() => handleMarkAll("Present")}
                                    disabled={loading || attendanceData.length === 0}
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Content Board */}
                <div className="lg:col-span-3 space-y-6">
                    {!filters.sectionID ? (
                        <div className="flex flex-col items-center justify-center p-20 text-center space-y-4 bg-white dark:bg-[#111111] rounded-xl border dark:border-[#2f3336]">
                            <Icon icon="ph:users-three-duotone" className="text-6xl text-primary-500/30" />
                            <div>
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Board Initialization</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">Please select Class and Section from the panel to initialize the student attendance ledger.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Live Statistics at the top */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
                                <div className="bg-white dark:bg-[#111111] p-4 rounded-xl border dark:border-[#2f3336] shadow-sm flex items-center space-x-3">
                                    <div className="h-10 w-10 flex items-center justify-center bg-blue-500/10 text-blue-500 rounded-lg">
                                        <Icon icon="ph:users-bold" className="text-xl" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">Total</div>
                                        <div className="text-xl font-black text-slate-800 dark:text-white">{attendanceData.length}</div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#111111] p-4 rounded-xl border dark:border-[#2f3336] shadow-sm flex items-center space-x-3 border-b-2 border-b-success-500">
                                    <div className="h-10 w-10 flex items-center justify-center bg-success-500/10 text-success-500 rounded-lg">
                                        <Icon icon="ph:user-circle-check-bold" className="text-xl" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">Present</div>
                                        <div className="text-xl font-black text-slate-800 dark:text-white">{attendanceData.filter(a => a.status === 'Present').length}</div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#111111] p-4 rounded-xl border dark:border-[#2f3336] shadow-sm flex items-center space-x-3 border-b-2 border-b-danger-500">
                                    <div className="h-10 w-10 flex items-center justify-center bg-danger-500/10 text-danger-500 rounded-lg">
                                        <Icon icon="ph:user-circle-minus-bold" className="text-xl" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">Absent</div>
                                        <div className="text-xl font-black text-slate-800 dark:text-white">{attendanceData.filter(a => a.status === 'Absent').length}</div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#111111] p-4 rounded-xl border dark:border-[#2f3336] shadow-sm flex items-center space-x-3 border-b-2 border-b-warning-500">
                                    <div className="h-10 w-10 flex items-center justify-center bg-warning-500/10 text-warning-500 rounded-lg">
                                        <Icon icon="ph:user-gear-bold" className="text-xl" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">Late / Leave</div>
                                        <div className="text-xl font-black text-slate-800 dark:text-white">{attendanceData.filter(a => a.status === 'Late' || a.status === 'Leave').length}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between px-2">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Student Attendance Ledger</h2>
                                    <p className="text-[12px] text-slate-400 font-semibold flex items-center gap-1.5">
                                        <Icon icon="ph:calendar-bold" className="text-lg" />
                                        {formatDate(filters.date)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        text="Attendance Register"
                                        icon="ph:book-open-bold"
                                        className="bg-slate-800 hover:bg-slate-900 text-white rounded transition-all"
                                        onClick={() => setIsRegisterModalOpen(true)}
                                    />
                                    <Button
                                        text={submitting ? "Synchronizing..." : "Submit Attendance"}
                                        isLoading={submitting}
                                        icon="ph:cloud-arrow-up-fill"
                                        className="bg-primary-500 hover:bg-primary-600 text-white px-8 rounded transition-all active:scale-95"
                                        disabled={loading || submitting || attendanceData.length === 0}
                                        onClick={markAttendance}
                                    />
                                </div>
                            </div>

                            {loading ? (
                                <SkeletonTable count={8} />
                            ) : attendanceData.length === 0 ? (
                                <div className="py-24 text-center bg-white dark:bg-[#111111] rounded-2xl border dark:border-slate-800 shadow-sm animate-fade-in">
                                    <div className="h-20 w-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border dark:border-slate-800">
                                        <Icon icon="ph:users-three-bold" className="text-4xl text-slate-300 dark:text-slate-700" />
                                    </div>
                                    <h3 className="text-slate-600 dark:text-slate-300 font-bold text-base mb-1">No student data found</h3>
                                    <p className="text-slate-400 dark:text-slate-500 text-xs max-w-[480px] mx-auto leading-relaxed">
                                        We couldn't find any students for the selected class and section. Please verify your filters or contact the administrator.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-[#111111] border dark:border-[#2f3336] rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[800px]">
                                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                                            <tr>
                                                <th className="p-4 w-12 border-b dark:border-slate-800">
                                                    <Checkbox
                                                        id="select-all"
                                                        value={selectedStudents.size === attendanceData.length && attendanceData.length > 0}
                                                        onChange={() => {
                                                            if (selectedStudents.size === attendanceData.length) {
                                                                setSelectedStudents(new Set());
                                                            } else {
                                                                setSelectedStudents(new Set(attendanceData.map(a => a.studentID)));
                                                            }
                                                        }}
                                                    />
                                                </th>
                                                <th className="p-4 text-[11px] font-black uppercase text-slate-400 border-b dark:border-slate-800">Student Info</th>
                                                <th className="p-4 text-[11px] font-black uppercase text-slate-400 border-b dark:border-slate-800 text-center">Roll #</th>
                                                <th className="p-4 text-[11px] font-black uppercase text-slate-400 border-b dark:border-slate-800 text-center">Admission #</th>
                                                <th className="p-4 text-[11px] font-black uppercase text-slate-400 border-b dark:border-slate-800 text-center">Status</th>
                                                <th className="p-4 text-[11px] font-black uppercase text-slate-400 border-b dark:border-slate-800">Remarks</th>
                                                <th className="p-4 text-[11px] font-black uppercase text-slate-400 border-b dark:border-slate-800 text-center">History</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendanceData.map((a) => (
                                                <tr key={a.studentID} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                                    <td className="p-4 border-b dark:border-slate-800">
                                                        <Checkbox
                                                            id={`student-${a.studentID}`}
                                                            value={selectedStudents.has(a.studentID)}
                                                            onChange={() => {
                                                                const next = new Set(selectedStudents);
                                                                if (next.has(a.studentID)) next.delete(a.studentID);
                                                                else next.add(a.studentID);
                                                                setSelectedStudents(next);
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="p-4 border-b dark:border-slate-800">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-primary-500 overflow-hidden border dark:border-slate-700">
                                                                {a.photo ? <img src={a.photo} className="h-full w-full object-cover" /> : (a.firstName[0] + a.lastName[0])}
                                                            </div>
                                                            <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{a.firstName} {a.lastName}</div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 border-b dark:border-slate-800 text-center font-mono text-xs text-slate-500 font-bold">{a.rollNumber}</td>
                                                    <td className="p-4 border-b dark:border-slate-800 text-center font-mono text-xs text-slate-500 font-bold">{a.admissionNumber}</td>
                                                    <td className="p-4 border-b dark:border-slate-800">
                                                        <div className="flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-900 rounded-lg max-w-[200px] mx-auto border dark:border-slate-800">
                                                            {statusOptions.map((opt) => (
                                                                <button
                                                                    key={opt.value}
                                                                    onClick={() => handleStatusChange(a.studentID, opt.value)}
                                                                    className={`flex-1 py-1 text-[9px] font-black uppercase transition-all rounded ${a.status === opt.value ? opt.className : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                                                >
                                                                    {opt.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 border-b dark:border-slate-800">
                                                        <input
                                                            type="text"
                                                            placeholder="Add remarks..."
                                                            className="w-full bg-transparent border-none text-[10px] text-slate-500 focus:outline-none focus:ring-0 placeholder:text-slate-400 placeholder"
                                                            value={a.remarks}
                                                            onChange={(e) => setAttendanceData(prev => prev.map(item => item.studentID === a.studentID ? { ...item, remarks: e.target.value } : item))}
                                                        />
                                                    </td>
                                                    <td className="p-4 border-b dark:border-slate-800 text-center">
                                                        <button onClick={() => fetchStudentHistory(a)} className="p-2 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all">
                                                            <Icon icon="ph:clock-counter-clockwise-fill" className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
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
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 flex items-center justify-center font-black text-xs ${log.Status === 'Present' ? 'bg-success-500/10 text-success-500 border border-success-500/20' :
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

            {/* Attendance Register Modal */}
            <Modal
                title="Class Attendance Register"
                activeModal={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                className="max-w-6xl"
            >
                <div className="space-y-6 py-2">
                    <div className="flex flex-wrap items-end gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border dark:border-slate-800">
                        <div className="flex-1 min-w-[150px]">
                            <Textinput
                                label="From"
                                type="date"
                                value={registerRange.startDate}
                                onChange={(e) => setRegisterRange(r => ({ ...r, startDate: e.target.value }))}
                            />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <Textinput
                                label="To"
                                type="date"
                                value={registerRange.endDate}
                                onChange={(e) => setRegisterRange(r => ({ ...r, endDate: e.target.value }))}
                            />
                        </div>
                        <Button
                            text="Load Register"
                            isLoading={loadingRegister}
                            icon="ph:database-bold"
                            className="bg-primary-500 hover:bg-primary-600 transition-all text-white rounded h-10 mb-1"
                            onClick={async () => {
                                try {
                                    setLoadingRegister(true);
                                    const params = new URLSearchParams({
                                        classID: filters.classID,
                                        sectionID: filters.sectionID,
                                        startDate: registerRange.startDate,
                                        endDate: registerRange.endDate
                                    });
                                    const res = await get(`/activity/attendance-register?${params.toString()}`);
                                    setRegisterData(res?.data || res || []);
                                } catch (err) {
                                    toast.error("Failed to fetch register data");
                                } finally {
                                    setLoadingRegister(false);
                                }
                            }}
                            disabled={loadingRegister || !filters.classID || !filters.sectionID}
                        />
                    </div>

                    {loadingRegister ? (
                        <div className="py-20 text-center">
                            <Icon icon="ph:spinner-gap-bold" className="text-4xl text-primary-500 animate-spin mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Processing Register Data...</p>
                        </div>
                    ) : registerData.length === 0 ? (
                        <div className="py-20 text-center opacity-40">
                            <Icon icon="ph:files-bold" className="text-6xl mx-auto mb-4" />
                            <p className="font-bold text-sm">No records found for selected period.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto border dark:border-slate-800 rounded-2xl">
                            <table className="w-full text-left border-collapse min-w-max text-xs">
                                <thead className="bg-slate-100 dark:bg-slate-900 text-[10px] font-black uppercase text-slate-500">
                                    <tr>
                                        <th className="p-4 border-b dark:border-slate-800 sticky left-0 bg-slate-100 dark:bg-slate-900 z-10 w-48 font-black">Student</th>
                                        {[...new Set(registerData.map(d => d.Date.split("T")[0]))].sort().map(d => (
                                            <th key={d} className="p-3 border-b border-l dark:border-slate-800 text-center min-w-[50px] font-black">{d.split("-")[2]}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.values(registerData.reduce((acc, curr) => {
                                        const sID = curr.StudentID;
                                        if (!acc[sID]) acc[sID] = { name: `${curr.FirstName} ${curr.LastName}`, roll: curr.RollNumber, attendance: {} };
                                        acc[sID].attendance[curr.Date.split("T")[0]] = curr.Status;
                                        return acc;
                                    }, {})).map((student, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4 border-b dark:border-slate-800 sticky left-0 bg-white dark:bg-[#111111] z-10 border-r dark:border-r-slate-800 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                                <div className="font-bold text-slate-700 dark:text-slate-200">{student.name}</div>
                                                <div className="text-[9px] text-slate-400 font-bold uppercase">Roll: {student.roll}</div>
                                            </td>
                                            {[...new Set(registerData.map(d => d.Date.split("T")[0]))].sort().map(d => {
                                                const status = student.attendance[d];
                                                return (
                                                    <td key={d} className="p-3 border-b border-l dark:border-slate-800 text-center">
                                                        {status === 'Present' ? <span className="text-success-500 font-black">P</span> :
                                                            status === 'Absent' ? <span className="text-danger-500 font-black">A</span> :
                                                                status === 'Late' ? <span className="text-warning-500 font-black">L</span> :
                                                                    status === 'Leave' ? <span className="text-info-500 font-black">LV</span> :
                                                                        <span className="text-slate-200 dark:text-slate-800">-</span>
                                                        }
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default StudentAttendance;
