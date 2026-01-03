"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

export interface ColumnConfig<T> {
    key: string;
    label: string;
    render?: (item: T, index: number) => React.ReactNode;
    headerRender?: () => React.ReactNode;
    colSpan?: number;
    rowSpan?: number;
    className?: string;
    headerClassName?: string;
    isDefault?: boolean;
}

interface ReusableTableProps<T> {
    title: string;
    data: T[];
    columns: ColumnConfig<T>[];
    isLoading: boolean;
    isError: boolean;
    errorMessage?: string;
    searchTerm: string;
    onSearchChange: (val: string) => void;
    placeholder?: string;
    pageSize?: number;
    emptyMessage?: string;
    renderCustomFilters?: () => React.ReactNode;
    idKey?: keyof T; // Used for index + 1 if not provided
    getRowKey?: (item: T) => string;
    hideTitle?: boolean;
    hideControls?: boolean;
}

export function ReusableTable<T extends { id?: string | number }>({
    title,
    data,
    columns,
    isLoading,
    isError,
    errorMessage = "Error loading data.",
    searchTerm,
    onSearchChange,
    placeholder = "Search...",
    pageSize = 10,
    emptyMessage = "No records found",
    renderCustomFilters,
    getRowKey,
    hideTitle = false,
    hideControls = false,
}: ReusableTableProps<T>) {
    const [page, setPage] = useState(1);
    const [selectedColumns, setSelectedColumns] = useState<string[]>(
        columns.filter((c) => c.isDefault !== false).map((c) => c.key)
    );

    const toggleColumn = (key: string) => {
        setSelectedColumns((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    const totalPages = Math.ceil(data.length / pageSize);
    const paginatedData = useMemo(() => {
        return data.slice((page - 1) * pageSize, page * pageSize);
    }, [data, page, pageSize]);

    const visibleColumns = useMemo(() => {
        return columns.filter((c) => selectedColumns.includes(c.key));
    }, [columns, selectedColumns]);

    const renderPageNumbers = () => {
        const pages: React.ReactNode[] = [];
        const maxVisible = 5;
        const startPage = Math.max(1, page - Math.floor(maxVisible / 2));
        const endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (startPage > 1) {
            pages.push(
                <PaginationItem key={1}>
                    <PaginationLink
                        onClick={() => setPage(1)}
                        className="cursor-pointer"
                        isActive={page === 1}
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );
            if (startPage > 2) {
                pages.push(
                    <PaginationItem key="ellipsis-start">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        onClick={() => setPage(i)}
                        className="cursor-pointer"
                        isActive={page === i}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(
                    <PaginationItem key="ellipsis-end">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }
            pages.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink
                        onClick={() => setPage(totalPages)}
                        className="cursor-pointer"
                        isActive={page === totalPages}
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return pages;
    };

    const tableHeaders = useMemo(() => {
        // We might have multi-row headers in some cases (like Activities)
        // For now, let's stick to a single row unless we detect rowSpan/colSpan
        const hasComplexHeader = columns.some(c => c.rowSpan || c.colSpan);

        if (!hasComplexHeader) {
            return (
                <TableRow className="bg-primary hover:bg-primary/90">
                    {visibleColumns.map((col) => (
                        <TableHead
                            key={col.key}
                            className={`text-gray-50 font-medium px-4 py-4 ${col.headerClassName || ""}`}
                        >
                            {col.headerRender ? col.headerRender() : col.label}
                        </TableHead>
                    ))}
                </TableRow>
            );
        }

        // Handle Activities style complex header (hardcoded for now as it's a specific pattern)
        // In a truly generic way, we'd need to calculate the grid.
        // For this project, I'll allow passing multiple header rows or a custom header component.
        return null; // Fallback or custom render logic
    }, [visibleColumns, columns]);

    return (
        <div className="space-y-6">
            {!hideTitle && (
                <div className="flex flex-col sm:flex-row items-baseline gap-2">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                        {title}
                    </h2>
                    <span className="text-sm text-gray-400 font-medium">({data.length} total)</span>
                </div>
            )}

            {!hideControls && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                                    Customize Columns <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64">
                                <div className="space-y-2">
                                    {columns.map((col) => (
                                        <div key={col.key} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`col-${col.key}`}
                                                checked={selectedColumns.includes(col.key)}
                                                onCheckedChange={() => toggleColumn(col.key)}
                                            />
                                            <label htmlFor={`col-${col.key}`} className="text-sm cursor-pointer">
                                                {col.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                        {renderCustomFilters && renderCustomFilters()}
                    </div>
                    <Input
                        placeholder={placeholder}
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full sm:w-64"
                    />
                </div>
            )}

            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        {tableHeaders || (
                            <>
                                <TableRow className="bg-primary hover:bg-primary/90">
                                    {(() => {
                                        const resourceKeys = ["materials", "equipments", "labors"];
                                        const hasGroupedHeader = columns.some((c) => c.colSpan);
                                        const firstResourceIdx = visibleColumns.findIndex((c) =>
                                            resourceKeys.includes(c.key)
                                        );
                                        const result: React.ReactNode[] = [];

                                        visibleColumns.forEach((col, idx) => {
                                            if (resourceKeys.includes(col.key)) {
                                                if (idx === firstResourceIdx) {
                                                    result.push(
                                                        <TableHead
                                                            key="resource-cost-group"
                                                            colSpan={
                                                                visibleColumns.filter((c) =>
                                                                    resourceKeys.includes(c.key)
                                                                ).length
                                                            }
                                                            className="text-gray-50 font-medium uppercase tracking-wider px-4 py-3 text-center border-b border-white/10 border-r border-white/10"
                                                        >
                                                            Resource Cost
                                                        </TableHead>
                                                    );
                                                }
                                                return;
                                            }

                                            result.push(
                                                <TableHead
                                                    key={col.key}
                                                    rowSpan={hasGroupedHeader ? 2 : 1}
                                                    className={`text-gray-50 font-medium px-4 py-4 border-r border-white/10 ${col.headerClassName || ""
                                                        }`}
                                                >
                                                    {col.headerRender ? col.headerRender() : col.label}
                                                </TableHead>
                                            );
                                        });

                                        return result;
                                    })()}
                                </TableRow>
                                {visibleColumns.some((c) =>
                                    ["materials", "equipments", "labors"].includes(c.key)
                                ) && (
                                        <TableRow className="bg-primary hover:bg-primary/90">
                                            {visibleColumns
                                                .filter((col) =>
                                                    ["materials", "equipments", "labors"].includes(col.key)
                                                )
                                                .map((col) => (
                                                    <TableHead
                                                        key={col.key}
                                                        className="text-gray-50 font-medium uppercase tracking-wider text-[10px] py-3 px-4 border-r border-white/10"
                                                    >
                                                        {col.label}
                                                    </TableHead>
                                                ))}
                                        </TableRow>
                                    )}
                            </>
                        )}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index} className="hover:bg-gray-50">
                                    {visibleColumns.map((col) => (
                                        <TableCell key={col.key} className="px-4 py-2">
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : isError ? (
                            <TableRow>
                                <TableCell
                                    colSpan={visibleColumns.length}
                                    className="text-center py-8 text-red-600"
                                >
                                    {errorMessage}
                                </TableCell>
                            </TableRow>
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((item, idx) => (
                                <TableRow key={getRowKey ? getRowKey(item) : (item.id || idx)} className="hover:bg-gray-50">
                                    {visibleColumns.map((col) => (
                                        <TableCell key={col.key} className={`px-4 py-2 ${col.className || ""}`}>
                                            {col.render ? col.render(item, (page - 1) * pageSize + idx) : (item as any)[col.key]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={visibleColumns.length}
                                    className="text-center py-8 text-gray-500"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                        {renderPageNumbers()}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}
