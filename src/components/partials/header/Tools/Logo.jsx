import React from "react";
import useDarkMode from "@/hooks/useDarkMode";
import { Link } from "react-router-dom";
import useWidth from "@/hooks/useWidth";

import MainLogo from "@/assets/images/logo/Edunex-Logo.png";
import LogoWhite from "@/assets/images/logo/Edunex-Logo.png";
import MobileLogo from "@/assets/images/logo/Edunex-Square-Logo.png";
import MobileLogoWhite from "@/assets/images/logo/Edunex-Square-Logo.png";
const Logo = () => {
  const [isDark] = useDarkMode();
  const { width, breakpoints } = useWidth();

  return (
    <div>
      <Link to="/dashboard">
        <div className="flex items-center">
          {width >= breakpoints.xl ? (
            <img src={isDark ? LogoWhite : MainLogo} alt="logo-1" className="h-[35px]" />
          ) : (
            <img src={isDark ? MobileLogoWhite : MobileLogo} alt="logo-2" className="h-[30px]" />
          )}
        </div>
      </Link>
    </div>
  );

};

export default Logo;
