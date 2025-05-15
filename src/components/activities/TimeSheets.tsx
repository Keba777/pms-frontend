import React, { useState } from "react";

const laborData = [
  {
    id: 1,
    days: "Monday",
    date: "2025-05-12",
    morningIn: "02:30",
    morningOut: "05:45",
    mornHrs: 3.25,
    bt: 0.5,
    afternoonIn: "08:10",
    afternoonOut: "11:50",
    aftHrs: 3.67,
    ot: 1,
    dt: 0,
    rate: 20,
    totalPay: ((3.25 + 3.67 + 1) * 20).toFixed(2),
  },
  {
    id: 2,
    days: "Tuesday",
    date: "2025-05-13",
    morningIn: "03:15",
    morningOut: "06:00",
    mornHrs: 2.75,
    bt: 0.5,
    afternoonIn: "09:00",
    afternoonOut: "12:00",
    aftHrs: 3,
    ot: 0.5,
    dt: 0,
    rate: 20,
    totalPay: ((2.75 + 3 + 0.5) * 20).toFixed(2),
  },
  {
    id: 3,
    days: "Wednesday",
    date: "2025-05-14",
    morningIn: "02:00",
    morningOut: "06:00",
    mornHrs: 4,
    bt: 1,
    afternoonIn: "08:30",
    afternoonOut: "12:00",
    aftHrs: 3.5,
    ot: 2,
    dt: 0,
    rate: 20,
    totalPay: ((4 + 3.5 + 2) * 20).toFixed(2),
  },
  {
    id: 4,
    days: "Thursday",
    date: "2025-05-15",
    morningIn: "04:00",
    morningOut: "06:00",
    mornHrs: 2,
    bt: 0.5,
    afternoonIn: "08:00",
    afternoonOut: "12:00",
    aftHrs: 4,
    ot: 1,
    dt: 0,
    rate: 20,
    totalPay: ((2 + 4 + 1) * 20).toFixed(2),
  },
  {
    id: 5,
    days: "Friday",
    date: "2025-05-16",
    morningIn: "02:45",
    morningOut: "05:15",
    mornHrs: 2.5,
    bt: 0.5,
    afternoonIn: "09:15",
    afternoonOut: "12:00",
    aftHrs: 2.75,
    ot: 0,
    dt: 0,
    rate: 20,
    totalPay: ((2.5 + 2.75) * 20).toFixed(2),
  },
];

const equipmentData = [
  {
    id: 1,
    days: "Monday",
    date: "2025-05-12",
    morningIn: "02:15",
    morningOut: "05:00",
    mornHrs: 2.75,
    bt: 0.5,
    afternoonIn: "08:05",
    afternoonOut: "11:55",
    aftHrs: 3.83,
    ot: 1,
    dt: 0,
    rate: 50,
    totalPay: ((2.75 + 3.83 + 1) * 50).toFixed(2),
  },
  {
    id: 2,
    days: "Tuesday",
    date: "2025-05-13",
    morningIn: "03:00",
    morningOut: "06:00",
    mornHrs: 3,
    bt: 0.5,
    afternoonIn: "09:10",
    afternoonOut: "12:00",
    aftHrs: 2.83,
    ot: 0.5,
    dt: 0,
    rate: 50,
    totalPay: ((3 + 2.83 + 0.5) * 50).toFixed(2),
  },
  {
    id: 3,
    days: "Wednesday",
    date: "2025-05-14",
    morningIn: "02:30",
    morningOut: "06:00",
    mornHrs: 3.5,
    bt: 1,
    afternoonIn: "08:30",
    afternoonOut: "12:00",
    aftHrs: 3.5,
    ot: 2,
    dt: 0,
    rate: 50,
    totalPay: ((3.5 + 3.5 + 2) * 50).toFixed(2),
  },
  {
    id: 4,
    days: "Thursday",
    date: "2025-05-15",
    morningIn: "04:15",
    morningOut: "06:00",
    mornHrs: 1.75,
    bt: 0.5,
    afternoonIn: "08:00",
    afternoonOut: "12:00",
    aftHrs: 4,
    ot: 1,
    dt: 0,
    rate: 50,
    totalPay: ((1.75 + 4 + 1) * 50).toFixed(2),
  },
  {
    id: 5,
    days: "Friday",
    date: "2025-05-16",
    morningIn: "02:45",
    morningOut: "05:15",
    mornHrs: 2.5,
    bt: 0.5,
    afternoonIn: "09:20",
    afternoonOut: "12:00",
    aftHrs: 2.67,
    ot: 0,
    dt: 0,
    rate: 50,
    totalPay: ((2.5 + 2.67) * 50).toFixed(2),
  },
];

