import React, { useEffect, useState } from "react";
import { get } from "@/lib/apiClient";
import SchoolPlaceholder from "@/assets/images/logo/logo.png";

const ReportHeader = ({ className = "" }) => {
    const [school, setSchool] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await get("/users/school/profile");
                setSchool(res.data);
            } catch (err) {
                console.error("Failed to load school profile for report header");
            }
        };
        fetchProfile();
    }, []);

    return (
        <div className={`px-4 py-4 sm:px-6 sm:py-4 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-center sm:text-left ${className}`}>
            {/* Logo */}
            <div className="flex-none">
                <img
                    src={school?.LogoUrl || SchoolPlaceholder}
                    alt="Institutional Logo"
                    className="h-16 sm:h-20 w-auto object-contain"
                />
            </div>

            {/* School Info Block */}
            <div className="flex-1 text-center sm:text-center">
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 uppercase leading-tight sm:leading-none mb-1.5 sm:mb-1">
                    {school?.Name || "Institutional Name"}
                </h1>
                <p className="text-[10px] sm:text-[11px] text-slate-700 uppercase tracking-widest leading-relaxed max-w-sm sm:max-w-none mx-auto">
                    {school?.Address || "Institutional Street Address, City, Country"}
                </p>
            </div>
        </div>
    );
};

export default ReportHeader;
