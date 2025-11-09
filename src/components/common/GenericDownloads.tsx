import React from "react";
import { Printer, FileText, Sheet } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import logo from "@/../public/images/logo.jpg";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T, index?: number) => unknown);
}

interface GenericDownloadsProps<T> {
  data: T[];
  title: string;
  columns: Column<T>[];
}

const GenericDownloads = <T,>({
  data,
  title,
  columns,
}: GenericDownloadsProps<T>) => {
  const getTableRows = () =>
  data.map((row, index) =>
    columns.map((col) => {
      if (typeof col.accessor === "function") {
        return col.accessor(row, index); // pass index
      }
      const value = row[col.accessor];
      if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
        return new Date(value).toISOString().split("T")[0];
      }
      return value;
    })
  );

  const getTodayString = () => new Date().toISOString().split("T")[0];

  const exportToPDF = async () => {
    const doc = new jsPDF();

    // Fetch logo
    const res = await fetch(logo.src ?? logo);
    const blob = await res.blob();
    const reader = new FileReader();
    const imgData: string = await new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    doc.addImage(imgData, "JPEG", 10, 10, 30, 30);
    doc.setFontSize(16).setTextColor(0, 102, 204);
    doc.text("Raycon Construction Plc", 105, 20, { align: "center" });
    doc.setFontSize(10).setTextColor(0, 0, 0);
    doc.text("TIN: 00526272778 | VAT Reg No: N53737", 105, 26, {
      align: "center",
    });
    doc.text("Phone1: 0923666575 | Phone2: 09255564865", 105, 31, {
      align: "center",
    });
    doc.text("Address: Lideta Sub City, Around Lideta Park", 105, 36, {
      align: "center",
    });
    doc.setFontSize(13).setTextColor(40, 40, 40);
    doc.text(title, 105, 46, { align: "center" });

    // Dynamic font size calculation based on number of columns to ensure horizontal fit without vertical wrapping or truncation
    const numColumns = columns.length;
    let pdfFontSize = 10;
    if (numColumns > 6) {
      pdfFontSize = 8;
    }
    if (numColumns > 10) {
      pdfFontSize = 6;
    }
    if (numColumns > 14) {
      pdfFontSize = 5;
    }

    autoTable(doc, {
      startY: 52,
      head: [columns.map((col) => col.header)],
      body: getTableRows() as RowInput[],
      theme: "grid", // Added to make formatting less boring with borders
      margin: { left: 10, right: 10 }, // Ensure full horizontal usage
      styles: { 
        fontSize: pdfFontSize,
        overflow: "linebreak", // Allow wrapping only if absolutely needed after font reduction
        cellPadding: 2, // Slightly reduced padding for tighter fit
        halign: "center", // Center align for better appearance
        valign: "middle",
      },
      headStyles: { 
        fillColor: [0, 102, 204],
        textColor: [255, 255, 255], // White text for contrast
        fontSize: pdfFontSize,
        halign: "center",
        valign: "middle",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 250], // Subtle alternating row color for less boring look
      },
    });

    doc.save(`${getTodayString()}_${title}.pdf`);
  };

  const exportToExcel = () => {
    const excelData = data.map((row) => {
      const obj: { [key: string]: unknown } = {};
      columns.forEach((col) => {
        let value;
        if (typeof col.accessor === "function") {
          value = col.accessor(row);
        } else {
          value = row[col.accessor];
          if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
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
    saveAs(blob, `${getTodayString()}_${title}.xlsx`);
  };

  const printTable = () => {
    // Build a standalone HTML document with header + table
    const headerHtml = `
      <div style="text-align:center; margin-bottom:20px;">
        <img src="${
          logo.src ?? logo
        }" style="width:60px; height:60px;" alt="Logo" />
        <h1 style="margin:5px 0;">Raycon Construction Plc</h1>
        <p style="margin:2px 0; font-size:12px;">
          TIN: 00526272778 | VAT Reg No: N53737<br/>
          Phone1: 0923666575 | Phone2: 09255564865<br/>
          Address: Lideta Sub City, Around Lideta Park
        </p>
        <h2 style="margin-top:15px;">${title}</h2>
        <hr style="margin-top:5px;"/>
      </div>
    `;

    // Generate table markup
    const headRow = `<tr>${columns
      .map(
        (c) =>
          `<th style="padding:8px; background:#0066cc; color:#fff;">${c.header}</th>`
      )
      .join("")}</tr>`;
    const bodyRows = getTableRows()
      .map(
        (row) =>
          `<tr>${(row as string[])
            .map(
              (cell) =>
                `<td style="padding:6px; border:1px solid #ddd;">${
                  cell ?? ""
                }</td>`
            )
            .join("")}</tr>`
      )
      .join("");
    const tableHtml = `<table style="width:100%; border-collapse:collapse; font-family:Arial, sans-serif;">${headRow}${bodyRows}</table>`;

    // Open print window
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
        </head>
        <body>
          ${headerHtml}
          ${tableHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    // optionally: printWindow.close();
  };

    return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-4">
        <button
          onClick={exportToPDF}
          className="btn-pdf flex items-center justify-center gap-2 text-white bg-red-600 px-4 py-2 rounded hover:bg-red-700 w-full sm:w-auto"
        >
          <FileText size={18} /> PDF
        </button>
        <button
          onClick={exportToExcel}
          className="btn-excel flex items-center justify-center gap-2 text-white bg-green-600 px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto"
        >
          <Sheet size={18} /> Excel
        </button>
        <button
          onClick={printTable}
          className="btn-print flex items-center justify-center gap-2 text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
        >
          <Printer size={18} /> Print
        </button>
      </div>
    </div>
  );

};

export default GenericDownloads;
