// components/common/GenericDownloads.tsx
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
  // Optional second table for dual-table exports (e.g., Planned and Actual)
  secondTable?: {
    data: T[];
    title: string;
    columns: Column<T>[];
  };
}

const GenericDownloads = <T,>({ data, title, columns, secondTable }: GenericDownloadsProps<T>) => {
  const getTableRows = () =>
    data.map((row, index) =>
      columns.map((col) => {
        if (typeof col.accessor === "function") {
          return col.accessor(row, index);
        }
        const value = row[col.accessor];
        if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
          return new Date(value).toISOString().split("T")[0];
        }
        return value;
      })
    );

  const getTodayString = () => new Date().toISOString().split("T")[0];

  // Helper: Convert image URL to base64
  const urlToBase64 = async (url: string): Promise<string> => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch {
      return ""; // fallback
    }
  };

  // === EXPORT TO PDF WITH IMAGES ===
  const exportToPDF = async () => {
    const doc = new jsPDF();
    const imgWidth = 10;
    const imgHeight = 10;
    const startY = 52;

    // Logo
    const logoData = await urlToBase64(logo.src ?? logo);
    doc.addImage(logoData, "JPEG", 10, 10, 30, 30);

    // Header
    doc.setFontSize(16).setTextColor(0, 102, 204);
    doc.text("Raycon Construction Plc", 105, 20, { align: "center" });
    doc.setFontSize(10).setTextColor(0, 0, 0);
    doc.text("TIN: 00526272778 | VAT Reg No: N53737", 105, 26, { align: "center" });
    doc.text("Phone1: 0923666575 | Phone2: 09255564865", 105, 31, { align: "center" });
    doc.text("Address: Lideta Sub City, Around Lideta Park", 105, 36, { align: "center" });
    doc.setFontSize(13).setTextColor(40, 40, 40);
    doc.text(title, 105, 46, { align: "center" });

    // Font
    const fontUrl = '/fonts/NotoSansEthiopic-Regular.ttf';
    const fontRes = await fetch(fontUrl);
    const fontBlob = await fontRes.blob();
    const fontBase64 = await new Promise<string>((r) => {
      const reader = new FileReader();
      reader.onloadend = () => r(reader.result as string);
      reader.readAsDataURL(fontBlob);
    });
    doc.addFileToVFS('NotoSansEthiopic-Regular.ttf', fontBase64.split(',')[1]);
    doc.addFont('NotoSansEthiopic-Regular.ttf', 'NotoSansEthiopic', 'normal');
    doc.setFont('NotoSansEthiopic');

    const numColumns = columns.length;
    let pdfFontSize = numColumns > 14 ? 5 : numColumns > 10 ? 6 : numColumns > 6 ? 8 : 10;

    // Prepare body
    const body: RowInput[] = [];
    const profileColIdx = columns.findIndex(c => c.header === "Profile Picture");
    const profileBase64s: string[] = await Promise.all(
      data.map(async (row, i) => {
        let value: any;
        const col = columns[profileColIdx];
        if (col && typeof col.accessor === "function") {
          value = col.accessor(row, i);
        } else if (col) {
          value = (row as any)[col.accessor];
        }
        if (typeof value === "string" && value.startsWith("http")) {
          return await urlToBase64(value);
        }
        return "";
      })
    );

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const pdfRow: any[] = [];

      for (const col of columns) {
        let value: any;
        if (typeof col.accessor === "function") {
          value = col.accessor(row, i);
        } else {
          value = (row as any)[col.accessor];
        }

        if (col.header === "Profile Picture") {
          pdfRow.push("");
        } else {
          pdfRow.push(typeof value === "string" ? value : String(value ?? ""));
        }
      }
      body.push(pdfRow);
    }

    let currentY = startY;
    
    // First table (Planned)
    autoTable(doc, {
      startY: currentY,
      head: [columns.map(c => c.header)],
      body,
      theme: "grid",
      margin: { left: 10, right: 10 },
      styles: { font: 'NotoSansEthiopic', fontSize: pdfFontSize, cellPadding: 2, halign: "center" },
      headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255], fontSize: pdfFontSize },
      alternateRowStyles: { fillColor: [245, 245, 250] },
      columnStyles: profileColIdx >= 0 ? {
        [profileColIdx]: { cellWidth: imgWidth + 5, halign: "center", valign: "middle" }
      } : {},
      didDrawCell: (data) => {
        if (data.column.index === profileColIdx && data.row.section === "body" && profileBase64s[data.row.index]) {
          const { x, y, width, height } = data.cell;
          doc.addImage(profileBase64s[data.row.index], "JPEG", x + (width - imgWidth) / 2, y + (height - imgHeight) / 2, imgWidth, imgHeight);
        }
      },
    });

    // Second table (Actual) if provided
    if (secondTable) {
      // Get the final Y position from the last autoTable
      const lastAutoTable = (doc as any).lastAutoTable;
      currentY = lastAutoTable ? lastAutoTable.finalY + 20 : startY + 100; // Add spacing
      
      // Add section title for second table
      doc.setFontSize(13).setTextColor(40, 40, 40);
      doc.text(secondTable.title, 105, currentY, { align: "center" });
      currentY += 10;

      // Prepare second table body
      const secondBody: RowInput[] = [];
      const secondProfileColIdx = secondTable.columns.findIndex(c => c.header === "Profile Picture");
      const secondProfileBase64s: string[] = await Promise.all(
        secondTable.data.map(async (row, i) => {
          let value: any;
          const col = secondTable.columns[secondProfileColIdx];
          if (col && typeof col.accessor === "function") {
            value = col.accessor(row, i);
          } else if (col) {
            value = (row as any)[col.accessor];
          }
          if (typeof value === "string" && value.startsWith("http")) {
            return await urlToBase64(value);
          }
          return "";
        })
      );

      for (let i = 0; i < secondTable.data.length; i++) {
        const row = secondTable.data[i];
        const pdfRow: any[] = [];

        for (const col of secondTable.columns) {
          let value: any;
          if (typeof col.accessor === "function") {
            value = col.accessor(row, i);
          } else {
            value = (row as any)[col.accessor];
          }

          if (col.header === "Profile Picture") {
            pdfRow.push("");
          } else {
            pdfRow.push(typeof value === "string" ? value : String(value ?? ""));
          }
        }
        secondBody.push(pdfRow);
      }

      const secondNumColumns = secondTable.columns.length;
      let secondPdfFontSize = secondNumColumns > 14 ? 5 : secondNumColumns > 10 ? 6 : secondNumColumns > 6 ? 8 : 10;

      autoTable(doc, {
        startY: currentY,
        head: [secondTable.columns.map(c => c.header)],
        body: secondBody,
        theme: "grid",
        margin: { left: 10, right: 10 },
        styles: { font: 'NotoSansEthiopic', fontSize: secondPdfFontSize, cellPadding: 2, halign: "center" },
        headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255], fontSize: secondPdfFontSize },
        alternateRowStyles: { fillColor: [245, 245, 250] },
        columnStyles: secondProfileColIdx >= 0 ? {
          [secondProfileColIdx]: { cellWidth: imgWidth + 5, halign: "center", valign: "middle" }
        } : {},
        didDrawCell: (data) => {
          if (data.column.index === secondProfileColIdx && data.row.section === "body" && secondProfileBase64s[data.row.index]) {
            const { x, y, width, height } = data.cell;
            doc.addImage(secondProfileBase64s[data.row.index], "JPEG", x + (width - imgWidth) / 2, y + (height - imgHeight) / 2, imgWidth, imgHeight);
          }
        },
      });
    }

    doc.save(`${getTodayString()}_${title}.pdf`);
  };

  // === EXPORT TO EXCEL WITH IMAGES ===
  const exportToExcel = async () => {
    const wb = XLSX.utils.book_new();
    const wsData: any[][] = [];

    // First table (Planned) - Header
    wsData.push([title]); // Section title
    wsData.push(columns.map(c => c.header)); // Column headers

    const images: any[] = [];
    const profileColIdx = columns.findIndex(c => c.header === "Profile Picture");

    // First table (Planned) - Data rows
    for (const [index, row] of data.entries()) {
      const excelRow: any[] = [];
      for (const [colIndex, col] of columns.entries()) {
        let value: any;
        if (typeof col.accessor === "function") {
          value = col.accessor(row, index);
        } else {
          value = (row as any)[col.accessor];
        }

        if (profileColIdx >= 0 && colIndex === profileColIdx && typeof value === "string" && value.startsWith("http")) {
          try {
            const res = await fetch(value);
            const blob = await res.blob();
            const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
            const base64Data = base64.split(",")[1];
            images.push({
              name: `img_${index}.jpg`,
              data: base64Data,
              opts: { base64: true },
              position: {
                type: 'twoCellAnchor',
                from: { col: profileColIdx + 1, row: index + 3 }, // +3 because of title row and header row
                to: { col: profileColIdx + 2, row: index + 4 }
              }
            });
            excelRow.push({ t: "s", v: "Image", l: { Target: value, Tooltip: "Profile Picture" } });
          } catch {
            excelRow.push({ t: "s", v: value, l: { Target: value, Tooltip: "Profile Picture" } });
          }
        } else {
          excelRow.push(typeof value === "string" ? value : String(value ?? ""));
        }
      }
      wsData.push(excelRow);
    }

    // Second table (Actual) if provided
    if (secondTable) {
      // Add spacing rows
      wsData.push([]);
      wsData.push([]);
      
      // Second table title
      wsData.push([secondTable.title]);
      wsData.push(secondTable.columns.map(c => c.header));

      const secondProfileColIdx = secondTable.columns.findIndex(c => c.header === "Profile Picture");
      const startRow = wsData.length; // Track where second table starts

      // Second table data rows
      for (const [index, row] of secondTable.data.entries()) {
        const excelRow: any[] = [];
        for (const [colIndex, col] of secondTable.columns.entries()) {
          let value: any;
          if (typeof col.accessor === "function") {
            value = col.accessor(row, index);
          } else {
            value = (row as any)[col.accessor];
          }

          if (secondProfileColIdx >= 0 && colIndex === secondProfileColIdx && typeof value === "string" && value.startsWith("http")) {
            try {
              const res = await fetch(value);
              const blob = await res.blob();
              const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });
              const base64Data = base64.split(",")[1];
              images.push({
                name: `img_actual_${index}.jpg`,
                data: base64Data,
                opts: { base64: true },
                position: {
                  type: 'twoCellAnchor',
                  from: { col: secondProfileColIdx + 1, row: startRow + index + 2 }, // +2 for title and header rows
                  to: { col: secondProfileColIdx + 2, row: startRow + index + 3 }
                }
              });
              excelRow.push({ t: "s", v: "Image", l: { Target: value, Tooltip: "Profile Picture" } });
            } catch {
              excelRow.push({ t: "s", v: value, l: { Target: value, Tooltip: "Profile Picture" } });
            }
          } else {
            excelRow.push(typeof value === "string" ? value : String(value ?? ""));
          }
        }
        wsData.push(excelRow);
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    if (images.length > 0) {
      ws["!images"] = images;
    }
    XLSX.utils.book_append_sheet(wb, ws, title);

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${getTodayString()}_${title}.xlsx`);
  };

  // === PRINT WITH IMAGES ===
  const printTable = async () => {
    const headerHtml = `
      <div style="text-align:center; margin-bottom:20px;">
        <img src="${logo.src ?? logo}" style="width:60px; height:60px;" alt="Logo" />
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

    // First table (Planned)
    const firstTableTitle = `<h3 style="margin-top:20px; margin-bottom:10px; color:#0066cc;">${title}</h3>`;
    const headRow = `<tr>${columns.map(c => `<th style="padding:8px; background:#0066cc; color:#fff;">${c.header}</th>`).join("")}</tr>`;
    const bodyRows = await Promise.all(
      data.map(async (row, idx) => {
        const cells = await Promise.all(
          columns.map(async (col) => {
            let value: any = typeof col.accessor === "function" ? col.accessor(row, idx) : (row as any)[col.accessor];
            if (col.header === "Profile Picture" && typeof value === "string" && value.startsWith("http")) {
              const base64 = await urlToBase64(value);
              return `<td style="padding:6px; border:1px solid #ddd; text-align:center;"><img src="${base64}" width="40" height="40" style="border-radius:50%;" /></td>`;
            }
            return `<td style="padding:6px; border:1px solid #ddd;">${value ?? ""}</td>`;
          })
        );
        return `<tr>${cells.join("")}</tr>`;
      })
    );

    // Second table (Actual) if provided
    let secondTableHtml = "";
    if (secondTable) {
      const secondTableTitle = `<h3 style="margin-top:40px; margin-bottom:10px; color:#0066cc;">${secondTable.title}</h3>`;
      const secondHeadRow = `<tr>${secondTable.columns.map(c => `<th style="padding:8px; background:#0066cc; color:#fff;">${c.header}</th>`).join("")}</tr>`;
      const secondBodyRows = await Promise.all(
        secondTable.data.map(async (row, idx) => {
          const cells = await Promise.all(
            secondTable.columns.map(async (col) => {
              let value: any = typeof col.accessor === "function" ? col.accessor(row, idx) : (row as any)[col.accessor];
              if (col.header === "Profile Picture" && typeof value === "string" && value.startsWith("http")) {
                const base64 = await urlToBase64(value);
                return `<td style="padding:6px; border:1px solid #ddd; text-align:center;"><img src="${base64}" width="40" height="40" style="border-radius:50%;" /></td>`;
              }
              return `<td style="padding:6px; border:1px solid #ddd;">${value ?? ""}</td>`;
            })
          );
          return `<tr>${cells.join("")}</tr>`;
        })
      );
      secondTableHtml = `${secondTableTitle}<table>${secondHeadRow}${secondBodyRows.join("")}</table>`;
    }

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>${title}</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        @font-face { font-family: 'Noto Sans Ethiopic'; src: url('/fonts/NotoSansEthiopic-Regular.ttf') format('truetype'); }
        table { width:100%; border-collapse:collapse; margin-bottom:20px; }
        th, td { font-family: 'Noto Sans Ethiopic', Arial, sans-serif; }
      </style>
      </head><body>${headerHtml}${firstTableTitle}<table>${headRow}${bodyRows.join("")}</table>${secondTableHtml}</body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-4">
        <button onClick={exportToPDF} className="btn-pdf flex items-center justify-center gap-2 text-white bg-red-600 px-4 py-2 rounded hover:bg-red-700 w-full sm:w-auto">
          <FileText size={18} /> PDF
        </button>
        <button onClick={exportToExcel} className="btn-excel flex items-center justify-center gap-2 text-white bg-green-600 px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto">
          <Sheet size={18} /> Excel
        </button>
        <button onClick={printTable} className="btn-print flex items-center justify-center gap-2 text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto">
          <Printer size={18} /> Print
        </button>
      </div>
    </div>
  );
};

export default GenericDownloads;
