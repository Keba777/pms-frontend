import { Printer, FileText, Sheet } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Project } from "@/types/project";

interface FiltersProps {
  projects: Project[];
}

const Filters: React.FC<FiltersProps> = ({ projects }) => {
  // Function to generate and download a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Project List", 20, 10);
    autoTable(doc, {
      head: [["No", "Project", "Start Date", "End Date", "Budget", "Status"]],
      body: projects.map((proj, index) => [
        index + 1,
        proj.title,
        new Date(proj.start_date).toISOString().split("T")[0],
        new Date(proj.end_date).toISOString().split("T")[0],
        proj.budget.toLocaleString(),
        proj.status,
      ]),
    });
    doc.save("Projects.pdf");
  };

  // Function to generate and download an Excel file
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      projects.map((proj, index) => ({
        No: index + 1,
        Project: proj.title,
        "Start Date": new Date(proj.start_date).toISOString().split("T")[0],
        "End Date": new Date(proj.end_date).toISOString().split("T")[0],
        Budget: proj.budget,
        Status: proj.status,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Projects");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Projects.xlsx");
  };

  // Function to print the table
  const printTable = () => {
    window.print();
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <select className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white">
          <option value="">Select Status</option>
        </select>
        <select className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white">
          <option value="">Select Priority</option>
        </select>
        <div className="flex rounded-md shadow-sm">
          <input
            type="date"
            id="task_start_date_between"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Start Date Between"
          />
        </div>
        <div className="flex rounded-md shadow-sm">
          <input
            type="date"
            id="task_end_date_between"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="End Date Between"
          />
        </div>
      </div>

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
    </div>
  );
};

export default Filters;
