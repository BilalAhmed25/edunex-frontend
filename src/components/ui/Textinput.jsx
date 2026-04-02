import React, { useState } from "react";
import Icon from "@/components/ui/Icon";
import Cleave from "cleave.js/react";
import "cleave.js/dist/addons/cleave-phone.us";

const Textinput = ({
    type = "text",
    label,
    placeholder,
    className = "",
    classGroup = "",
    register,
    name,
    error,
    icon,
    prepend,
    append,
    hasicon, // Password visibility toggle
    isMask,
    options,
    value,
    onChange,
    id,
    disabled,
    readonly,
    validate,
    description,
    ...rest
}) => {
    const [showPassword, setShowPassword] = useState(false);

    // Determine input component and ID
    const InputComponent = isMask ? Cleave : "input";
    const inputId = id || name;

    // Default placeholder to a single space if label is present to trigger floating animation
    const effectivePlaceholder = placeholder || (label ? " " : "");

    // Logic for leading icon/prepend
    const leadingIcon = icon || (prepend && React.isValidElement(prepend) && prepend.type === Icon ? prepend.props.icon : null);

    return (
        <div className={`${classGroup}`}>
            <div className="position-relative">
                <div
                    className={`form-floating edunex-floating 
                        ${(leadingIcon || prepend) ? "has-leading-icon" : ""} 
                        ${(hasicon || error || validate || append) ? "has-trailing-icons" : ""}`}
                >
                    {/* Leading Element */}
                    {(leadingIcon || prepend) && (
                        <span className="position-absolute start-0 top-50 translate-middle-y ms-3.5 text-slate-400 dark:text-slate-500 z-2 flex items-center pointer-events-none">
                            {leadingIcon ? <Icon icon={leadingIcon} className="w-5 h-5" /> : prepend}
                        </span>
                    )}

                    <InputComponent
                        type={type === "password" && showPassword ? "text" : type}
                        id={inputId}
                        name={name}
                        value={value}
                        placeholder={effectivePlaceholder}
                        readOnly={readonly}
                        disabled={disabled}
                        className={`form-control text-[12px] poppins text-slate-700 dark:text-slate-100 ${error ? "is-invalid" : ""} ${validate ? "is-valid" : ""} ${className}`}
                        onChange={onChange}
                        {...(isMask ? { options } : {})}
                        {...(register && name ? register(name) : {})} // Minimal react-hook-form support
                        {...rest}
                        style={{ fontSize: '13px' }}
                    />

                    {label && (
                        <label htmlFor={inputId} className="text-slate-500 dark:text-slate-400 text-[12px] transition-all duration-200" style={{ marginTop: '2px' }}>
                            {label}
                        </label>
                    )}

                    {/* Trailing Elements */}
                    <div className="position-absolute end-0 top-50 translate-middle-y me-3 d-flex align-items-center gap-2 z-2">
                        {hasicon && type === "password" && (
                            <span
                                className="cursor-pointer text-muted"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <Icon
                                    icon={showPassword ? "heroicons-outline:eye" : "heroicons-outline:eye-off"}
                                    style={{ fontSize: "1.25rem" }}
                                />
                            </span>
                        )}

                        {append && <span className="text-muted border-start ps-2">{append}</span>}
                        {error && <span className="text-danger"><Icon icon="ph:info-fill" style={{ fontSize: "1.25rem" }} /></span>}
                        {validate && <span className="text-success"><Icon icon="ph:check-circle-fill" style={{ fontSize: "1.25rem" }} /></span>}
                    </div>
                </div>

                {error && <div className="invalid-feedback d-block mt-1">{error.message || error}</div>}
                {validate && <div className="valid-feedback d-block mt-1">{validate}</div>}
                {description && <div className="form-text text-muted mt-1 small">{description}</div>}
            </div>
        </div>
    );
};

export default Textinput;
