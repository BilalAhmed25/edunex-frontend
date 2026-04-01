import React, { useState, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import SwitchDark from "./Tools/SwitchDark";
import HorizentalMenu from "./Tools/HorizentalMenu";
import useWidth from "@/hooks/useWidth";
import useSidebar from "@/hooks/useSidebar";
import useMenulayout from "@/hooks/useMenulayout";
import Logo from "./Tools/Logo";
import SearchBox from "./Tools/SearchBox";
import Profile from "./Tools/Profile";
import Notification from "./Tools/Notification";
import Message from "./Tools/Message";
import Language from "./Tools/Language";
import useRtl from "@/hooks/useRtl";
import useMobileMenu from "@/hooks/useMobileMenu";
import Settings from "./Tools/Settings";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { motion, useAnimation } from "framer-motion";
import clsx from "clsx";

const Header = ({ className = "custom-class" }) => {
    const [sticky, setSticky] = useState(true);
    const [collapsed, setMenuCollapsed] = useSidebar();
    const { width, breakpoints } = useWidth();
    const [menuType] = useMenulayout();
    const [isRtl] = useRtl();
    const [mobileMenu, setMobileMenu] = useMobileMenu();

    const handleOpenMobileMenu = () => {
        setMobileMenu(!mobileMenu);
    };

    return (
        <header
            className={clsx(
                className,
                "transition-all duration-300 has-sticky-header"
            )}
        >
            <div
                className={clsx(
                    "app-header transition-all duration-300",
                    {
                        // 1. Removed pt-6 to ensure it starts exactly at the top
                        // 2. Added w-full to ensure edge-to-edge background
                        "bg-white dark:bg-[#111111] shadow-base w-full border-b dark:border-[#2f3336]": sticky,
                        "bg-transparent w-full": !sticky && menuType === "vertical",
                        "horizontal_menu bg-white dark:bg-[#111111] shadow-base w-full border-b dark:border-[#2f3336]":
                            menuType === "horizontal" && width > breakpoints.xl,
                        "vertical_menu w-full": menuType === "vertical",
                        "py-3": sticky, // Standard height when scrolling
                        "py-4": !sticky, // Slightly taller when at rest (optional)
                    }
                )}
            >
                <div className="flex justify-between items-center h-full relative px-4 md:px-6">
                    {/* For Vertical  */}
                    {menuType === "vertical" && (
                        <div className="flex items-center md:space-x-4 space-x-2 rtl:space-x-reverse">
                            {/* Toggle Sidebar Icon (Useful for Top Bar) */}
                            <div
                                className="cursor-pointer text-slate-900 dark:text-white text-2xl hidden xl:block"
                                onClick={() => setMenuCollapsed(!collapsed)}
                            >
                                <Icon icon={collapsed ? "heroicons-outline:menu-alt-2" : "heroicons-outline:menu"} />
                            </div>

                            {width < breakpoints.xl && <Logo />}
                            <SearchBox />
                        </div>
                    )}

                    {/* For Horizontal  */}
                    {menuType === "horizontal" && (
                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                            <Logo />
                            {width <= breakpoints.xl && (
                                <div
                                    className="cursor-pointer text-gray-900 dark:text-white text-2xl"
                                    onClick={handleOpenMobileMenu}
                                >
                                    <Icon icon="heroicons-outline:menu-alt-3" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Horizontal Main Menu */}
                    {menuType === "horizontal" && width >= breakpoints.xl && (
                        <HorizentalMenu />
                    )}

                    {/* Nav Tools */}
                    <div className="nav-tools flex items-center lg:space-x-6 space-x-3 rtl:space-x-reverse">
                        <SwitchDark />
                        <Profile sticky={sticky} />

                        {/* Mobile Menu Toggle */}
                        <div
                            className="cursor-pointer text-gray-900 dark:text-white text-2xl xl:hidden block"
                            onClick={handleOpenMobileMenu}
                        >
                            <Icon icon="heroicons-outline:menu-alt-3" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
