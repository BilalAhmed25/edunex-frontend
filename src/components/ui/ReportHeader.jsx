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
        <div className={`px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-8 ${className}`}>
            {/* Logo */}
            <div className="flex-none">
                <img
                    src={school?.LogoUrl || SchoolPlaceholder}
                    alt="Institutional Logo"
                    className="h-20 w-auto object-contain"
                />
            </div>

            {/* School Info Block */}
            <div className="flex-1 text-center">
                <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase leading-none mb-1">
                    {school?.Name || "Institutional Name"}
                </h1>
                <p className="text-[11px] text-slate-700 dark:text-slate-400 uppercase tracking-widest">
                    {school?.Address || "Institutional Street Address, City, Country"}
                </p>
                {/* <div className="flex items-center justify-center gap-4 mt-2">
                    <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                        <span className="font-bold">TEL:</span> {school?.Phone || "N/A"}
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                        <span className="font-bold">EMAIL:</span> {school?.Email || "N/A"}
                    </div>
                </div> */}
            </div>
        </div>
    );
};

export default ReportHeader;
