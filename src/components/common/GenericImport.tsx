import React, { ChangeEvent, useState } from "react";
import * as XLSX from "xlsx";

export interface ImportColumn {
  header: string;
  accessor: string; // Key to map to in the output data object
}

interface GenericImportProps {
  expectedColumns: ImportColumn[]; // Expected headers and their corresponding accessors
  onImport: (data: any[]) => void; // Callback to handle successfully imported data
  title: string; // Title for the import component (e.g., table name)
  onError?: (error: string) => void; // Optional callback for errors (e.g., header mismatch)
}

const GenericImport = ({
  expectedColumns,
  onImport,
  title,
  onError,
}: GenericImportProps) => {
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (!data) throw new Error("Failed to read file.");

        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        });

        if (jsonData.length < 1) throw new Error("Empty sheet.");

        // Extract headers from the first row
        const headers: string[] = jsonData[0] as string[];

        // Check if headers match expected columns (case-insensitive, trimmed)
        const expectedHeaders = expectedColumns.map((col) =>
          col.header.trim().toLowerCase()
        );
        const actualHeaders = headers.map((h) => h.trim().toLowerCase());

        const missingHeaders = expectedHeaders.filter(
          (eh) => !actualHeaders.includes(eh)
        );
        if (missingHeaders.length > 0) {
          const errorMsg = `Header mismatch. Missing or incorrect headers: ${missingHeaders.join(
            ", "
          )}.`;
          if (onError) onError(errorMsg);
          else alert(errorMsg);
          return;
        }

        // Parse data starting from row 1 (skipping header)
        const parsedData = jsonData.slice(1).map((row: any[]) => {
          const obj: { [key: string]: any } = {};
          headers.forEach((header, index) => {
            const trimmedHeader = header.trim().toLowerCase();
            const column = expectedColumns.find(
              (col) => col.header.trim().toLowerCase() === trimmedHeader
            );
            if (column) {
              obj[column.accessor] = row[index];
            }
          });
          return obj;
        });

        // Filter out empty rows (optional: if all values are undefined or empty)
        const filteredData = parsedData.filter((row) =>
          Object.values(row).some((val) => val !== undefined && val !== "")
        );

        onImport(filteredData);
      } catch (error) {
        const errorMsg = `Error importing file: ${(error as Error).message}`;
        if (onError) onError(errorMsg);
        else alert(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      const errorMsg = "Error reading file.";
      if (onError) onError(errorMsg);
      else alert(errorMsg);
      setLoading(false);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-4">
      <label
        htmlFor="file-import"
        className="btn-import flex items-center gap-2 text-white bg-purple-600 px-4 py-2 rounded hover:bg-purple-700 cursor-pointer"
      >
        {loading ? "Importing..." : `Import ${title} from XLS`}
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
