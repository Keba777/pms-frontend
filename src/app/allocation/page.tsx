import { useRequests } from "@/hooks/useRequests";
import React from "react";

const AllocationPage = () => {
  const { data: requests } = useRequests();
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {requests?.map((request) => (
              <td key={request.id}>
                {request.status} - {request.status}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AllocationPage;
