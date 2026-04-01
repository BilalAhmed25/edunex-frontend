import React, { useState, useEffect, useMemo } from "react";
import { get, post } from "@/lib/apiClient";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Checkbox from "@/components/ui/Checkbox";
import DataTable from "@/components/ui/DataTable";
import PageHeader from "@/components/ui/PageHeader";
import SkeletonTable from "@/components/skeleton/Table";
import { toast } from "react-toastify";

const AcademicYears = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        startDate: "",
        endDate: "",
        isActive: false,
    });

    const columns = useMemo(() => [
        {
            Header: "ID",
            accessor: "ID",
            Cell: ({ cell: { value } }) => (
                <span className="font-bold text-slate-400">#{value}</span>
            )
        },
        {
            Header: "Session Name",
            accessor: "Name",
            Cell: ({ cell: { value } }) => (
                <span className="font-semibold text-slate-700 dark:text-slate-200">{value}</span>
            )
        },
        {
            Header: "Start Date",
            accessor: "StartDate",
            Cell: ({ cell: { value } }) => (
                <span>{value ? new Date(value).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "-"}</span>
            )
        },
        {
            Header: "End Date",
            accessor: "EndDate",
            Cell: ({ cell: { value } }) => (
                <span>{value ? new Date(value).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "-"}</span>
            )
        },
        {
            Header: "Status",
            accessor: "IsActive",
            Cell: ({ cell: { value } }) => (
                <Badge
                    label={value ? "Current Active" : "Inactive"}
                    className={value ? "bg-success-500/10 text-success-500 border-none" : "bg-warning-500/10 text-warning-500 border-none"}
                />
            )
        }
    ], []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const fetchYears = async () => {
        try {
            setLoading(true);
            const res = await get("/academic/years");
            if (res?.data) {
                setData(res.data);
            }
        } catch (err) {
            console.log(err)
            toast.error("Failed to load academic years");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchYears();
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await post("/academic/years", formData);
            toast.success("Academic year created");
            setIsOpen(false);
            setFormData({
                name: "",
                startDate: "",
                endDate: "",
                isActive: false,
            });
            fetchYears();
        } catch (err) {
            toast.error(err.message || "Failed to create year");
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader 
                icon="ph:calendar-blank"
                title="Academic Sessions"
                description="Manage institutional academic years and active sessions."
                buttonText="Add New Session"
                onButtonClick={() => setIsOpen(true)}
            />

            {loading ? (
                <div className="card p-6 border dark:border-[#2f3336] bg-white dark:bg-[#111111]">
                    <SkeletonTable count={data.length || 5} />
                </div>
            ) : (
                <div className="card border dark:border-[#2f3336] rounded-xl overflow-hidden bg-white dark:bg-[#111111] shadow-sm">
                    <DataTable
                        columns={columns}
                        data={data}
                        pageSize={10}
                    />
                </div>
            )}

            <Modal title="Create Academic Session" activeModal={isOpen} onClose={() => setIsOpen(false)}>
                <form onSubmit={onSubmit} className="space-y-5 py-2">
                    <Textinput
                        name="name"
                        label="Session Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="poppins"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Textinput
                            type="date"
                            name="startDate"
                            label="Start Date"
                            value={formData.startDate}
                            onChange={handleChange}
                            required
                            className="poppins"
                        />
                        <Textinput
                            type="date"
                            name="endDate"
                            label="End Date"
                            value={formData.endDate}
                            onChange={handleChange}
                            required
                            className="poppins"
                        />
                    </div>
                    <div className="mt-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border dark:border-slate-700">
                        <Checkbox
                            label="Set as Active Current Session"
                            name="isActive"
                            value={formData.isActive}
                            onChange={handleChange}
                            className="poppins font-medium"
                        />
                        <p className="text-[10px] text-muted mt-1 ml-7 poppins italic">Enabling this will set this session as the default for all active students.</p>
                    </div>
                    <Button type="submit" className="btn-primary block w-full text-center mt-6 poppins fw-bold" text="Save Session" />
                </form>
            </Modal>
        </div>
    );
};

export default AcademicYears;

