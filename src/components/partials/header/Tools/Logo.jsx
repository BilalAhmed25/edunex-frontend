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
        {width >= breakpoints.xl ? (
          <img src={isDark ? LogoWhite : MainLogo} alt="logo-1" />
        ) : (
          <img src={isDark ? MobileLogoWhite : MobileLogo} alt="logo-2" />
        )}
      </Link>
    </div>
  );
};

export default Logo;
