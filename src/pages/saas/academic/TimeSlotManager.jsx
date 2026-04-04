import React, { useState, useEffect, useMemo } from "react";
import { get, post, del } from "@/lib/apiClient";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import Checkbox from "@/components/ui/Checkbox";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import { toast } from "react-toastify";
import SkeletonTable from "@/components/skeleton/Table";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";

const TimeSlotManager = () => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        slotName: "",
        startTime: "08:00",
        endTime: "09:00",
        isBreak: false
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await get("/academic/timeslots");
            if (res?.data) setSlots(res.data);
        } catch (err) {
            toast.error("Failed to load time slots");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!formData.slotName || !formData.startTime || !formData.endTime) {
            return toast.error("All fields are required");
        }

        try {
            setSubmitting(true);
            await post("/academic/timeslots", formData);
            toast.success("Time slot created");
            setFormData({ slotName: "", startTime: "08:00", endTime: "09:00", isBreak: false });
            fetchData();
        } catch (err) {
            toast.error("Failed to create slot");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this time slot? This might affect existing timetable entries.")) return;
        try {
            await del(`/academic/timeslots/${id}`);
            toast.success("Slot deleted");
            fetchData();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const columns = useMemo(() => [
        {
            Header: "Slot Name / Period",
            accessor: "SlotName",
            Cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded flex items-center justify-center font-bold text-xs ${row.original.IsBreak ? 'bg-amber-100 text-amber-600' : 'bg-primary-100 text-primary-600'}`}>
                        {row.original.IsBreak ? <Icon icon="ph:coffee-bold" /> : (slots.indexOf(row.original) + 1)}
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200 uppercase text-[12px]">{row.original.SlotName}</span>
                </div>
            )
        },
        {
            Header: "Time Range",
            Cell: ({ row }) => (
                <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-slate-500">
                    <Icon icon="ph:clock-bold" className="text-primary-500" />
                    {row.original.StartTime.substring(0, 5)} - {row.original.EndTime.substring(0, 5)}
                </div>
            )
        },
        {
            Header: "Type",
            accessor: "IsBreak",
            Cell: ({ value }) => (
                <Badge 
                    label={value ? "Break / Recess" : "Academic Period"} 
                    className={value ? "badge-soft-warning font-bold" : "badge-soft-success font-bold"} 
                />
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
    ], [slots]);

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:calendar-check-bold"
                title="Time Slots & Periods"
                description="Define the standard academic schedule for your institution (e.g., Period 1, Lunch Break, Period 2)."
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <Card title="Define New Period" className="border dark:border-[#2f3336]">
                        <form onSubmit={onSubmit} className="space-y-4">
                            <Textinput
                                label="Slot Name"
                                placeholder="e.g. Period 1, Zero Period"
                                value={formData.slotName}
                                onChange={(e) => setFormData({ ...formData, slotName: e.target.value })}
                                icon="ph:text-t-bold"
                                required
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <Textinput
                                    type="time"
                                    label="Start Time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    required
                                />
                                <Textinput
                                    type="time"
                                    label="End Time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="py-2">
                                <Checkbox
                                    label="This is a Break / Non-teaching slot"
                                    value={formData.isBreak}
                                    onChange={() => setFormData({ ...formData, isBreak: !formData.isBreak })}
                                />
                            </div>
                            <Button
                                type="submit"
                                text="Save Time Slot"
                                className="btn-primary w-full font-bold mt-2"
                                loading={submitting}
                            />
                        </form>
                    </Card>
                </div>

                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-[#111111] rounded-2xl border dark:border-[#2f3336] shadow-sm overflow-hidden min-h-[400px]">
                        {loading ? (
                            <div className="p-10"><SkeletonTable count={6} /></div>
                        ) : (
                            <DataTable
                                columns={columns}
                                data={slots}
                                pageSize={10}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimeSlotManager;
