import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { get, post, put } from "@/lib/apiClient";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import UserAvatar from "@/assets/images/placeholder/blank-profile.png";
import { useLocation } from "react-router-dom";
import moment from "moment";

const UserProfile = () => {
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // Edit Profile Form State
    const [editForm, setEditForm] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        photo: "",
        gender: "",
        dob: "",
        qualification: "",
        experience: "",
        bio: ""
    });

    const genderOptions = [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Other" }
    ];

    const qualificationOptions = [
        { value: "Matriculation", label: "Matriculation" },
        { value: "Intermediate", label: "Intermediate" },
        { value: "Bachelors", label: "Bachelors" },
        { value: "Masters", label: "Masters" },
        { value: "PhD", label: "PhD" },
        { value: "Other", label: "Other" }
    ];

    // Password Update State
    const [passwordStep, setPasswordStep] = useState(1);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        otp: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        fetchProfile();
        const params = new URLSearchParams(location.search);
        if (params.get('tab') === 'password') {
            setIsPasswordModalOpen(true);
        }
    }, [location]);

    const fetchProfile = async () => {
        try {
            const res = await get("/users/profile");
            const data = res.data || res;
            setProfileData(data);
            syncEditForm(data);
        } catch (error) {
            console.error("Fetch profile error:", error);
            toast.error("Failed to fetch profile");
        } finally {
            setIsLoading(false);
        }
    };

    const syncEditForm = (data) => {
        setEditForm({
            firstName: data?.FirstName || "",
            lastName: data?.LastName || "",
            phone: data?.Phone || "",
            address: data?.Address || "",
            photo: data?.Photo || "",
            gender: data?.Gender || "",
            dob: data?.DOB ? data.DOB.split('T')[0] : "",
            qualification: data?.Qualification || "",
            experience: data?.Experience || "",
            bio: data?.Bio || ""
        });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setEditForm(prev => ({ ...prev, photo: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await put("/users/profile", editForm);
            toast.success("Profile updated successfully");
            setIsEditModalOpen(false);
            fetchProfile();
        } catch (error) {
            console.error("Update profile error:", error);
            toast.error(error.response?.data || "Update failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePasswordInit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await post("/auth/change-password-init", { currentPassword: passwordForm.currentPassword });
            toast.success("OTP sent to your email");
            setPasswordStep(2);
        } catch (error) {
            toast.error(error.response?.data || "Verification failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePasswordVerify = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return toast.error("Passwords do not match");
        }
        try {
            setIsSubmitting(true);
            await post("/auth/change-password-verify", {
                otp: passwordForm.otp,
                newPassword: passwordForm.newPassword
            });
            toast.success("Password changed successfully");
            setIsPasswordModalOpen(false);
            setPasswordStep(1);
            setPasswordForm({ currentPassword: "", otp: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            toast.error(error.response?.data || "Verification failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="text-center py-20 poppins text-slate-500">Loading profile data...</div>;

    const displayName = profileData?.FirstName ? `${profileData.FirstName} ${profileData.LastName || ''}` : "Set Your Name";
    const displayRole = profileData?.RoleName || "User";

    return (
        <div className="space-y-6 animate-fade-in poppins pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">Account Settings</h2>
                    <p className="text-sm text-slate-500 font-medium">Manage your professional identity and security.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Overview */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border dark:border-slate-700/50 shadow-sm rounded-3xl">
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="relative group">
                                <div className="h-32 w-32 rounded-full border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800">
                                    <img src={profileData?.Photo || UserAvatar} alt="Profile" className="h-full w-full object-cover" />
                                </div>
                                <div className="absolute bottom-4 right-0 flex space-x-1">
                                    <button
                                        onClick={() => { syncEditForm(profileData); setIsEditModalOpen(true); }}
                                        className="bg-indigo-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform active:scale-95"
                                        title="Edit Profile & Photo"
                                    >
                                        <Icon icon="ph:camera-bold" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-white">{displayName}</h3>
                            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-1 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{displayRole}</p>

                            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 italic max-w-[200px]">
                                {profileData?.Bio || "No bio added yet. Tell us a bit about yourself!"}
                            </p>

                            <div className="w-full mt-8 space-y-3">
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                    <span className="h-8 w-8 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-500 rounded-lg flex items-center justify-center">
                                        <Icon icon="ph:envelope-bold" />
                                    </span>
                                    <div className="text-left overflow-hidden">
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Email Address</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 truncate font-semibold">{profileData?.Email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                    <span className="h-8 w-8 bg-green-100 dark:bg-green-500/20 text-green-500 rounded-lg flex items-center justify-center">
                                        <Icon icon="ph:phone-bold" />
                                    </span>
                                    <div className="text-left">
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Contact Number</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold">{profileData?.Phone || "Not Set"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Quick Security" className="border dark:border-slate-700/50 shadow-sm rounded-3xl">
                        <button
                            onClick={() => { setIsPasswordModalOpen(true); setPasswordStep(1); }}
                            className="w-full flex items-center space-x-4 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-yellow-500 transition-all group"
                        >
                            <div className="h-10 w-10 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Icon icon="ph:shield-check-bold" className="text-xl" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Update Password</h4>
                                <p className="text-[10px] text-slate-500">Secure your account</p>
                            </div>
                        </button>
                    </Card>
                </div>

                {/* Detailed Info - Merged Professional & Contact/Location */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Full Profile Details" className="border dark:border-slate-700/50 shadow-sm rounded-3xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Academic & Experience Column */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b dark:border-slate-700 pb-2">Academic & Experience</h4>
                                <div className="flex items-start space-x-4">
                                    <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl flex items-center justify-center flex-none"><Icon icon="ph:student-bold" /></div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase">Qualification</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold mt-1">{profileData?.Qualification || "Not provided"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl flex items-center justify-center flex-none"><Icon icon="ph:chart-bar-bold" /></div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase">Experience</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold mt-1">{profileData?.Experience || "Not provided"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Details Column */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b dark:border-slate-700 pb-2">Personal Identity</h4>
                                <div className="flex items-start space-x-4">
                                    <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl flex items-center justify-center flex-none"><Icon icon="ph:gender-intersex-bold" /></div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase">Gender</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold mt-1 capitalize">{profileData?.Gender || "Not Set"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl flex items-center justify-center flex-none"><Icon icon="ph:calendar-bold" /></div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase">Date of Birth</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold mt-1">
                                            {profileData?.DOB ? moment(profileData.DOB).format("dddd, DD MMMM YYYY") : "Not Set"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Location & Contact Column */}
                            <div className="md:col-span-2 space-y-6">
                                <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b dark:border-slate-700 pb-2">Contact & Location</h4>
                                <div className="flex items-start space-x-4">
                                    <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl flex items-center justify-center flex-none"><Icon icon="ph:map-pin-bold" /></div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase">Residential Address</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold mt-1">
                                            {profileData?.Address || "Please provide your residential address for official records."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex flex-col md:flex-row gap-3">
                            <Button
                                text="Edit Profile Information"
                                className="btn-primary flex-1 py-3 font-semibold text-sm shadow-indigo-100"
                                icon="ph:pencil-simple-line-bold"
                                onClick={() => { syncEditForm(profileData); setIsEditModalOpen(true); }}
                            />
                            <Button
                                text="Change Account Photo"
                                className="btn-outline-primary flex-1 py-3 font-semibold text-sm"
                                icon="ph:camera-bold"
                                onClick={() => { syncEditForm(profileData); setIsEditModalOpen(true); }}
                            />
                        </div>
                    </Card>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <Modal
                activeModal={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Update Personal Identity"
                className="max-w-3xl"
            >
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative group p-1 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
                            <div className="h-32 w-32 rounded-2xl overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                                <img src={editForm.photo || profileData?.Photo || UserAvatar} alt="Preview" className="h-full w-full object-cover" />
                                <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={isSubmitting} />
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Icon icon="ph:camera-plus-bold" className="text-white text-3xl" />
                                    <span className="text-[10px] text-white font-semibold uppercase mt-1">Upload New</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-semibold uppercase tracking-widest text-center">Click image to upload profile picture</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Textinput label="First Name" value={editForm.firstName} onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))} required disabled={isSubmitting} icon="ph:user-bold" />
                        <Textinput label="Last Name" value={editForm.lastName} onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))} required disabled={isSubmitting} icon="ph:user-bold" />
                        <Textinput label="Phone Number" value={editForm.phone} onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))} disabled={isSubmitting} icon="ph:phone-bold" />
                        <Select
                            label="Gender"
                            options={genderOptions}
                            value={genderOptions.find(o => o.value === editForm.gender)}
                            onChange={(val) => setEditForm(prev => ({ ...prev, gender: val?.value }))}
                            icon="ph:gender-intersex-bold"
                            disabled={isSubmitting}
                        />
                        <Textinput label="Date of Birth" type="date" value={editForm.dob} onChange={(e) => setEditForm(prev => ({ ...prev, dob: e.target.value }))} disabled={isSubmitting} icon="ph:calendar-bold" />
                        <Select
                            label="Qualification"
                            options={qualificationOptions}
                            value={qualificationOptions.find(o => o.value === editForm.qualification) || (editForm.qualification ? { value: editForm.qualification, label: editForm.qualification } : null)}
                            onChange={(val) => setEditForm(prev => ({ ...prev, qualification: val?.value }))}
                            icon="ph:student-bold"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-4">
                        <Textinput label="Professional Bio" placeholder="Tell us about yourself..." value={editForm.bio} onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))} disabled={isSubmitting} icon="ph:note-pencil-bold" />
                        <Textinput label="Work Experience" placeholder="Briefly describe your experience" value={editForm.experience} onChange={(e) => setEditForm(prev => ({ ...prev, experience: e.target.value }))} disabled={isSubmitting} icon="ph:chart-bar-bold" />
                        <Textinput label="Residential Address" value={editForm.address} onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))} disabled={isSubmitting} icon="ph:map-pin-bold" />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" text={isSubmitting ? "Updating Profile..." : "Save Account Updates"} className="btn-primary w-full py-4 text-lg font-semibold rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none" disabled={isSubmitting} />
                    </div>
                </form>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                activeModal={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                title="Account Security"
                className="max-w-md"
            >
                {passwordStep === 1 && (
                    <form onSubmit={handlePasswordInit} className="space-y-6">
                        <div className="bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-2xl flex items-center space-x-3">
                            <Icon icon="ph:info-bold" className="text-indigo-500 text-xl" />
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Please enter your current password to receive a verification code.</p>
                        </div>
                        <Textinput
                            type="password"
                            label="Current Password"
                            placeholder="Type here..."
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            required
                            icon="ph:key-bold"
                            disabled={isSubmitting}
                        />
                        <Button type="submit" text={isSubmitting ? "Please wait..." : "Request Security Code"} className="btn-primary w-full py-3" disabled={isSubmitting} />
                    </form>
                )}

                {passwordStep === 2 && (
                    <form onSubmit={(e) => { e.preventDefault(); setPasswordStep(3); }} className="space-y-6">
                        <div className="bg-yellow-50 dark:bg-yellow-500/10 p-3 rounded-2xl flex items-center space-x-3">
                            <Icon icon="ph:paper-plane-tilt-bold" className="text-yellow-500 text-xl" />
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">A 6-digit code has been sent to your registered email address.</p>
                        </div>
                        <Textinput
                            label="OTP Verification Code"
                            placeholder="000000"
                            value={passwordForm.otp}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, otp: e.target.value }))}
                            required
                            maxLength={6}
                            icon="ph:password-bold"
                            disabled={isSubmitting}
                        />
                        <Button type="submit" text={isSubmitting ? "Please wait..." : "Continue to New Password"} className="btn-warning w-full py-3 text-white" disabled={isSubmitting} />
                        <button type="button" onClick={() => setPasswordStep(1)} className="text-xs text-slate-500 hover:underline w-full text-center" disabled={isSubmitting}>Back to current password</button>
                    </form>
                )}

                {passwordStep === 3 && (
                    <form onSubmit={handlePasswordVerify} className="space-y-4">
                        <div className="bg-green-50 dark:bg-green-500/10 p-3 rounded-2xl flex items-center space-x-3 mb-4">
                            <Icon icon="ph:check-circle-bold" className="text-green-500 text-xl" />
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Security verified! You can now set your new password.</p>
                        </div>
                        <Textinput
                            type="password"
                            label="New Secure Password"
                            placeholder="Min 8 characters"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            required
                            icon="ph:lock-bold"
                            disabled={isSubmitting}
                        />
                        <Textinput
                            type="password"
                            label="Confirm Security Code"
                            placeholder="Repeat password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            required
                            icon="ph:lock-bold"
                            disabled={isSubmitting}
                        />
                        <Button type="submit" text={isSubmitting ? "Please wait..." : "Complete Account Recovery"} className="btn-success w-full mt-4 py-3" disabled={isSubmitting} />
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default UserProfile;
