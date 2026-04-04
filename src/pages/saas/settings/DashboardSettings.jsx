import React, { useState, useEffect } from "react";
import { get, post } from "@/lib/apiClient";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { checkAccess } from "@/configs/navigation";

const DashboardSettings = () => {
    const { user } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        showStats: true,
        showRecentInvoices: true,
        showAttendanceSummary: true,
        showQuickActions: true,
        showAnnouncements: true
    });

    const widgets = [
        { id: "stats", title: "Key Performance Metrics", description: "Quick totals for students, staff, and fees.", moduleId: "1.1", key: "showStats" },
        { id: "invoices", title: "Recent Financial Activity", description: "List of the most recent invoices and collects.", moduleId: "5", key: "showRecentInvoices" },
        { id: "attendance", title: "Daily Attendance Snapshot", description: "Overview of today's attendance numbers.", moduleId: "4", key: "showAttendanceSummary" },
        { id: "actions", title: "Quick Management Actions", description: "Shortcut buttons for common tasks.", moduleId: "1.1", key: "showQuickActions" },
        { id: "news", title: "Announcements & News", description: "Latest school updates and notifications.", moduleId: "1.1", key: "showAnnouncements" },
    ];

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const res = await get("/users/dashboard-settings");
                if (res.data?.config) {
                    setConfig(res.data.config);
                }
            } catch (err) {
                console.error("Failed to load dashboard settings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleToggle = (key) => {
        setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await post("/users/dashboard-settings", { config });
            toast.success("Dashboard preferences saved");
        } catch (err) {
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:squares-four-bold"
                title="Dashboard Customizer"
                description="Tailor your analytical workspace by choosing which data widgets to display."
            />

            <div className="max-w-4xl mx-auto">
                <Card title="Available Dashboard Widgets" className="border dark:border-[#2f3336]">
                    <div className="space-y-4">
                        <div className="bg-primary-50 dark:bg-primary-500/10 p-4 rounded-xl border border-primary-200 dark:border-primary-500/30 mb-6">
                            <div className="flex gap-3">
                                <Icon icon="ph:info-bold" className="text-primary-500 text-xl flex-none" />
                                <div className="text-[13px] text-primary-700 dark:text-primary-300">
                                    Only widgets belonging to modules you have access to will be displayed on your main dashboard.
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {widgets.map((widget) => {
                                const hasAccess = checkAccess(widget.moduleId, user?.Access);
                                const isChecked = config[widget.key];

                                return (
                                    <div
                                        key={widget.id}
                                        onClick={() => hasAccess && handleToggle(widget.key)}
                                        className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                                            !hasAccess
                                                ? "opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                                : isChecked
                                                ? "bg-primary-50 border-primary-300 dark:bg-primary-500/5 dark:border-primary-500/40 cursor-pointer shadow-sm"
                                                : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 cursor-pointer hover:border-slate-300"
                                        }`}
                                    >
                                        <div className={`mt-1 h-5 w-5 rounded flex items-center justify-center transition-all border ${
                                            isChecked ? 'bg-primary-500 border-primary-500 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                                        }`}>
                                            {isChecked && <Icon icon="ph:check-bold" className="text-[10px]" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                                {widget.title}
                                                {!hasAccess && <Icon icon="ph:lock-key-bold" className="text-slate-400 text-xs" />}
                                            </div>
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                                {widget.description}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-8 flex justify-end gap-3 border-t dark:border-slate-700 mt-6">
                            <Button
                                text="Save Preferences"
                                className="btn-primary px-10"
                                onClick={handleSave}
                                loading={saving}
                                disabled={loading}
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DashboardSettings;
