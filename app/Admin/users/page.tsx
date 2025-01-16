"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  division: string;
  district: string;
  upazila: string;
  union: string;
  phone: string;
  markaz: string;
}

interface Filters {
  role: string;
  name: string;
  division: string;
  district: string;
  upazila: string;
  union: string;
  markaz: string;
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<Filters>({
    role: "",
    name: "",
    division: "",
    district: "",
    upazila: "",
    union: "",
    markaz: "",
  });
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const role = JSON.parse(localStorage.getItem("user") || "{}").role || "";
    setUserRole(role);
  }, []);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
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

  const handleFilterChange = (name: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Users Table</h1>
      <div className="mb-4 grid grid-cols-3 md:grid-cols-6 gap-4">
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
          <option value="daye">Da'ee</option>
          <option value="user">User</option>
          <option value="markaz">Markaz</option>
        </select>

        <input
          type="text"
          placeholder="Full Name"
          value={filters.name}
          onChange={(e) => handleFilterChange("name", e.target.value)}
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
          value={filters.union}
          onChange={(e) => handleFilterChange("union", e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2"
        />
        <input
          type="text"
          placeholder="markaz"
          value={filters.markaz}
          onChange={(e) => handleFilterChange("markaz", e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2"
        />
      </div>

      {loading ? (
        <p className="text-center text-xl p-10">Loading users...</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {/* <th>ID</th> */}
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Division</th>
                <th>District</th>
                <th>Upazila</th>
                <th>Union</th>
                <th>Phone</th>
                <th>Markaz</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    {/* <td>{user.id}</td> */}
                    <td className="bg-red-500 items-center">
                      <Link href={`/admin/users/${user.id}`}>{user.name}</Link>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.division}</td>
                    <td>{user.district}</td>
                    <td>{user.upazila}</td>
                    <td>{user.union}</td>
                    <td>{user.phone}</td>
                    <td>{user.markaz}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
