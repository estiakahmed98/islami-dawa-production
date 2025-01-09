"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  division: string;
  district: string;
  upazila: string;
  tunion: string;
  phoneNumber: string;
  markaz: string;
}

interface Filters {
  role: string;
  fullName: string;
  division: string;
  district: string;
  upazila: string;
  tunion: string;
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<Filters>({
    role: "",
    fullName: "",
    division: "",
    district: "",
    upazila: "",
    tunion: "",
  });
  const [userRole, setUserRole] = useState<string>("");

  // Fetch user role from localStorage
  useEffect(() => {
    const role = JSON.parse(localStorage.getItem("user") || "{}")?.role || "";
    setUserRole(role);
  }, []);

  // Fetch users based on filters
  useEffect(() => {
    async function fetchUsers() {
      try {
        const query = Object.entries(filters)
          .filter(([_, value]) => value)
          .map(
            ([key, value]) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
          )
          .join("&");

        const response = await fetch(`/api/users${query ? `?${query}` : ""}`);
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data: User[] = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [filters]);

  // Handle filter change
  const handleFilterChange = (name: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Handle delete user
  const handleDelete = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        alert("User deleted successfully");
      } else {
        const errorData = await response.text();
        throw new Error(errorData);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <p className="mx-auto text-xl text-cyan-700 text-center p-28">
        Loading users...
      </p>
    );
  }

  return (
    <div className="w-full mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Users Table</h1>

      {/* Filter Section */}
      <div className="mb-4 grid grid-cols-3 md:grid-cols-6 gap-4">
        {/* Role Filter */}
        <select
          value={filters.role}
          onChange={(e) => handleFilterChange("role", e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2"
        >
          <option value="">All Roles</option>
          <option value="centraladmin">Central Admin</option>
          <option value="divisionadmin">Division Admin</option>
          <option value="districtadmin">District Admin</option>
          <option value="areaadmin">Area Admin</option>
          <option value="upozilaadmin">Upazila Admin</option>
          <option value="daye">Da&apos;ee</option>
          <option value="user">User</option>
        </select>

        {/* Other Filters */}
        <input
          type="text"
          placeholder="Full Name"
          value={filters.fullName}
          onChange={(e) => handleFilterChange("fullName", e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2"
        />
        <input
          type="text"
          placeholder="Division"
          value={filters.division}
          onChange={(e) => handleFilterChange("division", e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2"
        />
        <input
          type="text"
          placeholder="District"
          value={filters.district}
          onChange={(e) => handleFilterChange("district", e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2"
        />
        <input
          type="text"
          placeholder="Upazila"
          value={filters.upazila}
          onChange={(e) => handleFilterChange("upazila", e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2"
        />
        <input
          type="text"
          placeholder="Union"
          value={filters.tunion}
          onChange={(e) => handleFilterChange("tunion", e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2"
        />
      </div>

      <div className="overflow-x-auto shadow-lg text-center rounded-lg">
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Role</th>
              <th className="border border-gray-300 px-4 py-2">Division</th>
              <th className="border border-gray-300 px-4 py-2">District</th>
              <th className="border border-gray-300 px-4 py-2">Upazila</th>
              <th className="border border-gray-300 px-4 py-2">Union</th>
              <th className="border border-gray-300 px-4 py-2">Phone Number</th>
              <th className="border border-gray-300 px-4 py-2">Markaz</th>
              {userRole === "centraladmin" && (
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="odd:bg-white even:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    {user.id}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="hover:underline hover:text-blue-500"
                    >
                      {user.fullName}
                    </Link>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {user.email}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {user.role}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {user.division.split("_")[1]}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {user.district.split("_")[1]}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {user.upazila.split("_")[1]}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {user.tunion.split("_")[1]}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {user.phoneNumber}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {user.markaz}
                  </td>
                  {userRole === "centraladmin" && (
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={11}
                  className="text-center px-4 py-2 border border-gray-300"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
