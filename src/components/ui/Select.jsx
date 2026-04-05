import React from "react";
import ReactSelect from "react-select";
import Icon from "@/components/ui/Icon";

const Select = ({
    label,
    options,
    value,
    onChange,
    isMulti = false,
    placeholder = "Select...",
    error,
    description,
    icon,
    ...rest
}) => {
    const customStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '58px',
            borderRadius: '12px', // Slightly more rounded for premium feel
            border: state.isFocused ? '1px solid #4F46E5 !important' : '1px solid #e2e8f0 !important',
            boxShadow: state.isFocused ? '0 0 0 1px #4F46E5 shadow-sm' : 'none',
            backgroundColor: 'transparent',
            transition: 'all 0.2s ease',
            '&:hover': {
                borderColor: '#cbd5e1 !important'
            }
        }),
        singleValue: (base) => ({
            ...base,
            color: 'inherit',
            fontSize: '13px',
            paddingTop: '16px',
            marginLeft: '0px'
        }),
        valueContainer: (base) => ({
            ...base,
            // padding: '12px 12px 0px 10px',
            paddingLeft: icon ? '44px' : '12px'
        }),
        placeholder: (base) => ({
            ...base,
            fontSize: '13px',
            color: '#94a3b8',
            paddingTop: '14px',
            // paddingLeft: icon ? '32px' : '0px'
            marginLeft: '0px'
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: 'var(--select-menu-bg, #ffffff)',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '6px',
            border: '1px solid #f1f5f9',
            zIndex: 9999
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#4F46E5' : state.isFocused ? '#f8fafc' : 'transparent',
            color: state.isSelected ? '#ffffff' : '#334155',
            fontSize: '13px',
            fontWeight: state.isSelected ? '600' : '500',
            padding: '10px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            margin: '2px 0'
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: '#f1f5f9',
            borderRadius: '6px',
            marginTop: '12px'
        }),
        multiValueLabel: (base) => ({
            ...base,
            fontSize: '11px',
            fontWeight: '600',
            color: '#475569'
        }),
        dropdownIndicator: (base) => ({
            ...base,
            color: '#94a3b8',
            '&:hover': { color: '#64748b' }
        }),
        indicatorSeparator: () => ({ display: 'none' })
    };

    return (
        <div className="group relative">
            <div className={`relative min-h-[58px] border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#111111] text-slate-700 dark:text-slate-100`}>
                {label && (
                    <label className={`absolute top-2 z-10 text-[10px] text-slate-500 dark:text-slate-600 transition-all duration-200 pointer-events-none ${icon ? 'left-11' : 'left-3'}`}>
                        {label}
                    </label>
                )}

                {icon && (
                    <div className="absolute left-3.5 bottom-[14px] top-[18px] text-slate-400 dark:text-slate-500 z-20 pointer-events-none">
                        <Icon icon={icon} className="w-5 h-5" />
                    </div>
                )}

                <ReactSelect
                    options={options}
                    value={value}
                    onChange={onChange}
                    isMulti={isMulti}
                    placeholder={placeholder}
                    styles={customStyles}
                    classNamePrefix="edunex-select"
                    className="edunex-select-container  h-full no-border"
                    {...rest}
                />
            </div>
            {error && <div className="text-danger-500 text-[11px] mt-1.5 font-bold flex items-center gap-1 pl-1">
                <Icon icon="ph:info-fill" className="w-3.5 h-3.5" /> {error}
            </div>}
            {description && <div className="text-slate-400 text-[10px] mt-1.5  font-medium italic opacity-80 pl-1">{description}</div>}
        </div>
    );
};

export default Select;
