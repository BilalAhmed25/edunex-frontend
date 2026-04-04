import React, { useState, useEffect, useMemo } from "react";
import { get, post, del } from "@/lib/apiClient";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import { toast } from "react-toastify";
import SkeletonTable from "@/components/skeleton/Table";
import DataTable from "@/components/ui/DataTable";

const TeacherAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [staff, setStaff] = useState([]);

    const [formData, setFormData] = useState({
        staffID: null,
        classID: null,
        sectionID: null,
        subjectID: null,
    });

    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [assignRes, classRes, staffRes, subRes] = await Promise.all([
                get("/academic/assignments"),
                get("/academic/classes"),
                get("/users/staff"),
                get("/academic/subjects")
            ]);

            if (assignRes?.data) setAssignments(assignRes.data);
            if (classRes?.data) setClasses(classRes.data.map(c => ({ value: c.ID, label: c.Name, sections: c.sections })));
            if (staffRes?.data) setStaff(staffRes.data.map(s => ({ value: s.ID, label: `${s.FirstName} ${s.LastName} (${s.Designation || 'Staff'})` })));
            if (subRes?.data) setSubjects(subRes.data.map(s => ({ value: s.ID, label: `${s.Name} (${s.Code || 'No Code'})` })));
        } catch (err) {
            toast.error("Failed to load metadata");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleClassChange = (selected) => {
        setFormData({ ...formData, classID: selected, sectionID: null });
        const cls = classes.find(c => c.value === selected.value);
        let classSections = cls?.sections || [];
        if (typeof classSections === "string") {
            try { classSections = JSON.parse(classSections); } catch (e) { classSections = []; }
        }
        setSections(classSections && Array.isArray(classSections) ? classSections.map(s => ({ value: s.ID, label: s.Name })) : []);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!formData.staffID || !formData.classID || !formData.subjectID) {
            return toast.error("Please select Teacher, Class and Subject");
        }

        try {
            setSubmitting(true);
            await post("/academic/assignments", {
                staffID: formData.staffID.value,
                classID: formData.classID.value,
                sectionID: formData.sectionID?.value,
                subjectID: formData.subjectID.value
            });
            toast.success("Teacher assigned successfully");
            setFormData({ staffID: null, classID: null, sectionID: null, subjectID: null });
            fetchData();
        } catch (err) {
            toast.error("Assignment failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this assignment?")) return;
        try {
            await del(`/academic/assignments/${id}`);
            toast.success("Assignment removed");
            fetchData();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const columns = useMemo(() => [
        {
            Header: "Teacher",
            accessor: "StaffName",
            Cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-xs uppercase">
                        {row.original.StaffName ? row.original.StaffName.split(' ').map(n => n[0]).join('') : '?'}
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200 uppercase text-[12px]">{row.original.StaffName || 'N/A'}</span>
                </div>
            )
        },
        {
            Header: "Subject",
            accessor: "SubjectName",
            Cell: ({ value }) => <Badge label={value} className="badge-soft-primary px-3 py-1.5 font-bold uppercase text-[10px]" />
        },
        {
            Header: "Allocated Class",
            Cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-slate-600 dark:text-slate-300 uppercase">{row.original.ClassName}</span>
                    {row.original.SectionName && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Section: {row.original.SectionName}</span>}
                </div>
            )
        },
        {
            Header: "Actions",
            Cell: ({ row }) => (
                <button
                    onClick={() => handleDelete(row.original.ID)}
                    className="text-slate-400 hover:text-danger-500 transition-colors p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                    <Icon icon="ph:trash-bold" className="w-4 h-4" />
                </button>
            )
        }
    ], []);

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:users-four-bold"
                title="Teacher Assignments"
                description="Link specialized educators to subjects and specific classes/sections."
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <Card title="New Assignment" className="border dark:border-[#2f3336]">
                        <form onSubmit={onSubmit} className="space-y-4">
                            <Select
                                label="Select Teacher"
                                options={staff}
                                value={formData.staffID}
                                onChange={(val) => setFormData({ ...formData, staffID: val })}
                                placeholder="Choose teacher..."
                                icon="ph:user-bold"
                            />
                            <Select
                                label="Target Class"
                                options={classes}
                                value={formData.classID}
                                onChange={handleClassChange}
                                placeholder="Choose class..."
                                icon="ph:chalkboard-teacher-bold"
                            />
                            <Select
                                label="Section (Optional)"
                                options={sections}
                                value={formData.sectionID}
                                onChange={(val) => setFormData({ ...formData, sectionID: val })}
                                placeholder="All sections"
                                icon="ph:intersect-bold"
                                disabled={sections.length === 0}
                            />
                            <Select
                                label="Subject"
                                options={subjects}
                                value={formData.subjectID}
                                onChange={(val) => setFormData({ ...formData, subjectID: val })}
                                placeholder="Assign subject..."
                                icon="ph:book-open-bold"
                            />
                            <Button
                                type="submit"
                                text="Assign"
                                className="btn-primary w-full mt-4"
                                loading={submitting}
                            />
                        </form>
                    </Card>
                </div>

                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-[#111111] rounded-2xl border dark:border-[#2f3336] shadow-sm overflow-hidden min-h-[400px]">
                        {!loading ? (
                            <div className="p-10"><SkeletonTable count={6} /></div>
                        ) : (
                            <DataTable
                                columns={columns}
                                data={assignments}
                                pageSize={10}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Badge = ({ label, className }) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
        {label}
    </span>
);

export default TeacherAssignments;
