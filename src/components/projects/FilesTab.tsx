// components/tabs/FileTable.tsx
import React from "react";

interface FileRecord {
  id: number;
  date: string;
  title: string;
  uploadedBy: string;
  sendTo: string;
  fileName: string;
  action: string;
}

const sampleFiles: FileRecord[] = [
  {
    id: 1,
    date: "2025-05-10 09:32",
    title: "Project_Specifications.pdf",
    uploadedBy: "Alice Johnson",
    sendTo: "Team Leads",
    fileName: "Project_Specifications.pdf",
    action: "Download",
  },
  {
    id: 2,
    date: "2025-05-12 14:15",
    title: "Wireframe_Mockup.png",
    uploadedBy: "Bob Smith",
    sendTo: "Design Team",
    fileName: "Wireframe_Mockup.png",
    action: "Preview",
  },
  {
    id: 3,
    date: "2025-05-15 11:47",
    title: "Budget_Overview.xlsx",
    uploadedBy: "Carol Lee",
    sendTo: "Finance Dept",
    fileName: "Budget_Overview.xlsx",
    action: "Download",
  },
];

export default function FileTable() {
  return (
    <div>
      <h1 className="my-6 text-3xl font-bold">File Table</h1>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-cyan-700 text-gray-100">
            <th className="border px-3 py-2">#</th>
            <th className="border px-3 py-2">Date with Time</th>
            <th className="border px-3 py-2">Title</th>
            <th className="border px-3 py-2">Uploaded By</th>
            <th className="border px-3 py-2">Send To</th>
            <th className="border px-3 py-2">Uploaded File</th>
            <th className="border px-3 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {sampleFiles.map((file) => (
            <tr key={file.id} className="hover:bg-gray-50">
              <td className="border px-3 py-2 text-center">{file.id}</td>
              <td className="border px-3 py-2">{file.date}</td>
              <td className="border px-3 py-2">{file.title}</td>
              <td className="border px-3 py-2">{file.uploadedBy}</td>
              <td className="border px-3 py-2">{file.sendTo}</td>
              <td className="border px-3 py-2">
                <a
                  href={`/${file.fileName}`}
                  className="text-blue-600 hover:underline"
                >
                  {file.fileName}
                </a>
              </td>
              <td className="border px-3 py-2">
                <button className="text-cyan-700 hover:underline">
                  {file.action}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
