import React, { useState, useEffect } from "react";
import { get, post, del, put } from "@/lib/apiClient";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Icon from "@/components/ui/Icon";
import MultiSelect from "@/components/ui/MultiSelect";
import { toast } from "react-toastify";
import PageHeader from "@/components/ui/PageHeader";
import GridSkeleton from "@/components/skeleton/Grid";

const ClassesSections = () => {
    const [classes, setClasses] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editClassId, setEditClassId] = useState(null);

    // Sections State
    const [isSectionsOpen, setIsSectionsOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [sections, setSections] = useState([]);
    const [sectionName, setSectionName] = useState("");
    const [sectionsLoading, setSectionsLoading] = useState(false);

    // Subjects State
    const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
    const [selectedSubjects, setSelectedSubjects] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
    });
    const [selectedFaculties, setSelectedFaculties] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [classesRes, facultiesRes, subjectsRes] = await Promise.all([
                get("/academic/classes"),
                get("/academic/faculties"),
                get("/academic/subjects")
            ]);

            if (classesRes?.data) setClasses(classesRes.data);
            if (facultiesRes?.data) {
                setFaculties(facultiesRes.data.map(f => ({ value: f.Name, label: f.Name })));
            }
            if (subjectsRes?.data) {
                setAllSubjects(subjectsRes.data.map(s => ({ value: s.ID, label: `${s.Name} (${s.Code || 'No Code'})` })));
            }
        } catch (err) {
            toast.error("Failed to load academic data");
        } finally {
            setLoading(false);
        }
    };

    const fetchSections = async (classID) => {
        try {
            setSectionsLoading(true);
            const res = await get(`/academic/sections?classID=${classID}`);
            if (res?.data) {
                setSections(res.data);
            }
        } catch (err) {
            toast.error("Failed to load sections");
        } finally {
            setSectionsLoading(false);
        }
    };

    const handleOpenSections = (cls) => {
        setSelectedClass(cls);
        setIsSectionsOpen(true);
        fetchSections(cls.ID);
    };

    const handleOpenSubjects = (cls) => {
        setSelectedClass(cls);
        let currentSubjects = [];
        try {
            currentSubjects = typeof cls.subjects === 'string' ? JSON.parse(cls.subjects) : (cls.subjects || []);
        } catch (e) { currentSubjects = []; }

        setSelectedSubjects(currentSubjects.map(s => ({ value: s.ID, label: s.Name })));
        setIsSubjectsOpen(true);
    };

    const handleSaveSubjects = async () => {
        try {
            await post("/academic/class-subjects", {
                classID: selectedClass.ID,
                subjectIDs: selectedSubjects.map(s => s.value)
            });
            toast.success("Subjects updated");
            setIsSubjectsOpen(false);
            fetchData();
        } catch (err) {
            toast.error("Failed to update subjects");
        }
    };

    const handleAddSection = async (e) => {
        e.preventDefault();
        if (!sectionName.trim()) return;

        try {
            await post("/academic/sections", {
                classID: selectedClass.ID,
                name: sectionName
            });
            toast.success("Section added");
            setSectionName("");
            fetchSections(selectedClass.ID);
            fetchData();
        } catch (err) {
            toast.error("Failed to add section");
        }
    };

    const handleDeleteSection = async (sectionID) => {
        try {
            await del(`/academic/sections/${sectionID}`);
            toast.success("Section deleted");
            fetchSections(selectedClass.ID);
            fetchData();
        } catch (err) {
            toast.error("Failed to delete section");
        }
    };

    const handleEditClass = (cls) => {
        setEditClassId(cls.ID);
        setFormData({ name: cls.Name });
        setSelectedFaculties(
            (cls.Faculties || "").split(", ")
                .filter(Boolean)
                .map(f => ({ value: f, label: f }))
        );
        setIsEditMode(true);
        setIsOpen(true);
    };

    const handleDeleteClass = async (id) => {
        if (!window.confirm("Are you sure? All sections will be deleted too.")) return;
        try {
            await del(`/academic/classes/${id}`);
            toast.success("Class deleted");
            fetchData();
        } catch (err) {
            toast.error("Failed to delete class");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                faculties: selectedFaculties.map(f => f.value).join(", ")
            };

            if (isEditMode) {
                await put(`/academic/classes/${editClassId}`, payload);
                toast.success("Class updated");
            } else {
                await post("/academic/classes", payload);
                toast.success("Class created");
            }

            setIsOpen(false);
            resetForm();
            fetchData();
        } catch (err) {
            toast.error(err.message || "Operation failed");
        }
    };

    const resetForm = () => {
        setFormData({ name: "" });
        setSelectedFaculties([]);
        setIsEditMode(false);
        setEditClassId(null);
    };

    const handleEditSection = (section) => {
        setSectionName(section.Name);
        setEditSectionId(section.ID);
    };

    const [editSectionId, setEditSectionId] = useState(null);

    const handleAddSectionOverride = async (e) => {
        e.preventDefault();
        if (!sectionName.trim()) return;

        try {
            if (editSectionId) {
                await put(`/academic/sections/${editSectionId}`, { name: sectionName });
                toast.success("Section updated");
            } else {
                await post("/academic/sections", {
                    classID: selectedClass.ID,
                    name: sectionName
                });
                toast.success("Section added");
            }
            setSectionName("");
            setEditSectionId(null);
            fetchSections(selectedClass.ID);
            fetchData();
        } catch (err) {
            toast.error("Operation failed");
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:users-three"
                title="Academic Setup"
                description="Configure classes, sections, and subject mapping."
                buttonText="Add New Class"
                onButtonClick={() => { resetForm(); setIsOpen(true); }}
            />

            {loading ? (
                <GridSkeleton count={6} />
            ) : classes.length === 0 ? (
                <div className="col-span-full text-center bg-white dark:bg-[#111111] p-20 rounded-2xl border dark:border-[#2f3336]">
                    <Icon icon="ph:files-light" className="mx-auto text-6xl text-muted mb-4 opacity-20" />
                    <p className="text-xl text-muted poppins mb-6">No Classes Setup Yet.</p>
                    <Button text="Get Started" className="btn-primary btn-sm px-6" onClick={() => setIsOpen(true)} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
                    {classes.map((cls) => {
                        let parsedSections = [];
                        let parsedSubjects = [];
                        try {
                            parsedSections = typeof cls.sections === 'string' ? JSON.parse(cls.sections) : (cls.sections || []);
                            parsedSubjects = typeof cls.subjects === 'string' ? JSON.parse(cls.subjects) : (cls.subjects || []);
                        } catch (e) {
                            parsedSections = parsedSections.length ? parsedSections : [];
                            parsedSubjects = parsedSubjects.length ? parsedSubjects : [];
                        }

                        return (
                            <div key={cls.ID} className="group transition-all duration-300 transform hover:-translate-y-1">
                                <div className="card h-100 bg-white dark:bg-[#111111] border-slate-100 dark:border-[#2f3336] rounded-2xl p-6 relative overflow-hidden flex flex-column shadow-none border">
                                    <div className="absolute top-0 right-0 p-3 flex gap-2">
                                        <button onClick={() => handleEditClass(cls)} title="Edit Class" className="p-2 bg-slate-50 dark:bg-[#1f2128] text-slate-500 hover:text-primary-500 rounded-lg transition-colors">
                                            <Icon icon="heroicons-outline:pencil-alt" />
                                        </button>
                                        <button onClick={() => handleDeleteClass(cls.ID)} title="Delete Class" className="p-2 bg-slate-50 dark:bg-[#1f2128] text-slate-500 hover:text-danger-500 rounded-lg transition-colors">
                                            <Icon icon="heroicons-outline:trash" />
                                        </button>
                                    </div>

                                    <div className="mb-4">
                                        <h5 className="font-bold text-xl poppins text-primary-600 dark:text-primary-400">{cls.Name}</h5>
                                    </div>

                                    <div className="flex-grow space-y-5">
                                        <div>
                                            <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2 block">Available Faculty</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(cls.Faculties || "General").split(", ").filter(Boolean).map((f, i) => (
                                                    <Badge key={i} label={f} className="badge-soft-slate" />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 dark:bg-[#111111] rounded-xl p-3 border dark:border-[#2f3336] relative">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Sections</span>
                                                <button
                                                    onClick={() => handleOpenSections(cls)}
                                                    className="text-primary-500 hover:text-primary-600 transition-colors"
                                                    title="Manage Sections"
                                                >
                                                    <Icon icon="ph:gear-duotone" className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5 min-h-[30px]">
                                                {parsedSections.length > 0 ? parsedSections.map((s) => (
                                                    <div
                                                        key={s.ID}
                                                        onClick={() => handleOpenSections(cls)}
                                                        className="px-2 py-1 bg-white dark:bg-[#1f2128] rounded-md text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer hover:border-primary-400 border border-slate-100 dark:border-[#2f3336] transition-colors shadow-sm"
                                                    >
                                                        {s.Name}
                                                    </div>
                                                )) : (
                                                    <span className="text-[10px] text-muted italic poppins opacity-60">No sections added</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-primary-50 dark:bg-primary-500/10 px-3 py-2 rounded-xl border border-primary-100 dark:border-primary-500/20">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider block">Subjects</span>
                                                <button
                                                    onClick={() => handleOpenSubjects(cls)}
                                                    className="text-primary-500 hover:text-primary-600 transition-colors"
                                                    title="Manage Subjects"
                                                >
                                                    <Icon icon="ph:plus-circle-duotone" className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {parsedSubjects.length > 0 ? parsedSubjects.map((s) => (
                                                    <span key={s.ID} className="text-[10px] font-medium text-primary-700 dark:text-primary-300 bg-white dark:bg-[#1f2128] px-2 py-0.5 rounded-full border border-primary-200 dark:border-primary-500/30">
                                                        {s.Name}
                                                    </span>
                                                )) : (
                                                    <span className="text-[10px] text-primary-400 italic poppins opacity-60">No subjects assigned</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal title={isEditMode ? "Update Class" : "Create New Class"} activeModal={isOpen} onClose={() => setIsOpen(false)}>
                <form onSubmit={onSubmit} className="space-y-5">
                    <Textinput
                        name="name"
                        label="Class name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="poppins"
                    />
                    <div>
                        <MultiSelect
                            label="Associated Faculties"
                            options={faculties}
                            onChange={setSelectedFaculties}
                            value={selectedFaculties}
                            isSearchable
                            placeholder="Select faculties..."
                            description="Assign faculties to this level for report card categorization."
                        />
                    </div>
                    <Button type="submit" className="btn-primary block w-full text-center mt-6" text={isEditMode ? "Update Class" : "Save Class"} />
                </form>
            </Modal>

            <Modal
                title={`Manage Sections - ${selectedClass?.Name}`}
                activeModal={isSectionsOpen}
                onClose={() => { setIsSectionsOpen(false); setSectionName(""); setEditSectionId(null); }}
                className="max-w-xl"
            >
                <div className="space-y-6 py-2">
                    <form onSubmit={handleAddSectionOverride} className="flex gap-3 items-start">
                        <div className="flex-grow">
                            <Textinput
                                name="sectionName"
                                label="Section name"
                                value={sectionName}
                                onChange={(e) => setSectionName(e.target.value)}
                                autoComplete="off"
                            />
                        </div>
                        <div className="pt-0.5">
                            <Button
                                type="submit"
                                text={editSectionId ? "Update" : "Add"}
                                icon={editSectionId ? "ph:pencil-line" : "ph:plus-bold"}
                                className="btn-primary poppins px-4 py-3"
                            />
                        </div>
                    </form>

                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 border dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b dark:border-slate-800">
                            <h6 className="text-sm font-bold poppins text-dark dark:text-white flex items-center gap-2">
                                <Icon icon="ph:list-dashes-bold" className="text-primary-500" />
                                Configured Sections
                            </h6>
                            <Badge label={sections.length} className="bg-primary-500 text-white rounded-full h-5 w-5 flex items-center justify-center p-0" />
                        </div>

                        {sectionsLoading ? (
                            <p className="text-sm text-muted animate-pulse poppins">Updating section registry...</p>
                        ) : sections.length === 0 ? (
                            <div className="text-center py-6">
                                <Icon icon="ph:warning-circle" className="text-3xl text-muted opacity-30 mx-auto mb-2" />
                                <p className="text-xs text-muted poppins">Add a section to get started.</p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {sections.map((section) => (
                                    <div key={section.ID} className="group/item bg-white dark:bg-slate-800 border dark:border-slate-700 pl-3 pr-2 py-2 rounded-xl flex items-center gap-3 hover:border-primary-500 transition-all">
                                        <span className="text-sm font-bold poppins text-slate-700 dark:text-slate-300">{section.Name}</span>
                                        <div className="flex gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleEditSection(section)}
                                                className="p-1 text-slate-300 hover:text-primary-500 transition-colors bg-slate-50 dark:bg-slate-700 rounded-md"
                                            >
                                                <Icon icon="heroicons-outline:pencil" className="w-3 h-3" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteSection(section.ID)}
                                                className="p-1 text-slate-300 hover:text-danger-500 transition-colors bg-slate-50 dark:bg-slate-700 rounded-md"
                                            >
                                                <Icon icon="heroicons-outline:x" className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Subject Assignment Modal */}
            <Modal
                title={`Manage Subjects - ${selectedClass?.Name}`}
                activeModal={isSubjectsOpen}
                onClose={() => setIsSubjectsOpen(false)}
            >
                <div className="space-y-6 py-2">
                    <div>
                        <MultiSelect
                            label="Assign Subjects to this Class"
                            options={allSubjects}
                            value={selectedSubjects}
                            onChange={setSelectedSubjects}
                            placeholder="Search and select subjects..."
                            description="These subjects will be available for all sections of this class."
                        />
                    </div>

                    <div className="pt-4 border-t flex justify-end gap-3">
                        <Button text="Cancel" className="btn-light btn-sm poppins" onClick={() => setIsSubjectsOpen(false)} />
                        <Button text="Save Changes" className="btn-primary btn-sm poppins" onClick={handleSaveSubjects} />
                    </div>
                </div>
            </Modal>
        </div >
    );
};

export default ClassesSections;

