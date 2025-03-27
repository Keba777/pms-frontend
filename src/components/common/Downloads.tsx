import React from "react";
import { Printer, FileText, Sheet } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => any);
}

interface GenericDownloadsProps<T> {
  data: T[];
  title: string;
  columns: Column<T>[];
}

const GenericDownloads = <T extends {}>({
  data,
  title,
  columns,
}: GenericDownloadsProps<T>) => {
  // Create table rows based on the columns configuration
  const getTableRows = () =>
    data.map((row, index) =>
      columns.map((col) => {
        if (typeof col.accessor === "function") {
          return col.accessor(row);
        }
        // if the field is a date, you might want to format it
        const value = row[col.accessor];
        if (
          value &&
          typeof value === "string" &&
          value.match(/^\d{4}-\d{2}-\d{2}T/)
        ) {
          return new Date(value).toISOString().split("T")[0];
        }
        return value;
      })
    );

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(title, 20, 10);
    autoTable(doc, {
      head: [columns.map((col) => col.header)],
      body: getTableRows(),
    });
    doc.save(`${title}.pdf`);
  };

  const exportToExcel = () => {
    // Build an array of objects for Excel using header as key
    const excelData = data.map((row, index) => {
      const obj: { [key: string]: any } = {};
      columns.forEach((col) => {
        let value;
        if (typeof col.accessor === "function") {
          value = col.accessor(row);
        } else {
          value = row[col.accessor];
          if (
            value &&
            typeof value === "string" &&
            value.match(/^\d{4}-\d{2}-\d{2}T/)
          ) {
            value = new Date(value).toISOString().split("T")[0];
          }
        }
        obj[col.header] = value;
      });
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${title}.xlsx`);
  };

  const printTable = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-4">
        <button
          onClick={exportToPDF}
          className="btn-pdf flex items-center gap-2"
        >
          <FileText size={18} /> PDF
        </button>
        <button
          onClick={exportToExcel}
          className="btn-excel flex items-center gap-2"
        >
          <Sheet size={18} /> Excel
        </button>
        <button
          onClick={printTable}
          className="btn-print flex items-center gap-2"
        >
          <Printer size={18} /> Print
        </button>
      </div>
    </div>
  );
};

export default GenericDownloads;
