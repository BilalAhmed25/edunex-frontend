import React, { useState } from "react";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { useNavigate } from "react-router-dom";
import Checkbox from "@/components/ui/Checkbox";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setUser } from "@/store/api/auth/authSlice";
import { post } from "@/lib/apiClient";

const LoginForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({});

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Basic real-time validation clear
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = "Email is required.";
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = "Invalid email address.";
        }
        if (!formData.password) {
            newErrors.password = "Password is required.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setIsLoading(true);
            const response = await post("/auth/login", formData);
            const data = response.data || response;

            dispatch(setUser(data.user));
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.token);
            navigate("/dashboard");
        } catch (error) {
            toast.error(error?.data?.message || "Failed to login. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    const [checked, setChecked] = useState(false);

    return (
        <form onSubmit={onSubmit} className="row g-0">
            <div className="col-12 mb-2">
                <Textinput
                    name="email"
                    type="email"
                    label="Email address"
                    prepend={<Icon icon="ph:envelope-open" />}
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email ? { message: errors.email } : null}
                    disabled={isLoading}
                />
            </div>
            <div className="col-12 mb-2">
                <Textinput
                    name="password"
                    label="Password"
                    type="password"
                    prepend={<Icon icon="ph:lock-simple" />}
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password ? { message: errors.password } : null}
                    disabled={isLoading}
                    hasicon
                />
            </div>

            <div className="col-12 d-flex justify-content-between align-items-center mb-4">
                <Checkbox
                    value={checked}
                    onChange={() => setChecked(!checked)}
                    id="remember-me"
                    label="Remember me"
                />
                <Link
                    to="/forgot-password"
                    className="small text-muted text-decoration-none"
                >
                    Forgot Password?
                </Link>
            </div>

            <div className="col-12">
                <Button
                    type="submit"
                    text="Sign in"
                    id="login-submit"
                    className="btn btn-primary w-100 py-3"
                    isLoading={isLoading}
                />
            </div>
        </form>
    );
};

export default LoginForm;
