"use client";

import React, { useState } from "react";

// Define the structure of a request item
interface Request {
  id: number;
  name: string;
  type: string;
  requestDate: string;
  status: string;
}

const NotificationPage: React.FC = () => {
  // Sample dynamic request data
  const [requests, setRequests] = useState<Request[]>([
    {
      id: 1,
      name: "Estiak",
      type: "Change Info",
      requestDate: "Nov 12, 2025",
      status: "Pending",
    },
    {
      id: 2,
      name: "Juwel",
      type: "Add New Address",
      requestDate: "Nov 10, 2025",
      status: "Approved",
    },
    {
      id: 3,
      name: "Faysal",
      type: "Change Info",
      requestDate: "Nov 8, 2025",
      status: "Pending",
    },
  ]);

  // Handle status update
  const handleStatusChange = (id: number, newStatus: string) => {
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === id ? { ...request, status: newStatus } : request
      )
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">অনুমতি দিন</h1>
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-4 text-sm font-semibold text-gray-700">Name</th>
              <th className="p-4 text-sm font-semibold text-gray-700">
                Request Type
              </th>
              <th className="p-4 text-sm font-semibold text-gray-700">
                Request Date
              </th>
              <th className="p-4 text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="p-4 text-sm font-semibold text-gray-700">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr
                key={request.id}
                className="hover:bg-gray-50 transition duration-150"
              >
                <td className="p-4 text-sm text-gray-600">{request.name}</td>
                <td className="p-4 text-sm text-gray-600">{request.type}</td>
                <td className="p-4 text-sm text-gray-600">
                  {request.requestDate}
                </td>
                <td
                  className={`p-4 text-sm font-medium ${
                    request.status === "Approved"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {request.status}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleStatusChange(request.id, "Approved")}
                    className="px-3 py-1 mr-2 text-sm text-white bg-green-600 rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(request.id, "Describe Required")
                    }
                    className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Describe
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationPage;
