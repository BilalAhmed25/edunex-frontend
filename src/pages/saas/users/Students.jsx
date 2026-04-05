import React, { useState, useEffect, useMemo } from "react";
import { get, post, put, del } from "@/lib/apiClient";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";
import { toast } from "react-toastify";
import DataTable from "@/components/ui/DataTable";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import SkeletonTable from "@/components/skeleton/Table";

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isConcessionOpen, setIsConcessionOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Metadata
    const [classes, setClasses] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [sections, setSections] = useState([]);

    // Form States
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        admissionNumber: "",
        rollNumber: "",
        dob: "",
        gender: "",
        bloodGroup: "",
        admissionDate: new Date().toISOString().split('T')[0],
        religion: "",
        classID: "",
        sectionID: "",
        academicYearID: "",
        parentName: "",
        parentPhone: "",
        parentEmail: "",
        parentOccupation: "",
        parentRelation: "Father",
        address: "",
        phone: "",
        photo: null
    });

    const [concessionData, setConcessionData] = useState({ amount: "", notes: "" });
    const [filters, setFilters] = useState({ yearID: "", classID: "", sectionID: "" });
    const [filterSections, setFilterSections] = useState([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.yearID) queryParams.append("yearID", filters.yearID);
            if (filters.classID) queryParams.append("classID", filters.classID);
            if (filters.sectionID) queryParams.append("sectionID", filters.sectionID);

            const [stdRes, clsRes, sessRes] = await Promise.all([
                get(`/users/students?${queryParams.toString()}`),
                get("/academic/classes"),
                get("/academic/years")
            ]);
            if (stdRes?.data) setStudents(stdRes.data);
            if (clsRes?.data) setClasses(clsRes.data.map(c => ({ value: c.ID, label: c.Name, sections: c.sections })));
            if (sessRes?.data) setSessions(sessRes.data.map(s => ({ value: s.ID, label: s.Name })));
        } catch (err) {
            toast.error("Failed to load student data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [filters]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClassChange = (selected) => {
        setFormData(prev => ({ ...prev, classID: selected.value, sectionID: "" }));
        const classSections = selected.sections ? (typeof selected.sections === 'string' ? JSON.parse(selected.sections) : selected.sections) : [];
        setSections(classSections.map(s => ({ value: s.ID, label: s.Name })));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData(prev => ({ ...prev, photo: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        // Validation logic
        if (!formData.firstName?.trim()) return toast.error("First Name is required");
        if (!formData.lastName?.trim()) return toast.error("Last Name is required");
        if (!formData.academicYearID) return toast.error("Admission Year is required");
        if (!formData.classID) return toast.error("Target Class is required");
        if (!formData.sectionID) return toast.error("Target Section is required");
        if (!formData.parentName?.trim()) return toast.error("Guardian Name is required");
        if (!formData.parentPhone?.trim()) return toast.error("Guardian contact number is required");

        try {
            setSubmitting(true);
            if (isEditMode) {
                await put(`/users/students/${editId}`, formData);
                toast.success("Student profile updated");
            } else {
                await post("/users/students", formData);
                toast.success("Student admitted successfully");
            }
            setIsOpen(false);
            resetForm();
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const onConcessionSubmit = async (e) => {
        e.preventDefault();
        try {
            await put(`/users/students/${selectedStudent.ID}`, {
                concessionAmount: concessionData.amount,
                concessionNotes: concessionData.notes
            });
            toast.success("Concession updated");
            setIsConcessionOpen(false);
            fetchData();
        } catch (err) {
            toast.error("Failed to update concession");
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: "", lastName: "", email: "", password: "", admissionNumber: "", rollNumber: "",
            dob: "", gender: "", bloodGroup: "", admissionDate: new Date().toISOString().split('T')[0],
            religion: "", classID: "", sectionID: "", academicYearID: "",
            parentName: "", parentPhone: "", parentOccupation: "", parentRelation: "Father",
            address: "", phone: "", photo: null
        });
        setIsEditMode(false);
        setEditId(null);
    };

    const columns = useMemo(() => [
        {
            Header: "Student",
            accessor: "AdmissionNumber",
            Cell: ({ row }) => (
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden border dark:border-slate-600">
                        {row.original.Photo ? (
                            <img src={row.original.Photo} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center font-bold text-primary-500">
                                {row.original.FirstName[0]}{row.original.LastName[0]}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase">
                            {row.original.FirstName} {row.original.LastName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">
                            GR NO: {row.original.AdmissionNumber || "N/A"}
                        </div>
                    </div>
                </div>
            )
        },
        {
            Header: "Class & Section",
            accessor: "ClassName",
            Cell: ({ row }) => (
                <div>
                    <div className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                        {row.original.ClassName}
                    </div>
                    <div className="text-[11px] text-primary-500 font-bold uppercase">
                        Section: {row.original.SectionName || "None"}
                    </div>
                </div>
            )
        },
        {
            Header: "Guardian Details",
            accessor: "ParentName",
            Cell: ({ row }) => (
                <div>
                    <div className="text-[12px] font-medium text-slate-700 dark:text-slate-300">
                        {row.original.ParentName || "No Info"}
                    </div>
                    <div className="text-[11px] text-slate-400">
                        {row.original.ParentPhone || "---"}
                    </div>
                </div>
            )
        },
        {
            Header: "Concession",
            accessor: "ConcessionValue",
            Cell: ({ value, row }) => (
                <div onClick={() => { setSelectedStudent(row.original); setConcessionData({ amount: value || "", notes: "" }); setIsConcessionOpen(true); }} className="cursor-pointer group">
                    <div className="text-[13px] font-bold text-success-500 ">
                        PKR {value?.toLocaleString() || "0"}
                    </div>
                    <div className="text-[10px] text-slate-400 group-hover:underline">Update Concession</div>
                </div>
            )
        },
        {
            Header: "History",
            Cell: ({ row }) => (
                <button onClick={() => { setSelectedStudent(row.original); setIsHistoryOpen(true); }} className="text-primary-500 hover:text-primary-700 flex items-center gap-1 text-[11px] font-bold uppercase transition-all hover:scale-105 active:scale-95">
                    <Icon icon="ph:clock-counter-clockwise-bold" className="w-4 h-4" /> Academic
                </button>
            )
        },
        {
            Header: "Actions",
            Cell: ({ row }) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => {
                            const student = row.original;
                            setEditId(student.ID);
                            setFormData({
                                firstName: student.FirstName || "",
                                lastName: student.LastName || "",
                                dob: student.Dob ? student.Dob.split('T')[0] : "",
                                gender: student.Gender || "",
                                bloodGroup: student.BloodGroup || "",
                                admissionNumber: student.AdmissionNumber || "",
                                rollNumber: student.RollNumber || "",
                                admissionDate: student.AdmissionDate ? student.AdmissionDate.split('T')[0] : "",
                                religion: student.Religion || "",
                                classID: student.ClassID || "",
                                sectionID: student.SectionID || "",
                                academicYearID: student.AcademicYearID || "",
                                parentName: student.ParentName || "",
                                parentPhone: student.ParentPhone || "",
                                parentEmail: student.ParentEmail || "",
                                parentOccupation: student.ParentOccupation || "",
                                parentRelation: student.ParentRelation || "Father",
                                address: student.Address || "",
                                phone: student.Phone || "",
                                photo: student.Photo || null
                            });
                            setIsEditMode(true);
                            setIsOpen(true);
                        }}
                        className="text-slate-400 hover:text-primary-500 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg transition-transform hover:scale-110 active:scale-95"
                    >
                        <Icon icon="heroicons-outline:pencil-alt" className="w-5 h-5" />
                    </button>
                    <button
                        onClick={async () => {
                            if (window.confirm("Delete student?")) {
                                await del(`/users/students/${row.original.ID}`);
                                fetchData();
                            }
                        }}
                        className="text-slate-400 hover:text-danger-500 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg transition-transform hover:scale-110 active:scale-95"
                    >
                        <Icon icon="heroicons-outline:trash" className="w-5 h-5" />
                    </button>
                </div>
            )
        }
    ], [classes, sessions, sections]);

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:student-bold"
                title="Student Management"
                description="Manage admissions, view academic history, and oversee fee concessions for all students."
                buttonText="Admit New Student"
                onButtonClick={() => { resetForm(); setIsOpen(true); }}
            />

            {/* Academic Filter Bar */}
            <div className="bg-white dark:bg-[#111111] p-4 rounded-2xl border dark:border-[#2f3336] shadow-sm flex flex-wrap gap-3 items-center transition-all">
                <div className="flex-1 min-w-[180px]">
                    <Select options={sessions} value={sessions.find(s => s.value === filters.yearID)} onChange={(s) => setFilters(p => ({ ...p, yearID: s?.value || "" }))} isClearable label="Session" className="" icon="ph:calendar-blank-duotone" />
                </div>
                <div className="flex-1 min-w-[180px]">
                    <Select options={classes} value={classes.find(c => c.value === filters.classID)} onChange={(s) => {
                        setFilters(p => ({ ...p, classID: s?.value || "", sectionID: "" }));
                        if (s) {
                            const cls = classes.find(c => c.value === s.value);
                            const classSections = cls?.sections ? (typeof cls.sections === 'string' ? JSON.parse(cls.sections) : cls.sections) : [];
                            setFilterSections(classSections.map(sec => ({ value: sec.ID, label: sec.Name })));
                        } else {
                            setFilterSections([]);
                        }
                    }} isClearable label="Class" className="" icon="ph:chalkboard-duotone" />
                </div>
                <div className="flex-1 min-w-[180px]">
                    <Select options={filterSections} value={filterSections.find(s => s.value === filters.sectionID)} onChange={(s) => setFilters(p => ({ ...p, sectionID: s?.value || "" }))} isClearable label="Section" className="" icon="ph:layout-duotone" />
                </div>
                <Button
                    text="Reset"
                    icon="ph:arrow-counter-clockwise"
                    className="btn-outline-secondary btn-sm h-[38px] px-5  font-bold flex-shrink-0"
                    onClick={() => { setFilters({ yearID: "", classID: "", sectionID: "" }); setFilterSections([]); }}

                />
            </div>

            <div className="bg-white dark:bg-[#111111] rounded-2xl border dark:border-[#2f3336] shadow-sm overflow-hidden transition-all">
                {loading ? <SkeletonTable count={7} /> : (
                    <DataTable columns={columns} data={students} pageSize={10} className="" />
                )}
            </div>

            {/* Admission Modal */}
            <Modal
                title={isEditMode ? `Edit Student Profile: ${formData.firstName}` : "New Student Admission"}
                activeModal={isOpen}
                onClose={() => setIsOpen(false)}
                className="max-w-7xl overflow-hidden rounded-3xl"
            >
                <form onSubmit={onSubmit} className="space-y-8 p-1">
                    <div className="space-y-8">
                        {/* SECTION 1: PERSONAL DETAILS */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 pb-2 border-b dark:border-slate-700/50">
                                <div className="h-9 w-9 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                                    <Icon icon="ph:user-bold" className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest">Personal Journey</h4>
                                    <p className="text-[10px] text-slate-400 font-medium">Official identity and demographic information of the student.</p>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* PHOTO UPLOAD - Auto Width */}
                                <div className="flex-shrink-0">
                                    <div className="flex flex-col items-center">
                                        <div className="h-32 w-28 rounded-xl border-2 border-white dark:border-slate-700 shadow-lg overflow-hidden relative group transition-transform hover:scale-105 active:scale-95 cursor-pointer bg-slate-200 dark:bg-slate-700">
                                            {formData.photo ? (
                                                <img src={formData.photo} alt="Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-[8px] text-center px-2 font-bold uppercase">
                                                    <Icon icon="ph:user-circle-plus-duotone" className="w-10 h-10 mb-1 opacity-50" />
                                                    Upload Photo
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer" title="Upload passport size photo" />
                                        </div>
                                    </div>
                                </div>

                                {/* FORM FIELDS - Grow to fill */}
                                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
                                    <Textinput name="firstName" label="First Name" placeholder="Student's legal first name" value={formData.firstName} onChange={handleChange} required className="" icon="ph:user-bold" />
                                    <Textinput name="lastName" label="Last Name" placeholder="Legal last name" value={formData.lastName} onChange={handleChange} required className="" icon="ph:user-bold" />
                                    <Textinput type="date" name="dob" label="Date of Birth" value={formData.dob} onChange={handleChange} className="" icon="ph:calendar-bold" />
                                    <Select label="Gender" options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]} value={formData.gender ? { value: formData.gender, label: formData.gender } : null} onChange={(s) => setFormData(p => ({ ...p, gender: s.value }))} className="" icon="ph:gender-intersex-bold" />
                                    <Select label="Blood Group" options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => ({ value: b, label: b }))} value={formData.bloodGroup ? { value: formData.bloodGroup, label: formData.bloodGroup } : null} onChange={(s) => setFormData(p => ({ ...p, bloodGroup: s.value }))} className="" icon="ph:drop-bold" />
                                    <Textinput name="phone" label="Contact (Personal)" placeholder="Personal contact if any" value={formData.phone} onChange={handleChange} className="" icon="ph:phone-bold" />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: ACADEMIC ASSIGNMENT */}
                        <div className="space-y-4 bg-slate-50/50 dark:bg-slate-800/10 p-6 rounded-3xl border dark:border-slate-700/50">
                            <div className="flex items-center space-x-3 pb-2">
                                <div className="h-9 w-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                    <Icon icon="ph:chalkboard-teacher-bold" className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest">Academic Mapping</h4>
                                    <p className="text-[10px] text-slate-400 font-medium">Assignment to current academic session and class structure.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3 pt-2">
                                <Select label="Admission Year" options={sessions} value={sessions.find(s => s.value === formData.academicYearID)} onChange={(s) => setFormData(p => ({ ...p, academicYearID: s.value }))} className="" icon="ph:calendar-bold" />
                                <Select label="Target Class" options={classes} value={classes.find(c => c.value === formData.classID)} onChange={handleClassChange} className="" icon="ph:chalkboard-bold" />
                                <Select label="Section" options={sections} value={sections.find(s => s.value === formData.sectionID)} onChange={(s) => setFormData(p => ({ ...p, sectionID: s.value }))} className="" icon="ph:layout-bold" />
                                <Textinput name="admissionNumber" label="Admission No" placeholder="Manual override if required" value={formData.admissionNumber} onChange={handleChange} className=" text-primary-500" icon="ph:identification-card-bold" />
                                <Textinput name="rollNumber" label="Roll Number" placeholder="Auto-suggested" value={formData.rollNumber} onChange={handleChange} className="" icon="ph:hash-bold" />
                                <Textinput type="date" name="admissionDate" label="Admission Date" value={formData.admissionDate} onChange={handleChange} className="" icon="ph:calendar-plus-bold" />
                            </div>
                        </div>

                        {/* SECTION 3: GUARDIAN & CONTACT INFO */}
                        <div className="space-y-4 lg:pb-6">
                            <div className="flex items-center space-x-3 pb-2 border-b dark:border-slate-700/50">
                                <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                    <Icon icon="ph:users-three-bold" className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest">Guardian & Governance</h4>
                                    <p className="text-[10px] text-slate-400 font-medium">Primary contact for emergency and regular communications.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
                                <Textinput name="parentName" label="Guardian Name" placeholder="Full name as per ID card" value={formData.parentName} onChange={handleChange} required className="" icon="ph:user-circle-gear-bold" />
                                <Select label="Relation" options={['Father', 'Mother', 'Brother', 'Sister', 'Uncle', 'Other'].map(r => ({ value: r, label: r }))} value={formData.parentRelation ? { value: formData.parentRelation, label: formData.parentRelation } : null} onChange={(s) => setFormData(p => ({ ...p, parentRelation: s.value }))} className="" icon="ph:users-three-bold" />
                                <Textinput name="parentPhone" label="Primary Contact" placeholder="+92 XXX XXXXXXX" value={formData.parentPhone} onChange={handleChange} required className="" icon="ph:phone-bold" />
                                <Textinput type="email" name="parentEmail" label="Guardian Email" placeholder="parent@institution.edu" value={formData.parentEmail} onChange={handleChange} className="" icon="ph:envelope-bold" />
                                <Textinput name="parentOccupation" label="Occupation" placeholder="e.g. Educationist" value={formData.parentOccupation} onChange={handleChange} className="" icon="ph:briefcase-bold" />
                                <Textinput name="address" label="Home Residence" placeholder="Secondary contact / emergency phone" value={formData.address} onChange={handleChange} classGroup="md:col-span-3" className="" icon="ph:map-pin-bold" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t dark:border-slate-700 flex justify-end items-center space-x-4">
                        <span className="text-[10px] text-slate-400 font-medium italic hidden md:block">* All data is encrypted and strictly used for academic administration.</span>
                        <Button type="button" text="Cancel" className="btn-light px-8  font-bold tracking-wider text-[11px]" onClick={() => setIsOpen(false)} />
                        <Button
                            type="submit"
                            text={submitting ? "Please wait..." : (isEditMode ? "Propagate Changes" : "Confirm Enrollment")}
                            className="bg-primary-500 hover:bg-primary-600 text-white px-12 rounded-xl  font-bold tracking-widest text-[12px] shadow-lg shadow-primary-500/25 transition-all active:scale-95"
                            disabled={submitting}
                        />
                    </div>
                </form>
            </Modal>

            {/* Academic History Modal */}
            <Modal title={selectedStudent ? `Academic History: ${selectedStudent.FirstName}` : "History"} activeModal={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} className="max-w-2xl">
                <div className="space-y-4 py-2">
                    <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-xl border border-primary-100 dark:border-primary-800/30 flex items-center justify-between">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-primary-600 dark:text-primary-400">Admitted Date</div>
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{selectedStudent?.AdmissionDate ? new Date(selectedStudent.AdmissionDate).toLocaleDateString() : 'N/A'}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] uppercase font-bold text-primary-600 dark:text-primary-400">Status</div>
                            <Badge label="Active Student" className="badge-soft-success" />
                        </div>
                    </div>

                    <div className="border-t dark:border-slate-700 pt-4">
                        <h5 className="text-[11px] font-bold uppercase text-slate-400 mb-3 tracking-widest pl-1">Promotion & Batch Log</h5>
                        <div className="space-y-3">
                            {(selectedStudent?.AcademicHistory ? (typeof selectedStudent.AcademicHistory === 'string' ? JSON.parse(selectedStudent.AcademicHistory) : selectedStudent.AcademicHistory) : []).map((h, i) => (
                                <div key={i} className="flex items-start space-x-3 p-3 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800/40 relative">
                                    <div className="h-full w-0.5 absolute left-6 top-10 bottom-0 bg-slate-200 dark:bg-slate-700 -z-10"></div>
                                    <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 border dark:border-slate-600 mt-1">
                                        <div className="h-2 w-2 rounded-full bg-primary-500"></div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <span className="text-[12px] font-bold text-slate-800 dark:text-slate-100">{h.Action} to {h.ClassName || 'New Class'}</span>
                                            <span className="text-[10px] text-slate-400 font-bold">{h.Date}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 mt-0.5">{h.Notes}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Fee Concession Modal */}
            <Modal title={selectedStudent ? `Fee Concession: ${selectedStudent.FirstName}` : "Concession"} activeModal={isConcessionOpen} onClose={() => setIsConcessionOpen(false)} className="max-w-lg">
                <div className="space-y-4 py-2">
                    <form onSubmit={onConcessionSubmit} className="dark:bg-slate-800/20 p-4 rounded-xl border dark:border-slate-700 space-y-4">
                        <Textinput type="number" label="Monthly Concession Amount (PKR)" placeholder="e.g. 1500" value={concessionData.amount} onChange={(e) => setConcessionData({ ...concessionData, amount: e.target.value })} />
                        <Textinput label="Reason / Notes" placeholder="Special scholarship..." value={concessionData.notes} onChange={(e) => setConcessionData({ ...concessionData, notes: e.target.value })} />
                        <Button type="submit" text="Apply Concession" className="btn-primary w-full shadow-lg" />
                    </form>

                    <div className="pt-2">
                        <h5 className="text-[11px] font-bold uppercase text-slate-400 mb-3 tracking-widest pl-1">Concession History</h5>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {(selectedStudent?.ConcessionHistory ? (typeof selectedStudent.ConcessionHistory === 'string' ? JSON.parse(selectedStudent.ConcessionHistory) : selectedStudent.ConcessionHistory) : []).map((h, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-lg border dark:border-slate-700 bg-slate-50 dark:bg-slate-800/20 text-xs ">
                                    <div className="font-bold text-success-500">PKR {h.Amount?.toLocaleString()}</div>
                                    <div className="text-slate-400">{new Date(h.Date).toLocaleDateString()}</div>
                                    <div className="text-right truncate max-w-[150px] italic text-slate-500">{h.Notes}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>
        </div >
    );
};

export default Students;
