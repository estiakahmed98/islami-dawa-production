
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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


  const removePrefix = (text: string) => text.replace(/^\d+_/, "");

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
    <div className="w-full mx-auto p-2">
      <h1 className="text-2xl font-bold text-center mb-6">Users Table</h1>

      {/* Filters Section */}
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

        <Input
          type="text"
          placeholder="Full Name"
          value={filters.name}
          onChange={(e) => handleFilterChange("name", e.target.value)}
        />
        <Input
          type="text"
          placeholder="Division"
          value={filters.division}
          onChange={(e) => handleFilterChange("division", e.target.value)}
        />
        <Input
          type="text"
          placeholder="District"
          value={filters.district}
          onChange={(e) => handleFilterChange("district", e.target.value)}
        />
        <Input
          type="text"
          placeholder="Upazila"
          value={filters.upazila}
          onChange={(e) => handleFilterChange("upazila", e.target.value)}
        />
        <Input
          type="text"
          placeholder="Union"
          value={filters.union}
          onChange={(e) => handleFilterChange("union", e.target.value)}
        />
        <Input
          type="text"
          placeholder="Markaz"
          value={filters.markaz}
          onChange={(e) => handleFilterChange("markaz", e.target.value)}
        />
      </div>

      {/* Users Table with ShadCN */}
      {loading ? (
        <p className="text-center text-xl p-10">Loading users...</p>
      ) : users.length > 0 ? (
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200 px-4">
          <Table className="overflow-x-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Division</TableHead>
                <TableHead className="font-semibold">District</TableHead>
                <TableHead className="font-semibold">Upazila</TableHead>
                <TableHead className="font-semibold">Union</TableHead>
                <TableHead className="font-semibold">Phone</TableHead>
                <TableHead className="font-semibold">Markaz</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {user.name}
                    </Link>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{removePrefix(user.division)}</TableCell>
                  <TableCell>{removePrefix(user.district)}</TableCell>
                  <TableCell>{removePrefix(user.upazila)}</TableCell>
                  <TableCell>{removePrefix(user.union)}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.markaz}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-center text-xl p-10">No users found.</p>
      )}
    </div>
  );
}
