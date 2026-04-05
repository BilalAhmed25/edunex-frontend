import React from "react";
import Icon from "@/components/ui/Icon";
import { Link } from "react-router-dom";

function Button({
	text,
	type = "button",
	isLoading,
	disabled,
	className = "btn-primary",
	children,
	icon,
	loadingClass = "text-light",
	iconPosition = "left",
	iconClass = "fs-7",
	link,
	onClick,
	div,
	width,
	rotate,
	hFlip,
	vFlip,
}) {
	const commonClasses = `btn d-inline-flex justify-content-center align-items-center ${disabled || isLoading ? "disabled cursor-not-allowed" : ""} ${className}`;

	const renderContent = () => (
		<>
			{isLoading ? (
				<span className="d-flex align-items-center">
					<span
						className={`spinner-border spinner-border-sm me-2 ${loadingClass}`}
						role="status"
						aria-hidden="true"
					></span>
					<span>{text || "Please wait..."}</span>
				</span>
			) : (
				<>
					{children || (
						<span className="d-flex align-items-center">
							{icon && (
								<span className={` ${iconPosition === "right" ? "order-1 ms-2" : ""} ${text && iconPosition === "left" ? "me-2" : ""} ${iconClass}`}>
									<Icon
										icon={icon}
										width={width}
										rotate={rotate}
										hFlip={hFlip}
										vFlip={vFlip}
									/>
								</span>
							)}
							{text && <span>{text}</span>}
						</span>
					)}
				</>
			)}
		</>
	);

	if (link && !div) {
		return (
			<Link
				to={link}
				className={commonClasses}
				onClick={onClick}
				tabIndex={disabled || isLoading ? -1 : undefined}
				aria-disabled={disabled || isLoading}
			>
				{renderContent()}
			</Link>
		);
	}

	if (div) {
		return (
			<div
				className={commonClasses}
				onClick={!disabled && !isLoading ? onClick : undefined}
				role="button"
				tabIndex={disabled || isLoading ? -1 : 0}
				aria-disabled={disabled || isLoading}
			>
				{renderContent()}
			</div>
		);
	}

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled || isLoading}
			className={commonClasses}
		>
			{renderContent()}
		</button>
	);
}

export default Button;