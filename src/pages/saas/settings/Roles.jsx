import React, { useState, useEffect } from "react";
import { get, post, put, del } from "@/lib/apiClient";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import Modal from "@/components/ui/Modal";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import PageHeader from "@/components/ui/PageHeader";
import { toast } from "react-toastify";
import { masterNavigation } from "@/configs/navigation";

const RolesManagement = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentRole, setCurrentRole] = useState(null);
    const [formData, setFormData] = useState({ name: "", access: [] });

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await get("/roles");
            setRoles(res.data);
        } catch (err) {
            toast.error("Failed to load roles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleOpenModal = (role = null) => {
        if (role) {
            setCurrentRole(role);
            setFormData({
                name: role.Name,
                access: Array.isArray(role.Access) ? Array.from(new Set([...role.Access.map(String), "1", "1.1"])) : ["1", "1.1"] // Ensure dashboard is always present
            });
        } else {
            setCurrentRole(null);
            setFormData({ name: "", access: ["1", "1.1"] });
        }
        setIsEditOpen(true);
    };

    const handlePermissionToggle = (id) => {
        const idStr = String(id);
        
        const findItem = (list, targetId) => {
            for (const item of list) {
                if (String(item.id) === String(targetId)) return item;
                if (item.child) {
                    const found = findItem(item.child, targetId);
                    if (found) return found;
                }
            }
            return null;
        };

        const targetItem = findItem(masterNavigation, id);
        if (!targetItem) return;

        const getAllDescendantIds = (item) => {
            let ids = [];
            if (item.child) {
                item.child.forEach(c => {
                    ids.push(String(c.id));
                    ids = [...ids, ...getAllDescendantIds(c)];
                });
            }
            return ids;
        };

        const findParentIds = (list, targetId, path = []) => {
            for (const item of list) {
                if (String(item.id) === String(targetId)) return path;
                if (item.child) {
                    const res = findParentIds(item.child, targetId, [...path, String(item.id)]);
                    if (res) return res;
                }
            }
            return null;
        };

        const descendants = getAllDescendantIds(targetItem);
        const parents = findParentIds(masterNavigation, id) || [];

        setFormData(prev => {
            const isSelected = prev.access.includes(idStr);
            let newAccess = [...prev.access];

            if (isSelected) {
                // UNCHECKING: Remove self and all descendants
                newAccess = newAccess.filter(a => a !== idStr && !descendants.includes(a));
            } else {
                // CHECKING: Add self, all descendants, and all parents up the tree
                newAccess = Array.from(new Set([...newAccess, idStr, ...descendants, ...parents]));
            }

            return { ...prev, access: newAccess };
        });
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) return toast.warning("Role name is required");

        try {
            setLoading(true);
            if (currentRole) {
                await put(`/roles/${currentRole.ID}`, formData);
                toast.success("Role updated successfully");
            } else {
                await post("/roles", formData);
                toast.success("New role created successfully");
            }
            setIsEditOpen(false);
            fetchRoles();
        } catch (err) {
            toast.error(err.response?.data || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this role? This action cannot be undone.")) return;
        try {
            await del(`/roles/${id}`);
            toast.success("Role deleted successfully");
            fetchRoles();
        } catch (err) {
            toast.error(err.response?.data || "Deletion failed");
        }
    };

    const renderPermissionSection = (item) => {
        const isHeader = item.isHeadr;
        const idStr = String(item.id);
        const isSelected = formData.access.includes(idStr);

        return (
            <div key={item.id} className="mb-4">
                {isHeader ? (
                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded px-4 text-[11px] font-black uppercase text-slate-400 tracking-widest mb-3">
                        {item.title}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => !["1", "1.1"].includes(idStr) && handlePermissionToggle(item.id)}
                                    className={`h-5 w-5 rounded flex items-center justify-center transition-all border ${isSelected ? 'bg-primary-500 border-primary-500 text-white' : 'border-slate-300 dark:border-slate-600'} ${["1", "1.1"].includes(idStr) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={["1", "1.1"].includes(idStr)}
                                >
                                    {isSelected && <Icon icon="ph:check-bold" className="text-[10px]" />}
                                </button>
                                <span className={`text-[12px] font-bold ${isSelected ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500'}`}>
                                    {item.title} {["1", "1.1"].includes(idStr) && <span className="text-[9px] text-primary-500 ml-1 font-bold italic">(Required)</span>}
                                </span>
                            </div>
                        </div>

                        {item.child && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-8">
                                {item.child.map(child => {
                                    const isChildSelected = formData.access.includes(String(child.id));
                                    return (
                                        <div
                                            key={child.id}
                                            onClick={() => handlePermissionToggle(child.id)}
                                            className={`flex items-center gap-3 p-2.5 px-3 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${isChildSelected ? 'bg-primary-50 border-primary-200 dark:bg-primary-500/10 dark:border-primary-500/30' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}
                                        >
                                            <div className={`h-4 w-4 rounded flex items-center justify-center transition-all border ${isChildSelected ? 'bg-primary-500 border-primary-500 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'} ${["1", "1.1"].includes(String(child.id)) ? 'opacity-50' : ''}`}>
                                                {isChildSelected && <Icon icon="ph:check-bold" className="text-[8px]" />}
                                            </div>
                                            <span className={`text-[12px] font-medium leading-none ${isChildSelected ? 'text-primary-700 dark:text-primary-400 font-bold' : 'text-slate-500'}`}>
                                                {child.childtitle} {["1", "1.1"].includes(String(child.id)) && <span className="text-[8px] text-primary-500 font-bold italic opacity-70">(Required)</span>}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <PageHeader
                icon="ph:shield-check-bold"
                title="Roles & Access"
                description="Manage user roles and granular access permissions for your institution modules."
            >
                <Button
                    text="Create New Role"
                    icon="ph:plus-circle-bold"
                    className="btn-primary"
                    onClick={() => handleOpenModal()}
                />
            </PageHeader>

            <div className="grid grid-cols-1 gap-6">
                <Card title="Institutional Roles List" className="border dark:border-[#2f3336]">
                    <div className="overflow-x-auto -mx-6">
                        <table className="w-full text-left text-[12px] border-separate border-spacing-y-2 px-6">
                            <thead>
                                <tr className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                    <th className="px-4 py-2">Role ID</th>
                                    <th className="px-4 py-2">Role Name</th>
                                    <th className="px-4 py-2">Account Type</th>
                                    <th className="px-4 py-2">Modules Accessible</th>
                                    <th className="px-4 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.map((role) => (
                                    <tr key={role.ID} className="bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                                        <td className="px-4 py-3 font-bold text-slate-500">#{role.ID}</td>
                                        <td className="px-4 py-3 font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{role.Name}</td>
                                        <td className="px-4 py-3">
                                            {role.IsSystem ? (
                                                <Badge label="System Defined" className="badge-soft-primary" />
                                            ) : (
                                                <Badge label="Custom Sub-Admin" className="badge-soft-warning" />
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-500">
                                            {role.Access?.length || 0} Modules Assigned
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                                {Boolean(role.IsSystem) ? (
                                                    <div className="h-8 w-8 rounded flex items-center justify-center text-slate-300">
                                                        <Icon icon="ph:lock-key-bold" />
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleOpenModal(role)}
                                                            className="h-8 w-8 rounded bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-slate-500 hover:text-primary-500 transition-colors"
                                                        >
                                                            <Icon icon="ph:pencil-simple-bold" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(role.ID)}
                                                            className="h-8 w-8 rounded bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-slate-500 hover:text-danger-500 transition-colors"
                                                        >
                                                            <Icon icon="ph:trash-bold" />
                                                        </button>
                                                    </div>
                                                )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <Modal
                title={currentRole ? "Edit Role & Access Control" : "Create New Custom Role"}
                activeModal={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                className="max-w-5xl"
                centered
            >
                <div className="p-2 space-y-6">
                    <Textinput
                        label="Role Name"
                        placeholder="e.g. Finance Head, Junior Registrar"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        icon="ph:identification-card-bold"
                    />

                    <div>
                        <div className="flex items-center justify-between mb-4 pb-2 border-b dark:border-slate-700">
                            <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                                <Icon icon="ph:list-checks-bold" className="text-primary-500" />
                                Granular Permissions Matrix
                            </h5>
                            <div className="text-[10px] bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-bold text-slate-500">
                                {formData.access.length} Selection(s)
                            </div>
                        </div>

                        <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                            {masterNavigation.map(item => renderPermissionSection(item))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 justify-end">
                        <Button
                            text="Discard"
                            className="btn-light"
                            onClick={() => setIsEditOpen(false)}
                        />
                        <Button
                            text={currentRole ? "Save Changes" : "Create Role"}
                            className="btn-primary px-8"
                            onClick={handleSubmit}
                            loading={loading}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default RolesManagement;
