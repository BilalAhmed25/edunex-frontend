import React, { useState, useEffect } from "react";
import { get, post } from "@/lib/apiClient";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Textinput from "@/components/ui/Textinput";
import Select from "react-select";
import { toast } from "react-toastify";

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

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
      const [staffRes, rolesRes] = await Promise.all([
        get("/users/staff"),
        get("/roles")
      ]);

      if (staffRes?.data) setStaffList(staffRes.data);
      if (rolesRes?.data) {
        setRoles(rolesRes.data.map(r => ({ value: r.ID, label: r.Name })));
      }
    } catch (err) {
      toast.error("Failed to load staff metadata");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) return toast.error("Please select a role");

    const payload = { ...formData, roleId: selectedRole.value };

    try {
      await post("/users/staff", payload);
      toast.success("Staff added successfully");
      setIsOpen(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: ""
      });
      setSelectedRole(null);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to create staff member");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center px-4">
        <h4 className="card-title text-xl font-medium">Administration Staff List</h4>
        <Button text="Add Staff" className="btn-primary" onClick={() => setIsOpen(true)} />
      </div>

      <div className="card p-6 border dark:border-gray-700">
        {loading ? <p>Loading users...</p> : staffList.length === 0 ? <p>No staff found.</p> : (
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="table-th text-left p-4">Name</th>
                <th className="table-th text-left p-4">Email</th>
                <th className="table-th text-left p-4">Role</th>
                <th className="table-th text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-800 dark:divide-gray-700">
              {staffList.map((user) => (
                <tr key={user.UserID} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="table-td p-4">{user.FirstName} {user.LastName}</td>
                  <td className="table-td p-4">{user.Email}</td>
                  <td className="table-td p-4"><Badge label={user.RoleName} className="bg-slate-900 text-white" /></td>
                  <td className="table-td p-4">
                    <Badge label={user.Status} className={user.Status === 'active' ? "bg-success-500 text-white" : "bg-danger-500 text-white"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal title="Onboard New Staff" activeModal={isOpen} onClose={() => setIsOpen(false)}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Textinput name="firstName" label="First Name" placeholder="John" value={formData.firstName} onChange={handleChange} required />
            <Textinput name="lastName" label="Last Name" placeholder="Doe" value={formData.lastName} onChange={handleChange} required />
          </div>
          <Textinput type="email" name="email" label="Email Address" placeholder="staff@school.edu" value={formData.email} onChange={handleChange} required />
          <Textinput type="password" name="password" label="Temporary Password" value={formData.password} onChange={handleChange} required />

          <div>
            <label className="form-label mb-2 block">Assign Role</label>
            <Select options={roles} onChange={setSelectedRole} value={selectedRole} className="react-select" classNamePrefix="select" />
          </div>

          <Button type="submit" className="btn-primary block w-full text-center mt-5" text="Create Staff Account" />
        </form>
      </Modal>
    </div>
  );
};

export default Staff;
