import React, { useRef, useEffect, useState } from "react";
import SidebarLogo from "./Logo";
import Navmenu from "./Navmenu";
import { getNavigationByAccess } from "@/configs/navigation";
import { useSelector } from "react-redux";
import SimpleBar from "simplebar-react";
import useSidebar from "@/hooks/useSidebar";
import useSemiDark from "@/hooks/useSemiDark";
import clsx from "clsx";

const Sidebar = () => {
    const scrollableNodeRef = useRef();
    const [scroll, setScroll] = useState(false);

    // Get user from auth slice
    const { user } = useSelector((state) => state.auth);
    // Get navigation array based on access, fallback to empty array if no access defined
    const menuItems = getNavigationByAccess(user?.Access || []);

    useEffect(() => {
        const handleScroll = () => {
            if (scrollableNodeRef.current.scrollTop > 0) {
                setScroll(true);
            } else {
                setScroll(false);
            }
        };
        scrollableNodeRef.current.addEventListener("scroll", handleScroll);
    }, [scrollableNodeRef]);

    const [collapsed, setMenuCollapsed] = useSidebar();
    const [menuHover, setMenuHover] = useState(false);

    // semi dark option
    const [isSemiDark] = useSemiDark();

    return (
        <div className={isSemiDark ? "dark" : ""}>
            <div
                className={clsx(
                    " sidebar-wrapper bg-white dark:bg-[#111111] border-r dark:border-[#2f3336] shadow-base  ",
                    {
                        "w-[72px] close_sidebar": collapsed,
                        "w-[280px]": !collapsed,
                        "sidebar-hovered": menuHover,
                    }
                )}
                onMouseEnter={() => {
                    setMenuHover(true);
                }}
                onMouseLeave={() => {
                    setMenuHover(false);
                }}
            >
                <SidebarLogo menuHover={menuHover} />
                <div
                    className={`h-[60px]  absolute top-[80px] nav-shadow z-[1] w-full transition-all duration-200 pointer-events-none ${scroll ? " opacity-100" : " opacity-0"
                        }`}
                ></div>

                <SimpleBar
                    className="sidebar-menu  h-[calc(100%-80px)]"
                    scrollableNodeProps={{ ref: scrollableNodeRef }}
                >
                    <Navmenu menus={menuItems} />
                </SimpleBar>
            </div>
        </div>
    );
};

export default Sidebar;
