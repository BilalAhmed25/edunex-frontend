import React, { useState, useEffect, useMemo } from "react";
import { get, post } from "@/lib/apiClient";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import DataTable from "@/components/ui/DataTable";
import SkeletonTable from "@/components/skeleton/Table";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import { toast } from "react-toastify";

const Promotions = () => {
    const [years, setYears] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState([]);

    const [source, setSource] = useState({ year: "", class: "", section: "" });
    const [target, setTarget] = useState({ year: "", class: "", section: "" });

    // Load Metadata
    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [yRes, cRes, sRes] = await Promise.all([
                    get("/academic/years"),
                    get("/academic/classes"),
                    get("/academic/sections")
                ]);
                setYears(yRes.data.map(y => ({ value: y.ID, label: y.Name, isActive: !!y.IsActive })));
                setClasses(cRes.data.map(c => ({ value: c.ID, label: c.Name })));
                setSections(sRes.data.map(s => ({ value: s.ID, label: s.Name, classID: s.ClassID })));

                // Auto-set current year if active
                const current = yRes.data.find(y => y.IsActive);
                if (current) setSource(prev => ({ ...prev, year: current.ID }));
            } catch (err) {
                toast.error("Failed to load metadata");
            }
        };
        fetchMeta();
    }, []);

    // Filter Sections based on Class
    const sourceSections = useMemo(() => sections.filter(s => s.classID === source.class), [sections, source.class]);
    const targetSections = useMemo(() => sections.filter(s => s.classID === target.class), [sections, target.class]);

    // Fetch Students based on Source Filters
    const fetchStudents = async () => {
        if (!source.year || !source.class) return;
        try {
            setLoading(true);
            const res = await get("/users/students");
            // Client-side filtering because our generic students API returns all
            const filtered = res.data.filter(s =>
                Number(s.AcademicYearID) === Number(source.year) &&
                Number(s.ClassID) === Number(source.class) &&
                (!source.section || Number(s.SectionID) === Number(source.section))
            );
            setStudents(filtered);
            setSelectedStudents([]); // Reset selection
        } catch (err) {
            toast.error("Failed to fetch students");
        } finally {
            setLoading(false);
        }
    };

    const columns = useMemo(() => [
        {
            Header: "Selection",
            id: "selection",
            Cell: ({ row }) => (
                <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                    checked={selectedStudents.includes(row.original.ID)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedStudents(prev => [...prev, row.original.ID]);
                        } else {
                            setSelectedStudents(prev => prev.filter(id => id !== row.original.ID));
                        }
                    }}
                />
            )
        },
        {
            Header: "Student Name",
            accessor: "name",
            Cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-primary-500 font-bold text-xs uppercase">
                        {row.original.FirstName?.charAt(0)}{row.original.LastName?.charAt(0)}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{row.original.FirstName} {row.original.LastName}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">GR NO: {row.original.AdmissionNumber}</div>
                    </div>
                </div>
            )
        },
        {
            Header: "Roll No",
            accessor: "RollNumber",
            Cell: ({ value }) => <span className="text-sm font-medium text-slate-500">{value}</span>
        },
        {
            Header: "Current Info",
            Cell: ({ row }) => (
                <div className="text-[11px] text-slate-400">
                    {row.original.ClassName} - {row.original.SectionName} ({row.original.AcademicYear})
                </div>
            )
        }
    ], [selectedStudents]);

    const handlePromote = async () => {
        if (selectedStudents.length === 0) return toast.warning("Select students to promote");
        if (!target.year || !target.class || !target.section) return toast.error("Please select complete target info");
        if (Number(source.year) === Number(target.year) && Number(source.class) === Number(target.class)) {
            if (!window.confirm("Source and Target class/session are exactly the same. Are you sure?")) return;
        }

        try {
            setSubmitting(true);
            await post("/users/students/bulk-promote", {
                studentIDs: selectedStudents,
                targetClassID: target.class,
                targetSectionID: target.section,
                targetYearID: target.year,
                notes: `Promoted from ${classes.find(c => c.value === source.class)?.label} to ${classes.find(c => c.value === target.class)?.label}`
            });
            toast.success(`${selectedStudents.length} Students Promoted Successfully!`);
            fetchStudents(); // Refresh list (they should disappear)
        } catch (err) {
            toast.error(err.response?.data || "Promotion Failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:arrow-fat-line-up-bold"
                title="Student Promotions"
                description="Batch promote students to the next academic session and class."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Source Selection */}
                <Card title="Source (Current Location)" className="border-t-4 border-slate-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select
                            label="Session"
                            options={years}
                            value={years.find(y => y.value === source.year)}
                            onChange={(s) => setSource(p => ({ ...p, year: s.value }))}
                            icon="ph:calendar-blank-bold"
                        />
                        <Select
                            label="Class"
                            options={classes}
                            value={classes.find(c => c.value === source.class)}
                            onChange={(s) => setSource(p => ({ ...p, class: s.value, section: "" }))}
                            icon="ph:chalkboard-bold"
                        />
                        <Select
                            label="Section"
                            options={sourceSections}
                            value={sourceSections.find(s => s.value === source.section)}
                            onChange={(s) => setSource(p => ({ ...p, section: s.value }))}
                            icon="ph:layout-bold"
                        />
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button
                            text="Load Students"
                            className="btn-outline-primary btn-sm px-6"
                            onClick={fetchStudents}
                            disabled={loading || !source.year || !source.class}
                        />
                    </div>
                </Card>

                {/* Target Selection */}
                <Card title="Target (Promotion Destination)" className="border-t-4 border-primary-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select
                            label="Target Session"
                            options={years}
                            value={years.find(y => y.value === target.year)}
                            onChange={(s) => setTarget(p => ({ ...p, year: s.value }))}
                            icon="ph:calendar-plus-bold"
                        />
                        <Select
                            label="Target Class"
                            options={classes}
                            value={classes.find(c => c.value === target.class)}
                            onChange={(s) => setTarget(p => ({ ...p, class: s.value, section: "" }))}
                            icon="ph:chalkboard-teacher-bold"
                        />
                        <Select
                            label="Target Section"
                            options={targetSections}
                            value={targetSections.find(s => s.value === target.section)}
                            onChange={(s) => setTarget(p => ({ ...p, section: s.value }))}
                            icon="ph:layout-bold"
                        />
                    </div>
                    <div className="mt-6 flex justify-end">
                        <div className="text-[10px] text-slate-400 font-medium italic">Ensure the next academic year is created first.</div>
                    </div>
                </Card>
            </div>

            {/* Student List */}
            <Card className="border dark:border-[#2f3336]">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Icon icon="ph:student-bold" className="text-primary-500" />
                            Eligible Students
                        </h3>
                        {students.length > 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 dark:bg-primary-500/10 rounded-full text-primary-600 text-xs font-bold uppercase tracking-wider">
                                {selectedStudents.length} / {students.length} Selected
                            </div>
                        )}
                    </div>
                    {students.length > 0 && (
                        <div className="flex items-center gap-3">
                            <Button
                                text="Select All"
                                className="btn-outline-secondary btn-sm"
                                onClick={() => setSelectedStudents(students.map(s => s.ID))}
                            />
                            <Button
                                text="Deselect All"
                                className="btn-outline-secondary btn-sm"
                                onClick={() => setSelectedStudents([])}
                            />
                            <Button
                                text={submitting ? "Processing..." : "Confirm Student Promotion"}
                                className="btn-primary btn-sm px-8"
                                icon="ph:rocket-launch-bold"
                                onClick={handlePromote}
                                disabled={submitting || selectedStudents.length === 0}
                            />
                        </div>
                    )}
                </div>

                {loading ? (
                    <SkeletonTable count={3} />
                ) : (
                    <DataTable
                        columns={columns}
                        data={students}
                        pageSize={students.length || 10}
                        className="pointer-events-auto"
                    />
                )}
                {!loading && students.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border-2 border-dashed">
                        <Icon icon="ph:magnifying-glass-duotone" className="w-12 h-12 opacity-20 mb-3" />
                        <p className="text-sm ">Select source filters and load students to begin promotion.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Promotions;
