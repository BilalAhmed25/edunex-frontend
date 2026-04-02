import React from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/Icon";
import useDarkMode from "@/hooks/useDarkMode";
import useSidebar from "@/hooks/useSidebar";
import useSemiDark from "@/hooks/useSemiDark";

// import images
import MobileLogo from "@/assets/images/logo/Edunex-Square-Logo.png";
import MobileLogoWhite from "@/assets/images/logo/Edunex-Square-Logo.png";

const SidebarLogo = ({ menuHover }) => {
    const [isDark] = useDarkMode();
    const [collapsed, setMenuCollapsed] = useSidebar();
    // semi dark
    const [isSemiDark] = useSemiDark();

    return (
        <div className={` logo-segment flex justify-between items-center bg-white dark:bg-gray-800 z-[9] py-2 px-4 mb-2 ${menuHover ? "logo-hovered" : ""}`}>
            <Link to="/dashboard">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className="logo-icon h-[50px]">
                        {!isDark && !isSemiDark ? (
                            <img src={MobileLogo} alt="" className=" h-full" />
                        ) : (
                            <img src={MobileLogoWhite} alt="" className=" h-full" />
                        )}
                    </div>

                    {(!collapsed || menuHover) && (
                        <div>
                            <h1 className="text-[22px] font-medium  " style={{ marginTop: '-4px', marginBottom: '-6px' }}>edunex</h1>
                            <p className="text-[10px] text-gray-400 font-medium -mt-1 leading-none block">Your digital partner</p>
                        </div>
                    )}
                </div>
            </Link>

            {(!collapsed || menuHover) && (
                <div
                    onClick={() => setMenuCollapsed(!collapsed)}
                    className={`h-4 w-4 border-[1px] border-gray-900 dark:border-gray-700 rounded-full transition-all duration-150 ${collapsed ? "" : "ring-1 ring-inset ring-offset-[4px] ring-gray-900 dark:ring-gray-400 bg-gray-900 dark:bg-gray-400 dark:ring-offset-gray-700"}`}
                ></div>
            )}
        </div>
    );
};

export default SidebarLogo;
