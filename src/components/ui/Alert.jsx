import React, { useState } from "react";
import Icon from "@/components/ui/Icon";

const Alert = ({
  children,
  className = "alert-primary",
  icon,
  toggle,
  dismissible,
  label,
}) => {
  const [isShow, setIsShow] = useState(true);

  const handleDestroy = () => {
    setIsShow(false);
  };

  return (
    <>
      {isShow ? (
        <div
          className={`alert d-flex align-items-center gap-3 ${
            dismissible || toggle ? "alert-dismissible" : ""
          } ${className}`}
          role="alert"
        >
          {icon && (
            <div className="flex-shrink-0 fs-5">
              <Icon icon={icon} />
            </div>
          )}
          <div className="flex-grow-1">{children ? children : label}</div>
          {dismissible && (
            <button
              type="button"
              className="btn-close shadow-none"
              onClick={handleDestroy}
              aria-label="Close"
            ></button>
          )}
          {toggle && (
            <button
              type="button"
              className="btn-close shadow-none"
              onClick={toggle}
              aria-label="Close"
            ></button>
          )}
        </div>
      ) : null}
    </>
  );
};

export default Alert;

