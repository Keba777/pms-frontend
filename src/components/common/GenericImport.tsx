import React, { ChangeEvent, useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

export interface ImportColumn<T> {
  header: string;
  accessor: keyof T & string;
  type?: "string" | "number" | "date" | "boolean" | "file";
}

interface GenericImportProps<T extends object> {
  expectedColumns: ImportColumn<T>[];
  onImport: (data: T[]) => void | Promise<void>;
  title: string;
  onError?: (error: string) => void;
  requiredAccessors?: (keyof T)[];
  className?: string; // Added className support
}

const GenericImport = <T extends object>({
  expectedColumns,
  onImport,
  title,
  onError,
  requiredAccessors,
  className, // Added className destructuring
}: GenericImportProps<T>) => {
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = event.target?.result;
        if (!data) throw new Error("Failed to read file.");

        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const rawData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        });

        if (rawData.length < 1) throw new Error("Empty sheet.");

        // Extract headers
        const headers = rawData[0] as string[];

        // Normalize function
        const normalize = (h: string) => h.trim().toLowerCase().replace(/\s+/g, '_');

        // Validate headers
        const expectedHeaders = expectedColumns.map((c) =>
          normalize(c.header)
        );
        const actualHeaders = headers.map(normalize);

        const missing = expectedHeaders.filter(
          (h) => !actualHeaders.includes(h)
        );
        if (missing.length > 0) {
          const originalMissing = missing.map(h => {
            const col = expectedColumns.find(c => normalize(c.header) === h);
            return col ? col.header : h;
          });
          const msg = `Header mismatch. Missing or incorrect headers: ${originalMissing.join(
            ", "
          )}.`;
          if (onError) {
            onError(msg);
          } else {
            toast.error(msg);
          }
          setLoading(false);
          return;
        }

        type Key = keyof T & string;

        // Parse rows into objects of type T
        let parsedData: T[] = rawData.slice(1).map((row, rowIndex) => {
          const obj: Partial<Record<Key, unknown>> = {};
          headers.forEach((header, index) => {
            const trimmedHeader = normalize(header);
            const column = expectedColumns.find(
              (col) => normalize(col.header) === trimmedHeader
            );
            if (column) {
              const value = row[index];
              let parsedValue: unknown = value;

              // Type validation based on column.type
              if (column.type === "number") {
                if (value == null || value === "") {
                  parsedValue = undefined;
                } else {
                  const num = Number(value);
                  if (isNaN(num)) {
                    throw new Error(
                      `Invalid number in column "${column.header}" at row ${rowIndex + 2
                      }.`
                    );
                  }
                  parsedValue = num;
                }
              } else if (column.type === "date") {
                if (value == null || value === "") {
                  parsedValue = undefined;
                } else {
                  const date = new Date(value as string);
                  if (isNaN(date.getTime())) {
                    throw new Error(
                      `Invalid date in column "${column.header}" at row ${rowIndex + 2
                      }.`
                    );
                  }
                  parsedValue = date;
                }
              } else if (column.type === "boolean") {
                if (typeof value === "string") {
                  const lower = value.toLowerCase();
                  if (lower === "true") parsedValue = true;
                  else if (lower === "false") parsedValue = false;
                  else
                    throw new Error(
                      `Invalid boolean in column "${column.header}" at row ${rowIndex + 2
                      }.`
                    );
                } else {
                  parsedValue = !!value;
                }
              } else if (column.type === "file") {
                parsedValue = value != null ? String(value) : undefined;
              } else {
                // Default to string
                parsedValue = value != null ? String(value) : undefined;
              }
              obj[column.accessor as Key] = parsedValue;
            }
          });
          return obj as T;
        });

        // Filter out empty rows first
        parsedData = parsedData.filter((row) =>
          Object.values(row).some((val) => val !== undefined && val !== "")
        );

        // Collect valid rows, skip those missing required fields
        const validData: T[] = [];
        const skippedRows: number[] = [];

        for (let i = 0; i < parsedData.length; i++) {
          const row = parsedData[i];
          let isValid = true;
          for (const req of requiredAccessors ?? []) {
            const val = row[req];
            if (val == null || (typeof val === "string" && val.trim() === "")) {
              isValid = false;
              skippedRows.push(i + 2);
              break;
            }
          }
          if (isValid) {
            validData.push(row);
          }
        }

        if (skippedRows.length > 0) {
          const msg = `Skipped rows with missing required fields: ${skippedRows.join(", ")}.`;
          toast.warn(msg);
        }

        if (validData.length === 0) {
          const msg = "No valid data found in the file.";
          if (onError) {
            onError(msg);
          } else {
            toast.error(msg);
          }
          setLoading(false);
          return;
        }

        await onImport(validData);
      } catch (error) {
        const msg = `Error importing file: ${(error as Error).message}`;
        if (onError) {
          onError(msg);
        } else {
          toast.error(msg);
        }
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      const msg = "Error reading file.";
      if (onError) {
        onError(msg);
      } else {
        toast.error(msg);
      }
      setLoading(false);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className={cn("inline-block", className)}>
      <label
        htmlFor="file-import"
        className="flex items-center gap-2 px-4 py-2 bg-primary/80 text-primary-foreground border border-slate-200 rounded-lg hover:bg-primary/90 transition-all cursor-pointer font-semibold shadow-sm text-sm"
      >
        <span className="flex items-center gap-2 text-xs sm:text-sm">
          {loading ? "Importing..." : `Import ${title}`}
        </span>
        <input
          id="file-import"
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFileChange}
          className="hidden"
          disabled={loading}
        />
      </label>
    </div>
  );
};

export default GenericImport;