const materialData = [
  {
    id: 1,
    date: "2025-05-12",
    material: "Cement",
    type: "Construction",
    unit: "kg",
    receivedQty: 1000,
    utilizedQty: 600,
    balance: 400,
    assignedTo: "Site A",
    remark: "Checked",
    status: "In Stock",
  },
  {
    id: 2,
    date: "2025-05-13",
    material: "Sand",
    type: "Construction",
    unit: "m³",
    receivedQty: 20,
    utilizedQty: 12,
    balance: 8,
    assignedTo: "Site B",
    remark: "Good",
    status: "In Stock",
  },
  {
    id: 3,
    date: "2025-05-14",
    material: "Steel Bars",
    type: "Rebar",
    unit: "kg",
    receivedQty: 500,
    utilizedQty: 450,
    balance: 50,
    assignedTo: "Site A",
    remark: "Rust-free",
    status: "Low Stock",
  },
  {
    id: 4,
    date: "2025-05-15",
    material: "Paint",
    type: "Finishing",
    unit: "ltr",
    receivedQty: 100,
    utilizedQty: 80,
    balance: 20,
    assignedTo: "Site C",
    remark: "Premium",
    status: "Low Stock",
  },
  {
    id: 5,
    date: "2025-05-16",
    material: "Bricks",
    type: "Building",
    unit: "pcs",
    receivedQty: 2000,
    utilizedQty: 1500,
    balance: 500,
    assignedTo: "Site B",
    remark: "Standard",
    status: "In Stock",
  },
];

// Table components
const TableWrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-gray-100 border border-gray-300">
      {children}
    </table>
  </div>
);

interface TableHeaderProps {
  columns: string[];
}

const TableHeader: React.FC<TableHeaderProps> = ({ columns }) => (
  <thead className="bg-cyan-700 text-white">
    <tr>
      {columns.map((col) => (
        <th key={col} className="px-4 py-2 border">
          {col}
        </th>
      ))}
      <th className="px-4 py-2 border">Action</th>
    </tr>
  </thead>
);

