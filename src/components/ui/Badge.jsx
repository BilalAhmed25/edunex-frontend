import React from "react";
import Icon from "@/components/ui/Icon";

const Badge = ({
  className = "bg-primary text-white",
  label,
  icon,
  children,
}) => {
  return (
    <span className={`badge d-inline-flex align-items-center ${className}`}>
      {!children && (
        <>
          {icon && (
            <span className="me-1 d-flex align-items-center">
              <Icon icon={icon} />
            </span>
          )}
          {label}
        </>
      )}
      {children}
    </span>
  );
};

export default Badge;

