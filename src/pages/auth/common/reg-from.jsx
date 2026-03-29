import React, { useState } from "react";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { useNavigate } from "react-router-dom";
import Checkbox from "@/components/ui/Checkbox";
import { useRegisterUserMutation } from "@/store/api/auth/authApiSlice";
import { toast } from "react-toastify";

const RegForm = () => {
    const [registerUser, { isLoading }] = useRegisterUserMutation();
    const [checked, setChecked] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = "Name is Required";
        if (!formData.email) {
            newErrors.email = "Email is Required";
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = "Invalid email";
        }
        if (!formData.password) {
            newErrors.password = "Please enter password";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (!checked) {
            toast.warning("Please agree with privacy policy");
            return;
        }

        try {
            const response = await registerUser(formData);
            if (response.error) {
                throw new Error(response.error.message || "Registration failed");
            }
            navigate("/");
            toast.success("Added Successfully");
        } catch (error) {
            console.log(error);
            const errorMessage = error.message || "An error occurred. Please try again later.";
            toast.error(errorMessage);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-3">
            <Textinput
                name="name"
                type="text"
                prepend={<Icon icon="ph:user" />}
                label="Full Name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                disabled={isLoading}
            />
            <Textinput
                name="email"
                type="email"
                prepend={<Icon icon="ph:envelope-simple" />}
                label="Email address"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                disabled={isLoading}
            />
            <Textinput
                name="password"
                type="password"
                prepend={<Icon icon="ph:lock-simple" />}
                label="Password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                disabled={isLoading}
                hasicon
            />
            <Checkbox
                label="I agree with privacy policy"
                value={checked}
                id="privacy-policy"
                onChange={() => setChecked(!checked)}
            />

            <Button
                type="submit"
                text="Create an account"
                id="reg-submit"
                className="btn btn-primary block w-full text-center"
                isLoading={isLoading}
            />
        </form>
    );
};

export default RegForm;
