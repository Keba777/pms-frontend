import { Printer, FileText, Sheet } from "lucide-react";

const Filters = () => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <select className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white">
          <option value="">Select Status</option>
          {/* Add project options */}
        </select>

        <select className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white">
          <option value="">Select Priority</option>
          {/* Add user options */}
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
          <button className="btn-pdf flex items-center gap-2">
            <FileText size={18} /> PDF
          </button>
          <button className="btn-excel flex items-center gap-2">
            <Sheet size={18} /> Excel
          </button>
          <button className="btn-print flex items-center gap-2">
            <Printer size={18} /> Print
          </button>
        </div>
      </div>

      {/* Hidden inputs */}
      <input
        type="hidden"
        name="task_start_date_from"
        id="task_start_date_from"
      />
      <input type="hidden" name="task_start_date_to" id="task_start_date_to" />
      <input type="hidden" name="task_end_date_from" id="task_end_date_from" />
      <input type="hidden" name="task_end_date_to" id="task_end_date_to" />
    </div>
  );
};

export default Filters;