const LaborSheet = () => {
  const cols = [
    "#",
    "Days",
    "Date",
    "Morning In",
    "Morning Out",
    "Hrs",
    "BT",
    "Afternoon In",
    "Afternoon Out",
    "Hrs",
    "OT",
    "DT",
    "Rate",
    "Total Pay",
  ];
  return (
    <TableWrapper>
      <TableHeader columns={cols} />
      <tbody>
        {laborData.map((row) => (
          <tr key={row.id} className="bg-white even:bg-gray-100">
            <td className="px-4 py-2 border">{row.id}</td>
            <td className="px-4 py-2 border">{row.days}</td>
            <td className="px-4 py-2 border">{row.date}</td>
            <td className="px-4 py-2 border">{row.morningIn}</td>
            <td className="px-4 py-2 border">{row.morningOut}</td>
            <td className="px-4 py-2 border">{row.mornHrs}</td>
            <td className="px-4 py-2 border">{row.bt}</td>
            <td className="px-4 py-2 border">{row.afternoonIn}</td>
            <td className="px-4 py-2 border">{row.afternoonOut}</td>
            <td className="px-4 py-2 border">{row.aftHrs}</td>
            <td className="px-4 py-2 border">{row.ot}</td>
            <td className="px-4 py-2 border">{row.dt}</td>
            <td className="px-4 py-2 border">{row.rate}</td>
            <td className="px-4 py-2 border">{row.totalPay}</td>
            <td className="px-4 py-2 border">
              <button className="px-2 py-1 bg-cyan-700 text-white rounded">
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </TableWrapper>
  );
};

const EquipmentSheet = () => {
  const cols = [
    "#",
    "Days",
    "Date",
    "Morning In",
    "Morning Out",
    "Hrs",
    "BT",
    "Afternoon In",
    "Afternoon Out",
    "Hrs",
    "OT",
    "DT",
    "Rate",
    "Total Pay",
  ];
  return (
    <TableWrapper>
      <TableHeader columns={cols} />
      <tbody>
        {equipmentData.map((row) => (
          <tr key={row.id} className="bg-white even:bg-gray-100">
            <td className="px-4 py-2 border">{row.id}</td>
            <td className="px-4 py-2 border">{row.days}</td>
            <td className="px-4 py-2 border">{row.date}</td>
            <td className="px-4 py-2 border">{row.morningIn}</td>
            <td className="px-4 py-2 border">{row.morningOut}</td>
            <td className="px-4 py-2 border">{row.mornHrs}</td>
            <td className="px-4 py-2 border">{row.bt}</td>
            <td className="px-4 py-2 border">{row.afternoonIn}</td>
            <td className="px-4 py-2 border">{row.afternoonOut}</td>
            <td className="px-4 py-2 border">{row.aftHrs}</td>
            <td className="px-4 py-2 border">{row.ot}</td>
            <td className="px-4 py-2 border">{row.dt}</td>
            <td className="px-4 py-2 border">{row.rate}</td>
            <td className="px-4 py-2 border">{row.totalPay}</td>
            <td className="px-4 py-2 border">
              <button className="px-2 py-1 bg-cyan-700 text-white rounded">
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </TableWrapper>
  );
};

const MaterialSheet = () => {
  const cols = [
    "#",
    "Date",
    "Material Name",
    "Type",
    "Unit",
    "Received Qty",
    "Utilized Qty",
    "Balance",
    "Assigned To",
    "Remark",
    "Status",
  ];
  return (
    <TableWrapper>
      <TableHeader columns={cols} />
      <tbody>
        {materialData.map((row) => (
          <tr key={row.id} className="bg-white even:bg-gray-100">
            <td className="px-4 py-2 border">{row.id}</td>
            <td className="px-4 py-2 border">{row.date}</td>
            <td className="px-4 py-2 border">{row.material}</td>
            <td className="px-4 py-2 border">{row.type}</td>
            <td className="px-4 py-2 border">{row.unit}</td>
            <td className="px-4 py-2 border">{row.receivedQty}</td>
            <td className="px-4 py-2 border">{row.utilizedQty}</td>
            <td className="px-4 py-2 border">{row.balance}</td>
            <td className="px-4 py-2 border">{row.assignedTo}</td>
            <td className="px-4 py-2 border">{row.remark}</td>
            <td className="px-4 py-2 border">{row.status}</td>
            <td className="px-4 py-2 border">
              <button className="px-2 py-1 bg-cyan-700 text-white rounded">
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </TableWrapper>
  );
};

// Parent component with horizontal navbar
export default function TimeSheets() {
  const tabs = [
    "Labor Timesheet",
    "Equipment Timesheet",
    "Material Balance Sheet",
  ];
  const [active, setActive] = useState(tabs[0]);

  const renderSheet = () => {
    switch (active) {
      case tabs[0]:
        return <LaborSheet />;
      case tabs[1]:
        return <EquipmentSheet />;
      case tabs[2]:
        return <MaterialSheet />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <nav className="flex border-b border-gray-300 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-2 -mb-px font-semibold ${
              active === tab
                ? "border-b-2 border-cyan-700 text-cyan-700"
                : "text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>
      <div>{renderSheet()}</div>
    </div>
  );
}
