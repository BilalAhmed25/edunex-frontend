import React from "react";
import Icon from "@/components/ui/Icon";
const Textarea = ({
  label,
  placeholder,
  classLabel = "",
  className = "",
  classGroup = "",
  register,
  name,
  readonly,
  dvalue,
  error,
  icon,
  disabled,
  id,
  horizontal,
  validate,
  description,
  cols,
  row = 3,
  onChange,
  ...rest
}) => {
  return (
    <div
      className={`textfiled-wrapper  ${error ? "is-error" : ""}  ${horizontal ? "flex w-full items-start" : ""
        }  ${validate ? "is-valid" : ""} `}
    >
      <div className={`relative w-full ${horizontal ? "flex-1" : ""}`}>
        {name && (
          <textarea
            {...register(name)}
            {...rest}
            className={`${error ? " is-error" : " "
              } text-control py-2 peer ${className}  `}
            placeholder={label ? " " : placeholder}
            readOnly={readonly}
            disabled={disabled}
            id={id}
            cols={cols}
            rows={row}
            onChange={onChange}
          ></textarea>
        )}
        {!name && (
          <textarea
            className={`${error ? " is-error" : " "
              } text-control p-3 peer ${className}  `}
            placeholder={label ? " " : placeholder}
            readOnly={readonly}
            disabled={disabled}
            id={id}
            cols={cols}
            rows={row}
            onChange={onChange}
          ></textarea>
        )}

        {/* Floating Label */}
        {label && (
          <label
            htmlFor={id}
            className={`absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-slate-800 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-6 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 ltr:left-2 rtl:right-2 pointer-events-none ${classLabel}`}
          >
            {label}
          </label>
        )}

        {/* icon */}
        <div className="flex text-xl absolute ltr:right-[14px] rtl:left-[14px] top-6 -translate-y-1/2  space-x-1 rtl:space-x-reverse">
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

export default Textarea;
