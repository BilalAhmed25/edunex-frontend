import React from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { Link, useLocation } from "react-router-dom";

const PageHeader = ({
    title,
    description,
    icon = "heroicons-outline:home",
    buttonText,
    buttonIcon = "heroicons-outline:plus",
    onButtonClick,
    children
}) => {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);

    return (
        <div className="flex flex-col md:flex-row items-center justify-between py-2 md:mb-6 gap-3 md:gap-0">
            <div className="flex items-center gap-4 w-full md:w-auto">
                {/* Icon Box */}
                <div className="h-12 w-12 flex-none flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-blue-500 shadow-lg shadow-primary-500/30 text-white transition-transform hover:scale-110 duration-300">
                    <Icon icon={icon} className="text-2xl" />
                </div>

                {/* Title & Description */}
                <div className="flex-1">
                    <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white leading-none mb-1 text-muted">
                        {title}
                    </h2>
                    {description && (
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px] md:max-w-none opacity-80">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 w-full md:w-auto justify-end">
                {/* Custom Children (like Filters) */}
                {children}

                {/* Breadcrumbs */}
                <div className="hidden lg:flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    <Link to="/dashboard" className="hover:text-primary-500 transition-colors flex items-center gap-1.5">
                        <Icon icon="heroicons-outline:home" className="text-sm" />
                    </Link>
                    {pathnames.map((name, index) => {
                        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                        const isLast = index === pathnames.length - 1;
                        return (
                            <React.Fragment key={name}>
                                <span className="opacity-40">/</span>
                                {isLast ? (
                                    <span className="text-slate-900 dark:text-white">{name.replace("-", " ")}</span>
                                ) : (
                                    <Link to={routeTo} className="hover:text-primary-500 transition-colors text-slate-400 dark:text-slate-500">
                                        {name.replace("-", " ")}
                                    </Link>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Action Button */}
                {buttonText && (
                    <Button
                        text={buttonText}
                        icon={buttonIcon}
                        className="btn-primary px-6 py-2.5 rounded-lg text-xs transition-all hover:scale-[1.02] active:scale-[0.95]"
                        onClick={onButtonClick}
                    />
                )}
            </div>
        </div>
    );
};

export default PageHeader;
