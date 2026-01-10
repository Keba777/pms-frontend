"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateForInput } from "@/utils/dateUtils";
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
    groupName?: string;
    render?: (
        item: T,
        index: number,
        extra: {
            isEditing: boolean;
            toggleEdit: () => void;
        }
    ) => React.ReactNode;
    headerRender?: () => React.ReactNode;
    colSpan?: number;
    rowSpan?: number;
    className?: string;
    headerClassName?: string;
    isDefault?: boolean;
    editable?: boolean;
    inputType?: "text" | "number" | "date" | "select" | "members";
    options?: { label: string; value: any }[];
    editRender?: (
        item: T,
        value: any,
        onChange: (val: any) => void
    ) => React.ReactNode;
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
    isEditable?: boolean;
    onSave?: (items: T[]) => Promise<void>;
    onRowSave?: (item: T) => Promise<void>;
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
    isEditable = false,
    onSave,
    onRowSave,
}: ReusableTableProps<T>) {
    const [page, setPage] = useState(1);
    const [selectedColumns, setSelectedColumns] = useState<string[]>(
        columns.filter((c) => c.isDefault !== false).map((c) => c.key)
    );

    // Editing states
    const [editingRowIds, setEditingRowIds] = useState<Set<string | number>>(new Set());
    const [localEdits, setLocalEdits] = useState<Record<string | number, T>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Reset to page 1 when data or search changes
    useEffect(() => {
        setPage(1);
    }, [data, searchTerm]);

    const toggleColumn = (key: string) => {
        setSelectedColumns((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    const toggleRowEdit = (itemId: string | number) => {
        setEditingRowIds((prev) => {
            const next = new Set(prev);
            if (next.has(itemId)) {
                next.delete(itemId);
                // Optionally clear local edits if we cancelled
                const { [itemId]: _, ...rest } = localEdits;
                setLocalEdits(rest);
            } else {
                next.add(itemId);
                const item = data.find((d) => (getRowKey ? getRowKey(d) : d.id) === itemId);
                if (item) {
                    setLocalEdits((prevEdits) => ({ ...prevEdits, [itemId]: { ...item } }));
                }
            }
            return next;
        });
    };

    const handleCellChange = (itemId: string | number, key: string, value: any, type?: string) => {
        let val = value;
        if (type === "number") {
            val = value === "" ? null : Number(value);
        }

        setLocalEdits((prev) => {
            const currentItem = prev[itemId] || data.find((d) => (getRowKey ? getRowKey(d) : d.id) === itemId);
            if (!currentItem) return prev;

            // Handle nested actuals field if key contains dot
            if (key.includes('.')) {
                const [parent, child] = key.split('.');
                return {
                    ...prev,
                    [itemId]: {
                        ...currentItem,
                        [parent]: {
                            ...(currentItem as any)[parent],
                            [child]: val
                        }
                    }
                };
            }

            return {
                ...prev,
                [itemId]: { ...currentItem, [key]: val },
            };
        });
    };

    const handleSaveLocal = async () => {
        if (!onSave) return;
        setIsSaving(true);
        try {
            await onSave(Object.values(localEdits));
            setLocalEdits({});
            setEditingRowIds(new Set());
        } finally {
            setIsSaving(false);
        }
    };

    const handleRowSaveLocal = async (itemId: string | number) => {
        if (!onRowSave || !localEdits[itemId]) return;
        setIsSaving(true);
        try {
            await onRowSave(localEdits[itemId]);
            const { [itemId]: _, ...rest } = localEdits;
            setLocalEdits(rest);
            setEditingRowIds((prev) => {
                const next = new Set(prev);
                next.delete(itemId);
                return next;
            });
        } finally {
            setIsSaving(false);
        }
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
                        {Object.keys(localEdits).length > 0 && onSave && (
                            <Button
                                onClick={handleSaveLocal}
                                disabled={isSaving}
                                className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 font-bold uppercase text-xs tracking-widest shadow-md"
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        )}
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
                        {(() => {
                            const hasGroups = visibleColumns.some(c => !!c.groupName);
                            if (!hasGroups) {
                                return (
                                    <TableRow className="bg-primary hover:bg-primary/90">
                                        {visibleColumns.map((col) => (
                                            <TableHead
                                                key={col.key}
                                                className={`text-gray-50 font-medium px-4 py-4 border-r border-white/10 last:border-r-0 ${col.headerClassName || ""}`}
                                            >
                                                {col.headerRender ? col.headerRender() : col.label}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                );
                            }

                            // Build grouped header layout
                            const topRow: React.ReactNode[] = [];
                            const bottomRow: React.ReactNode[] = [];
                            let i = 0;

                            while (i < visibleColumns.length) {
                                const col = visibleColumns[i];
                                if (!col.groupName) {
                                    topRow.push(
                                        <TableHead
                                            key={col.key}
                                            rowSpan={2}
                                            className={`text-gray-50 font-medium px-4 py-4 border-r border-white/10 ${col.headerClassName || ""}`}
                                        >
                                            {col.headerRender ? col.headerRender() : col.label}
                                        </TableHead>
                                    );
                                    i++;
                                } else {
                                    const currentGroup = col.groupName;
                                    let j = i;
                                    while (j < visibleColumns.length && visibleColumns[j].groupName === currentGroup) {
                                        bottomRow.push(
                                            <TableHead
                                                key={visibleColumns[j].key}
                                                className={`text-gray-50 font-medium uppercase tracking-wider text-[10px] py-3 px-4 border-r border-white/10 ${visibleColumns[j].headerClassName || ""}`}
                                            >
                                                {visibleColumns[j].label}
                                            </TableHead>
                                        );
                                        j++;
                                    }
                                    const groupColSpan = j - i;
                                    topRow.push(
                                        <TableHead
                                            key={`group-${currentGroup}-${i}`}
                                            colSpan={groupColSpan}
                                            className="text-gray-50 font-medium uppercase tracking-wider px-4 py-3 text-center border-b border-white/10 border-r border-white/10 group-header"
                                        >
                                            {currentGroup}
                                        </TableHead>
                                    );
                                    i = j;
                                }
                            }

                            return (
                                <>
                                    <TableRow className="bg-primary hover:bg-primary/90">
                                        {topRow}
                                    </TableRow>
                                    <TableRow className="bg-primary hover:bg-primary/90">
                                        {bottomRow}
                                    </TableRow>
                                </>
                            );
                        })()}
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
                            paginatedData.map((item, idx) => {
                                const itemId = getRowKey ? getRowKey(item) : (item.id || idx);
                                const isEditing = editingRowIds.has(itemId);
                                const currentItem = localEdits[itemId] || item;

                                return (
                                    <TableRow
                                        key={itemId}
                                        className="hover:bg-gray-50 group"
                                        onDoubleClick={() => isEditable && toggleRowEdit(itemId)}
                                    >
                                        {visibleColumns.map((col) => {
                                            const cellValue = col.key.includes('.')
                                                ? col.key.split('.').reduce((acc, part) => (acc as any)?.[part], currentItem)
                                                : (currentItem as any)[col.key];

                                            return (
                                                <TableCell
                                                    key={col.key}
                                                    className={`px-4 py-2 border-r last:border-r-0 ${col.className || ""}`}
                                                >
                                                    {isEditing && col.editable ? (
                                                        col.editRender ? (
                                                            col.editRender(currentItem, cellValue, (val) =>
                                                                handleCellChange(itemId, col.key, val)
                                                            )
                                                        ) : col.inputType === "select" ? (
                                                            <select
                                                                value={cellValue || ""}
                                                                onChange={(e) => handleCellChange(itemId, col.key, e.target.value)}
                                                                className="w-full p-1 text-sm border rounded focus:ring-1 focus:ring-primary outline-none"
                                                            >
                                                                {col.options?.map((opt) => (
                                                                    <option key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <Input
                                                                type={col.inputType || "text"}
                                                                value={col.inputType === "date" ? formatDateForInput(cellValue) : (cellValue || "")}
                                                                onChange={(e) => handleCellChange(itemId, col.key, e.target.value, col.inputType)}
                                                                className="h-8 py-1 px-2 text-sm"
                                                            />
                                                        )
                                                    ) : col.key === "actions" && isEditing ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRowSaveLocal(itemId);
                                                            }}
                                                            disabled={isSaving}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-4"
                                                        >
                                                            {isSaving ? "..." : "Save"}
                                                        </Button>
                                                    ) : (
                                                        col.render
                                                            ? col.render(currentItem, (page - 1) * pageSize + idx, {
                                                                isEditing,
                                                                toggleEdit: () => toggleRowEdit(itemId),
                                                            })
                                                            : cellValue
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })
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
