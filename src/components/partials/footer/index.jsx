import React from "react";

const Footer = ({ className = "custom-class" }) => {
    return (
        <footer className={className}>
            <div className="site-footer px-6 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 py-2">
                <div className="grid grid-cols-1">
                    <div className="text-center ltr:md:text-start rtl:md:text-right text-xs">
                        COPYRIGHT &copy; 2026 Edunex, All rights Reserved
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
