import React, { useMemo } from "react";
import { useTable, useSortBy, useGlobalFilter, usePagination, useRowSelect, } from "react-table";
import Icon from "@/components/ui/Icon";

const GlobalFilter = ({ filter, setFilter }) => {
    const [value, setValue] = React.useState(filter);
    const onChange = (e) => {
        const val = e.target.value;
        setValue(val);
        setFilter(val || undefined);
    };

    return (
        <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 ps-3 flex items-center pointer-events-none">
                <Icon icon="ph:magnifying-glass" className="text-slate-400 text-lg" />
            </div>
            <input
                type="text"
                value={value || ""}
                onChange={onChange}
                placeholder="Search everything..."
                className="block w-full rounded-xl border border-slate-200 dark:border-[#2f3336] py-2.5 ps-10 pe-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white dark:bg-[#111111] transition-all text-[13px] outline-none"
            />
        </div>
    );
};

const DataTable = ({
    columns,
    data,
    title,
    pageSize: initialPageSize = 10,
    showSearch = true,
    actionButton
}) => {
    const tableInstance = useTable(
        {
            columns: useMemo(() => columns, [columns]),
            data: useMemo(() => data, [data]),
            initialState: { pageSize: initialPageSize },
        },
        useGlobalFilter, useSortBy, usePagination, useRowSelect
    );

    const {
        getTableProps, getTableBodyProps, headerGroups, page, nextPage, previousPage,
        canNextPage, canPreviousPage, pageOptions, state, setGlobalFilter,
        prepareRow, setPageSize, gotoPage
    } = tableInstance;

    const { globalFilter, pageIndex, pageSize } = state;

    return (
        <div className="bg-white dark:bg-[#16181c] rounded-2xl overflow-hidden transition-all">
            {/* Header Section */}
            {(title || showSearch || actionButton) && (
                <div className="p-6 border-b border-slate-100 dark:border-[#2f3336] md:flex justify-between items-center space-y-4 md:space-y-0">

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Show</span>
                        <select
                            value={pageSize}
                            onChange={e => setPageSize(Number(e.target.value))}
                            className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#2f3336] rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 px-2 py-1 focus:ring-2 focus:ring-primary-500 cursor-pointer outline-none transition-colors"
                        >
                            {[10, 25, 50, 100].map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Rows</span>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                        {showSearch && <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />}
                        {actionButton && <div className="md:ml-2">{actionButton}</div>}
                    </div>
                </div>
            )}

            {/* Table Body */}
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse" {...getTableProps()}>
                    <thead className="bg-slate-100/50 dark:bg-[#1f2128]/80 shadow-sm">
                        {headerGroups.map((headerGroup) => {
                            const { key, ...rowProps } = headerGroup.getHeaderGroupProps();
                            return (
                                <tr key={key} {...rowProps}>
                                    {headerGroup.headers.map((column) => {
                                        const { key, ...headerProps } = column.getHeaderProps(column.getSortByToggleProps());
                                        return (
                                            <th
                                                key={key}
                                                {...headerProps}
                                                className="px-6 py-3 text-left text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest select-none group border-b border-slate-200 dark:border-[#2f3336]"
                                            >
                                        <div className="flex items-center gap-2">
                                            {column.render("Header")}
                                            <span className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                                                {column.isSorted ? (
                                                    column.isSortedDesc ?
                                                        <Icon icon="ph:caret-down-fill" className="text-primary-500" /> :
                                                        <Icon icon="ph:caret-up-fill" className="text-primary-500" />
                                                ) : (
                                                    <Icon icon="ph:caret-up-down" className="text-slate-300 dark:text-slate-600" />
                                                )}
                                            </span>
                                        </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#2f3336]" {...getTableBodyProps()}>
                        {page.length > 0 ? page.map((row) => {
                            prepareRow(row);
                            const { key, ...rowProps } = row.getRowProps();
                            return (
                                <tr key={key} {...rowProps} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.03] transition-colors">
                                    {row.cells.map((cell) => {
                                        const { key, ...cellProps } = cell.getCellProps();
                                        return (
                                            <td key={key} {...cellProps} className="px-6 py-3 text-[13px] text-slate-600 dark:text-slate-300 align-middle">
                                                {cell.render("Cell")}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                                        <Icon icon="ph:database-light" className="text-6xl text-slate-300 dark:text-slate-600" />
                                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            {globalFilter ? "No matches found for your search" : "No results found"}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination & Row Control Footer */}
            {data.length > 0 && (
                <div className="px-6 pt-5 pb-4 bg-white dark:bg-[#16181c] border-t border-slate-100 dark:border-[#2f3336] space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between">
                    {/* Left: Row Count Dropdown */}
                    <div className="flex items-center gap-3">
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                            Total <span className="text-slate-800 dark:text-slate-200">{data.length}</span> entries
                        </p>
                    </div>

                    {/* Right: Navigation Controls */}
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Page Numbers Info */}
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-[#111111] rounded-lg">
                            <span className="text-xs font-bold text-slate-400 uppercase">Page</span>
                            <span className="text-[13px] font-bold text-primary-600 dark:text-primary-400">{pageIndex + 1}</span>
                            <span className="text-xs text-slate-300">of</span>
                            <span className="text-[13px] font-bold text-slate-500">{pageOptions.length}</span>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center bg-slate-50 dark:bg-[#111111] p-1 rounded-lg">
                            <button
                                className={`p-2 rounded-lg transition-all ${!canPreviousPage ? "text-slate-300 dark:text-slate-700 cursor-not-allowed" : "text-slate-600 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm"}`}
                                onClick={() => gotoPage(0)}
                                disabled={!canPreviousPage}
                            >
                                <Icon icon="ph:caret-double-left-bold" className="text-lg" />
                            </button>
                            <button
                                className={`p-2 rounded-lg transition-all ${!canPreviousPage ? "text-slate-300 dark:text-slate-700 cursor-not-allowed" : "text-slate-600 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm"}`}
                                onClick={() => previousPage()}
                                disabled={!canPreviousPage}
                            >
                                <Icon icon="ph:caret-left-bold" className="text-lg" />
                            </button>
                            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                            <button
                                className={`p-2 rounded-lg transition-all ${!canNextPage ? "text-slate-300 dark:text-slate-700 cursor-not-allowed" : "text-slate-600 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm"}`}
                                onClick={() => nextPage()}
                                disabled={!canNextPage}
                            >
                                <Icon icon="ph:caret-right-bold" className="text-lg" />
                            </button>
                            <button
                                className={`p-2 rounded-lg transition-all ${!canNextPage ? "text-slate-300 dark:text-slate-700 cursor-not-allowed" : "text-slate-600 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm"}`}
                                onClick={() => gotoPage(pageOptions.length - 1)}
                                disabled={!canNextPage}
                            >
                                <Icon icon="ph:caret-double-right-bold" className="text-lg" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;