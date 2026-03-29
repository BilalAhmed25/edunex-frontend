import React, { Fragment } from "react";
import Icon from "@/components/ui/Icon";
const Select = ({
  label,
  placeholder = "Select Option",
  classLabel = "",
  className = "",
  classGroup = "",
  register,
  name,
  readonly,
  value,
  error,
  icon,
  disabled,
  id,
  horizontal,
  validate,
  description,
  onChange,
  options,
  defaultValue,
  size,
  multiple,
  children,
  ...rest
}) => {
  options = options || Array(3).fill("option");
  return (
    <div
      className={`textfiled-wrapper  ${error ? "is-error" : ""}  ${
        horizontal ? "flex w-full items-center" : ""
      }  ${validate ? "is-valid" : ""} `}
    >
      <div className={`relative w-full ${horizontal ? "flex-1" : ""}`}>
        {/* Leading Icon */}
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">
            <Icon icon={icon} />
          </span>
        )}
        
        {name && (
          <select
            onChange={onChange}
            {...register(name)}
            {...rest}
            multiple={multiple}
            className={`${
              error ? " is-error" : " "
            } text-control min-h-[56px] pt-6 pb-2 px-4 ${icon ? "pl-12" : ""} rounded-xl peer appearance-none ${className}  `}
            placeholder={placeholder}
            readOnly={readonly}
            disabled={disabled}
            id={id}
            value={value}
            size={size}
            defaultValue={defaultValue}
          >
            {children ? (
              children
            ) : (
              <Fragment>
                <option value="" disabled>
                  {placeholder}
                </option>
                {options.map((option, i) => (
                  <Fragment key={i}>
                    {option.value && option.label ? (
                      <option key={i} value={option.value}>
                         {option.label}
                      </option>
                    ) : (
                      <option key={i} value={option}>
                        {option}
                      </option>
                    )}
                  </Fragment>
                ))}
              </Fragment>
            )}
          </select>
        )}
        {!name && (
          <select
            onChange={onChange}
            multiple={multiple}
            className={`${
              error ? " is-error" : " "
            } text-control min-h-[56px] pt-6 pb-2 px-4 ${icon ? "pl-12" : ""} rounded-xl peer appearance-none ${className}  `}
            placeholder={placeholder}
            readOnly={readonly}
            disabled={disabled}
            id={id}
            value={value}
            size={size}
            defaultValue={defaultValue}
          >
            {children ? (
              children
            ) : (
              <Fragment>
                <option value="" disabled>
                  {placeholder}
                </option>
                {options.map((option, i) => (
                  <Fragment key={i}>
                    {option.value && option.label ? (
                      <option key={i} value={option.value}>
                        {option.label}
                      </option>
                    ) : (
                      <option key={i} value={option}>
                        {option}
                      </option>
                    )}
                  </Fragment>
                ))}
              </Fragment>
            )}
          </select>
        )}

        {/* Internal Floating Label (Fixed at top for Select) */}
        {label && (
          <label
            htmlFor={id}
            className={`absolute text-[10px] font-semibold text-gray-400 duration-300 transform top-4 z-10 origin-[0] ltr:left-4 rtl:right-4 ${icon ? "ltr:left-12 rtl:right-12" : ""} capitalize pointer-events-none ${classLabel}`}
          >
            {label}
          </label>
        )}

        {/* Trailing icons */}
        <div className="flex text-xl absolute ltr:right-[14px] rtl:left-[14px] top-1/2 -translate-y-1/2  space-x-1 rtl:space-x-reverse">
          <span className=" relative -right-2 inline-block text-gray-900 dark:text-gray-300 pointer-events-none">
            <Icon icon="heroicons:chevron-down" />
          </span>
          {error && (
            <span className="text-red-500">
              <Icon icon="ph:info-fill" />
            </span>
          )}
          {validate && (
            <span className="text-green-500">
              <Icon icon="ph:check-circle-fill" />
            </span>
          )}
        </div>
      </div>
      {/* error and success message*/}
      {error && (
        <div className="mt-2 text-red-600 block text-sm">{error.message}</div>
      )}
      {/* validated and success message*/}
      {validate && (
        <div className="mt-2 text-green-600 block text-sm">{validate}</div>
      )}
      {/* only description */}
      {description && <span className="input-help">{description}</span>}
    </div>
  );
};

export default Select;
