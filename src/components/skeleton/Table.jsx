import React from "react";

const SkeletionTable = ({ count = 5 }) => {
    const rows = Array.from({ length: count });

    return (
        <div className="bg-white dark:bg-[#16181c] rounded-2xl overflow-hidden shimmer-active">
            {/* Header Section Skeleton */}
            <div className="p-3 border-b border-slate-100 dark:border-[#2f3336] flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-10 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div className="h-9 w-18 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                    <div className="h-4 w-10 bg-slate-200 dark:bg-slate-800 rounded"></div>
                </div>
                <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            </div>

            {/* Table Skeleton */}
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead className="bg-slate-50 dark:bg-[#1f2128]/30">
                        <tr>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <th key={i} className="px-6 py-3 border-b border-slate-200/60 dark:border-[#2f3336]">
                                    <div className="h-5 w-20 bg-slate-300 dark:bg-slate-700/60 rounded uppercase tracking-widest"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#2f3336]">
                        {rows.map((_, i) => (
                            <tr key={i}>
                                {[1, 2, 3, 4, 5, 6].map((j) => (
                                    <td key={j} className="px-6 py-3">
                                        <div className="space-y-2.5">
                                            {/* Primary Line */}
                                            <div className={`h-5 bg-slate-200 dark:bg-slate-800/80 rounded ${j === 1 ? 'w-48' : 'w-28'}`}></div>
                                            {/* Second Line */}
                                            {(j === 1 || j === 2 || j === 4) && (
                                                <div className={`h-2.5 bg-slate-100 dark:bg-slate-900 rounded ${j === 1 ? 'w-32' : 'w-20'}`}></div>
                                            )}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Skeleton */}
            <div className="px-6 pt-4 pb-4 border-t border-slate-100 dark:border-[#2f3336] flex justify-between items-center">
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="flex gap-4">
                    <div className="h-10 w-24 bg-slate-100 dark:bg-slate-900 rounded-lg"></div>
                    <div className="h-10 w-32 bg-slate-100 dark:bg-slate-900 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
};

export default SkeletionTable;
