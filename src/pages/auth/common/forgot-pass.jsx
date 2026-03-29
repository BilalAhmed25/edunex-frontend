import React, { useState } from "react";
import Textinput from "@/components/ui/Textinput";

const ForgotPass = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const validate = () => {
        if (!email) {
            setError("Email is required.");
            return false;
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
            setError("Invalid email address.");
            return false;
        }
        setError("");
        return true;
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            console.log({ email });
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <Textinput
                name="email"
                label="Email address"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
            />

            <button type="submit" className="btn btn-primary block w-full text-center">
                Send recovery email
            </button>
        </form>
    );
};

export default ForgotPass;
