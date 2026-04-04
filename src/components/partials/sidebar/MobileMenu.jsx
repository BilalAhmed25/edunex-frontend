import React, { useRef, useEffect, useState } from "react";
import Navmenu from "./Navmenu";
import { getNavigationByAccess } from "@/configs/navigation";
import { useSelector } from "react-redux";
import SimpleBar from "simplebar-react";
import useSemiDark from "@/hooks/useSemiDark";
import useDarkMode from "@/hooks/useDarkMode";
import { Link } from "react-router-dom";
import useMobileMenu from "@/hooks/useMobileMenu";
import Icon from "@/components/ui/Icon";

// import images
import MobileLogo from "@/assets/images/logo/Edunex-Square-Logo.png";
import MobileLogoWhite from "@/assets/images/logo/Edunex-Square-Logo.png";

const MobileMenu = ({ className = "custom-class" }) => {
  const scrollableNodeRef = useRef();
  const [scroll, setScroll] = useState(false);

  // Get user from auth slice
  const { user } = useSelector((state) => state.auth);
  // Get navigation array based on access, fallback to empty array if no access defined
  const menuItems = getNavigationByAccess(user?.Access || []);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollableNodeRef.current && scrollableNodeRef.current.scrollTop > 0) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    };
    if (scrollableNodeRef.current) {
      scrollableNodeRef.current.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (scrollableNodeRef.current) {
        scrollableNodeRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [scrollableNodeRef]);

  const [isSemiDark] = useSemiDark();
  const [isDark] = useDarkMode();
  const [mobileMenu, setMobileMenu] = useMobileMenu();

  return (
    <div className={isSemiDark ? "dark" : ""}>
      <div
        className={`${className} fixed top-0 bg-white dark:bg-[#111111] border-r dark:border-[#2f3336] shadow-lg h-full w-[280px] z-[9999]`}
      >
        <div className="logo-segment flex justify-between items-center bg-white dark:bg-gray-800 z-[9] py-2 px-4 mb-2">
          <Link to="/dashboard">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="logo-icon h-[42px]">
                {!isDark && !isSemiDark ? (
                  <img src={MobileLogo} alt="" className="h-full" />
                ) : (
                  <img src={MobileLogoWhite} alt="" className="h-full" />
                )}
              </div>
              <div>
                <h1 className="text-[20px] font-medium" style={{ marginTop: '-4px', marginBottom: '-6px' }}>edunex</h1>
                <p className="text-[9px] text-gray-400 font-medium -mt-1 leading-none block">Your digital partner</p>
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenu(!mobileMenu)}
            className="cursor-pointer text-gray-900 dark:text-white text-2xl"
          >
            <Icon icon="heroicons:x-mark" />
          </button>
        </div>

        <div
          className={`h-[60px] absolute top-[80px] z-[1] w-full transition-all duration-200 pointer-events-none ${scroll ? " opacity-100" : " opacity-0"}`}
        ></div>
        <SimpleBar
          className="sidebar-menu h-[calc(100%-80px)]"
          scrollableNodeProps={{ ref: scrollableNodeRef }}
        >
          <Navmenu menus={menuItems} />
        </SimpleBar>
      </div>
    </div>
  );
};

export default MobileMenu;

