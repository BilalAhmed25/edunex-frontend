import React from "react";

const Card = ({
  children,
  title,
  subtitle,
  headerslot,
  className = "",
  bodyClass = "p-4",
  noborder,
  titleClass = "",
  headerClass = "",
}) => {
  return (
    <div
      className={`card ${noborder ? "border-0 shadow-none" : "shadow-sm border-light"} ${className}`}
    >
      {(title || subtitle || headerslot) && (
        <div
          className={`card-header bg-transparent d-flex align-items-center justify-content-between ${headerClass}`}
        >
          <div>
            {title && <h5 className={`card-title mb-0 ${titleClass}`}>{title}</h5>}
            {subtitle && <p className="card-subtitle mt-1 text-muted small mb-0">{subtitle}</p>}
          </div>
          {headerslot && <div className="card-header-slot">{headerslot}</div>}
        </div>
      )}
      <div className={`card-body ${bodyClass}`}>{children}</div>
    </div>
  );
};

export default Card;

