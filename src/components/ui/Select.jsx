import React from "react";
import ReactSelect from "react-select";

const Select = ({
    label,
    options,
    value,
    onChange,
    isMulti = false,
    placeholder = "Select...",
    error,
    description,
    ...rest
}) => {
    const customStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '58px',
            borderRadius: '8px',
            border: state.isFocused ? '1px solid #4F46E5 !important' : '1px solid #e2e8f0 !important',
            boxShadow: state.isFocused ? '0 0 0 1px #4F46E5 shadow-sm' : 'none',
            backgroundColor: '#ffffff', // Explicit white for light theme
            transition: 'all 0.2s ease',
            '&:hover': {
                borderColor: '#cbd5e1 !important'
            }
        }),
        singleValue: (base) => ({
            ...base,
            color: '#1e293b',
            fontSize: '13px',
            fontWeight: '500',
            paddingTop: '12px' // Push down to make room for absolute label if needed
        }),
        valueContainer: (base) => ({
            ...base,
            padding: '16px 12px 6px 8px'
        }),
        placeholder: (base) => ({
            ...base,
            fontSize: '13px',
            color: '#94a3b8',
            paddingTop: '12px' // Align with value
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: '#ffffff',
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
        <div className="mb-4 group relative">
            <div className="relative flex flex-col justify-end min-h-[58px]">
                {label && (
                    <label className="absolute top-2 left-3 z-10 text-[11px] tracking-widest text-slate-400 dark:text-slate-500 transition-all duration-200">
                        {label}
                    </label>
                )}
                <ReactSelect
                    options={options}
                    value={value}
                    onChange={onChange}
                    isMulti={isMulti}
                    placeholder={placeholder}
                    styles={customStyles}
                    classNamePrefix="edunex-select"
                    className="edunex-select-container poppins h-full"
                    {...rest}
                />
            </div>
            {error && <div className="text-danger-500 text-[11px] mt-1.5 font-bold flex items-center gap-1">
                <span className="w-1 h-1 bg-danger-500 rounded-full" /> {error}
            </div>}
            {description && <div className="text-slate-400 text-[10px] mt-1.5 poppins font-medium italic opacity-80">{description}</div>}
        </div>
    );
};

export default Select;
