import React, { useState, useEffect, useMemo } from "react";
import { get, post, del } from "@/lib/apiClient";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import { toast } from "react-toastify";
import Badge from "@/components/ui/Badge";

const TimetableManager = () => {
    const [timetable, setTimetable] = useState([]);
    const [slots, setSlots] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        classID: null,
        sectionID: null
    });

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selection, setSelection] = useState({
        dayOfWeek: null,
        slotID: null,
        assignmentID: null
    });

    const days = [
        { label: "Monday", value: 1 },
        { label: "Tuesday", value: 2 },
        { label: "Wednesday", value: 3 },
        { label: "Thursday", value: 4 },
        { label: "Friday", value: 5 },
        { label: "Saturday", value: 6 }
    ];

    const fetchData = async () => {
        try {
            setLoading(true);
            const [slotRes, classRes] = await Promise.all([
                get("/academic/timeslots"),
                get("/academic/classes")
            ]);
            if (slotRes?.data) setSlots(slotRes.data);
            if (classRes?.data) setClasses(classRes.data.map(c => ({ value: c.ID, label: c.Name, sections: c.sections })));
        } catch (err) {
            toast.error("Failed to load parameters");
        } finally {
            setLoading(false);
        }
    };

    const fetchTimetable = async () => {
        if (!filters.classID) return;
        try {
            const res = await get("/academic/timetable", {
                classID: filters.classID.value,
                sectionID: filters.sectionID?.value
            });
            if (res?.data) setTimetable(res.data);
            
            const assignRes = await get("/academic/assignments", {
                classID: filters.classID.value,
                sectionID: filters.sectionID?.value
            });
            if (assignRes?.data) setAssignments(assignRes.data.map(a => ({ 
                value: a.ID, 
                label: `${a.SubjectName} - ${a.StaffName}`,
                staffID: a.StaffID,
                subjectID: a.SubjectID
            })));
        } catch (err) {
            toast.error("Failed to load timetable");
        }
    };

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { fetchTimetable(); }, [filters]);

    const handleClassChange = (val) => {
        setFilters({ ...filters, classID: val, sectionID: null });
        const cls = classes.find(c => c.value === val.value);
        setSections(cls?.sections ? cls.sections.map(s => ({ value: s.ID, label: s.Name })) : []);
    };

    const handleCellClick = (day, slot) => {
        if (!filters.classID) return toast.warning("Please select a class first");
        if (slot.IsBreak) return;
        setSelection({ ...selection, dayOfWeek: day, slotID: slot });
        setIsAddOpen(true);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!selection.dayOfWeek || !selection.slotID || !selection.assignmentID) {
            return toast.error("Missing selection");
        }

        const assign = assignments.find(a => a.value === selection.assignmentID.value);

        try {
            setSubmitting(true);
            await post("/academic/timetable", {
                dayOfWeek: selection.dayOfWeek.value,
                slotID: selection.slotID.ID,
                staffID: assign.staffID,
                subjectID: assign.subjectID,
                classID: filters.classID.value,
                sectionID: filters.sectionID?.value
            });
            toast.success("Schedule updated");
            setIsAddOpen(false);
            setSelection({ dayOfWeek: null, slotID: null, assignmentID: null });
            fetchTimetable();
        } catch (err) {
            // Backend "Strict Block" message will be here
            toast.error(err.response?.data || "Schedule conflict or teacher unavailable");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this entry?")) return;
        try {
            await del(`/academic/timetable/${id}`);
            fetchTimetable();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const getEntry = (dayVal, slotID) => {
        return timetable.find(t => t.DayOfWeek === dayVal && t.SlotID === slotID);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:layout-bold"
                title="Weekly Timetable Manager"
                description="Coordinate classes, subjects, and teachers into a structured weekly schedule."
            />

            <Card className="border dark:border-[#2f3336]">
                <div className="flex flex-wrap gap-4 items-end mb-6 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl">
                    <div className="w-full md:w-64">
                        <Select
                            label="Target Class"
                            options={classes}
                            value={filters.classID}
                            onChange={handleClassChange}
                            placeholder="Choice class..."
                            icon="ph:users-bold"
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <Select
                            label="Section"
                            options={sections}
                            value={filters.sectionID}
                            onChange={(val) => setFilters({ ...filters, sectionID: val })}
                            placeholder="Select section"
                            icon="ph:stack-bold"
                            disabled={sections.length === 0}
                        />
                    </div>
                </div>

                {!filters.classID ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-[#16181c] rounded-2xl border-2 border-dashed dark:border-slate-800 opacity-60">
                        <Icon icon="ph:selection-all-bold" className="w-12 h-12 mb-3 text-primary-500" />
                        <p className="text-sm poppins font-bold uppercase tracking-widest">Select a class to view/manage schedule</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border dark:border-slate-800 shadow-sm">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-100 dark:bg-slate-800/80">
                                    <th className="p-4 text-left border-b dark:border-slate-700 min-w-[150px]">
                                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Timespace</div>
                                    </th>
                                    {days.map(day => (
                                        <th key={day.value} className="p-4 text-left border-b border-l dark:border-slate-700 dark:border-l-slate-700 min-w-[180px]">
                                            <div className="text-[12px] font-black uppercase text-slate-700 dark:text-slate-200 tracking-widest">{day.label}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {slots.map(slot => (
                                    <tr key={slot.ID} className={slot.IsBreak ? "bg-amber-50/30 dark:bg-amber-900/10" : ""}>
                                        <td className="p-4 border-b dark:border-slate-800">
                                            <div className="flex flex-col">
                                                <span className="text-[12px] font-black uppercase text-slate-800 dark:text-slate-200">{slot.SlotName}</span>
                                                <span className="text-[10px] font-bold text-slate-400 tracking-tight font-mono uppercase">
                                                    {slot.StartTime.substring(0, 5)} - {slot.EndTime.substring(0, 5)}
                                                </span>
                                            </div>
                                        </td>
                                        {days.map(day => {
                                            const entry = getEntry(day.value, slot.ID);
                                            return (
                                                <td 
                                                    key={`${day.value}-${slot.ID}`} 
                                                    className="p-3 border-b border-l dark:border-slate-800 dark:border-l-slate-800 relative group"
                                                >
                                                    {slot.IsBreak ? (
                                                        <div className="h-full flex items-center justify-center opacity-30 text-[10px] font-black uppercase tracking-widest italic">
                                                            <Icon icon="ph:coffee-bold" className="mr-1" /> Break
                                                        </div>
                                                    ) : entry ? (
                                                        <div className="bg-white dark:bg-slate-700/50 p-2.5 rounded-lg border dark:border-slate-600 shadow-sm relative overflow-hidden">
                                                            <div className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase truncate mb-1">
                                                                {entry.SubjectName}
                                                            </div>
                                                            <div className="text-[9px] font-bold text-slate-500 flex items-center gap-1 uppercase">
                                                                <Icon icon="ph:user-bold" className="w-2.5 h-2.5 text-primary-500" />
                                                                {entry.StaffName.split(' ')[0]}
                                                            </div>
                                                            <button 
                                                                onClick={() => handleDelete(entry.ID)}
                                                                className="absolute -top-1 -right-1 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-danger-500 hover:scale-110"
                                                            >
                                                                <Icon icon="ph:x-circle-fill" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleCellClick(day, slot)}
                                                            className="w-full h-12 rounded border-2 border-dashed border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-center group/btn"
                                                        >
                                                            <Icon icon="ph:plus-circle-bold" className="opacity-0 group-hover/btn:opacity-40 text-primary-500" />
                                                        </button>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <Modal
                title={`Assign Period: ${selection.dayOfWeek?.label} @ ${selection.slotID?.SlotName}`}
                activeModal={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                className="max-w-md"
            >
                <form onSubmit={onSubmit} className="space-y-4 py-2">
                    <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg border dark:border-primary-800 mb-2">
                        <div className="text-[10px] font-black uppercase text-primary-600 mb-1">Session Target</div>
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                             {filters.classID?.label} {filters.sectionID ? `(${filters.sectionID.label})` : ""}
                        </div>
                    </div>

                    <Select
                        label="Choose Subject & Teacher"
                        options={assignments}
                        value={selection.assignmentID}
                        onChange={(val) => setSelection({ ...selection, assignmentID: val })}
                        placeholder="Select allocation..."
                        icon="ph:book-bookmark-bold"
                    />

                    {assignments.length === 0 && (
                        <div className="text-[10px] text-danger-500 bg-danger-50 dark:bg-danger-900/10 p-2 rounded border border-danger-100 italic">
                            No teachers assigned to this class yet. Go to "Teacher Assignments" to link them first.
                        </div>
                    )}

                    <div className="pt-4 flex gap-2">
                        <Button type="button" text="Cancel" className="btn-light w-full" onClick={() => setIsAddOpen(false)} />
                        <Button type="submit" text="Save Entry" className="btn-primary w-full" loading={submitting} disabled={assignments.length === 0} />
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default TimetableManager;
