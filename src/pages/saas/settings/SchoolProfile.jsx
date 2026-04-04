import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import { get, put } from "@/lib/apiClient";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import SchoolPlaceholder from "@/assets/images/logo/logo.png"; // Fallback logo
import PageHeader from "@/components/ui/PageHeader";

const SchoolProfile = () => {
    const { user } = useSelector((state) => state.auth);
    const [schoolData, setSchoolData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        logoUrl: "",
        address: "",
        phone: "",
        email: "",
        startTime: "08:00",
        endTime: "14:00"
    });

    const isAuthorized = user?.RoleID === 1 || user?.RoleID === 2;

    useEffect(() => {
        if (isAuthorized) {
            fetchSchoolProfile();
        } else if (user) {
            setLoading(false);
        }
    }, [isAuthorized, user]);

    const fetchSchoolProfile = async () => {
        try {
            setLoading(true);
            const res = await get("/users/school/profile");
            const data = res.data || res;
            setSchoolData(data);
            setFormData({
                name: data.Name || "",
                logoUrl: data.LogoUrl || "",
                address: data.Address || "",
                phone: data.Phone || "",
                email: data.Email || "",
                startTime: data.StartTime || "08:00",
                endTime: data.EndTime || "14:00"
            });
        } catch (error) {
            toast.error("Failed to load institutional profile");
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData(prev => ({ ...prev, logoUrl: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await put("/users/school/profile", formData);
            toast.success("Institutional settings updated successfully");
            fetchSchoolProfile();
        } catch (error) {
            toast.error(error.response?.data || "Update failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-20 poppins text-slate-500">Loading school metadata...</div>;

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                <Icon icon="ph:lock-key-bold" className="text-6xl text-slate-300" />
                <h2 className="text-2xl font-bold text-slate-800">Restricted Access</h2>
                <p className="text-slate-500 max-w-md">Institutional profile management is reserved for School Administrators. Please contact your system head for assistance.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in poppins pb-10">
            <PageHeader
                icon="ph:buildings-bold"
                title="Institutional Profile"
                description="Configure global school identity, branding, and contact details."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Branding Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border border-slate-100 dark:border-slate-800 shadow-sm rounded-3xl">
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="relative group p-2 border border-dashed border-slate-200 dark:border-slate-700 rounded-3xl mb-4 bg-slate-50/50 dark:bg-slate-800/30">
                                <div className="h-40 w-40 rounded-2xl overflow-hidden relative bg-white">
                                    <img src={formData.logoUrl || SchoolPlaceholder} alt="School Logo" className="h-full w-full object-contain p-4" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        disabled={submitting}
                                    />
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Icon icon="ph:upload-simple-bold" className="text-white text-3xl mb-1" />
                                        <span className="text-[10px] text-white font-bold uppercase">Change Logo</span>
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">{schoolData?.Name}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 bg-slate-100 dark:bg-slate-800/50 px-3 py-1 rounded-full">{schoolData?.Subdomain}.edunex.edu</p>
                        </div>
                    </Card>

                    <Card className="border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden" bodyClass="p-0">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b dark:border-slate-700">
                            <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Icon icon="ph:shield-check-fill" className="text-green-500" /> Institution Status
                            </h4>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400 font-medium">Subscription</span>
                                <span className="font-bold text-primary-500 uppercase">Premium Plan</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400 font-medium">Status</span>
                                <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter">Active</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Profile Editor */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card title="General Identity Settings" className="border border-slate-100 dark:border-slate-800 shadow-sm rounded-3xl">
                            <div className="grid grid-cols-1 gap-6">
                                <Textinput
                                    label="Institution Legal Name"
                                    placeholder="e.g. Cambridge International School"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    disabled={submitting}
                                    icon="ph:buildings-bold"
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    <Textinput
                                        label="Official Contact Number"
                                        placeholder="+92 300 0000000"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        disabled={submitting}
                                        icon="ph:phone-bold"
                                    />
                                    <Textinput
                                        label="Corporate Email Address"
                                        placeholder="administration@school.edu"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={submitting}
                                        icon="ph:envelope-bold"
                                    />
                                </div>
                                <Textinput
                                    label="Physical Campus Address"
                                    placeholder="Complete street address, sector, and city"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    disabled={submitting}
                                    icon="ph:map-pin-bold"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    <Textinput
                                        type="time"
                                        label="Business Start Hours (e.g. 08:00 AM)"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        disabled={submitting}
                                        icon="ph:clock-bold"
                                    />
                                    <Textinput
                                        type="time"
                                        label="Business End Hours (e.g. 02:00 PM)"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        disabled={submitting}
                                        icon="ph:clock-afternoon-bold"
                                    />
                                </div>
                                <div className="pt-6 border-t dark:border-slate-700">
                                    <Button
                                        type="submit"
                                        text={submitting ? "Applying Changes..." : "Update Institutional Profile"}
                                        className="btn-primary w-full text-sm shadow-xl shadow-indigo-100 dark:shadow-none"
                                        disabled={submitting}
                                        icon="ph:cloud-arrow-up-bold"
                                    />
                                </div>
                            </div>
                        </Card>

                        <div className="bg-yellow-50 dark:bg-yellow-500/10 p-3 rounded-2xl border border-yellow-100 dark:border-yellow-500/20 flex items-start space-x-4">
                            <div className="h-10 w-10 bg-white dark:bg-slate-800 text-yellow-500 rounded-xl flex items-center justify-center flex-none shadow-sm">
                                <Icon icon="ph:info-bold" className="text-xl" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400">Profile Integrity Notice</h4>
                                <p className="text-xs text-yellow-700 dark:text-yellow-500/80 leading-relaxed mt-1">Changes made here will be reflected across all institutional documents, invoices, and the student admission gateway immediately. Please ensure all details are legally accurate.</p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SchoolProfile;
