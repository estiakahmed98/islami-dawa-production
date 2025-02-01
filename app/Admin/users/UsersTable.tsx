"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  division: string;
  district: string;
  upazila: string;
  union: string;
  phone: string;
  area: string;
  markaz: string;
  banned: boolean;
}

interface Filters {
  role: string;
  name: string;
  division: string;
  district: string;
  upazila: string;
  union: string;
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
  });

  const { data, isPending } = useSession();
  const sessionUser = data?.user;

  useEffect(() => {
    if (isPending) return;
    if (!sessionUser) {
      console.log("User not authenticated");
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value.trim()) {
            params.append(key, value);
          }
        });

        const response = await fetch(`/api/usershow?${params.toString()}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`API error: ${response.statusText}`);
        }

        const text = await response.text();
        if (!text) {
          throw new Error("Empty response from API");
        }

        const data = JSON.parse(text);

        if (data?.users) {
          setUsers(data.users);
        } else {
          console.error("Invalid data structure:", data);
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filters, isPending, sessionUser]);

  const handleFilterChange = (name: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle Ban Status
  const toggleBan = async (userId: string, isBanned: boolean) => {
    try {
      const response = await fetch("/api/usershow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, banned: !isBanned }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`API error: ${response.statusText}`);
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, banned: !isBanned } : user
        )
      );

      toast.success(`User ${isBanned ? "unbanned" : "banned"} successfully!`);
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status.");
    }
  };

  // Delete User
  const handleDelete = async (userId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch("/api/usershow", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`API error: ${response.statusText}`);
      }

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));

      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.");
    }
  };

  if (isPending) {
    return <p className="text-center text-xl p-10">Authenticating...</p>;
  }

  return (
    <div className="w-full mx-auto p-2">
      <h1 className="text-2xl font-bold text-center mb-6">Users Table</h1>

      {/* Filters */}
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
        </select>

        {Object.keys(filters)
          .filter((key) => key !== "role")
          .map((key) => (
            <Input
              key={key}
              type="text"
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              value={filters[key as keyof Filters]}
              onChange={(e) =>
                handleFilterChange(key as keyof Filters, e.target.value)
              }
            />
          ))}
      </div>

      <div className="w-full border p-2 border-gray-300 rounded-lg shadow-md overflow-y-auto h-[65vh]">
        <Table className="w-full">
          <TableHeader className="sticky top-0 z-10 bg-white shadow-md border-2">
            <TableRow>
              <TableHead className="border-r text-center border-gray-300 text-gray-800 font-bold">
                Name
              </TableHead>
              <TableHead className="border-r text-center border-gray-300 text-gray-800 font-bold">
                Email
              </TableHead>
              <TableHead className="border-r text-center border-gray-300 text-gray-800 font-bold">
                Role
              </TableHead>
              <TableHead className="border-r text-center border-gray-300 text-gray-800 font-bold">
                Division
              </TableHead>
              <TableHead className="border-r text-center border-gray-300 text-gray-800 font-bold">
                District
              </TableHead>
              <TableHead className="border-r text-center border-gray-300 text-gray-800 font-bold">
                Upazila
              </TableHead>
              <TableHead className="border-r text-center border-gray-300 text-gray-800 font-bold">
                Union
              </TableHead>
              <TableHead className="border-r text-center border-gray-300 text-gray-800 font-bold">
                Phone
              </TableHead>
              <TableHead className="border-r text-center border-gray-300 text-gray-800 font-bold">
                Markaz
              </TableHead>
              <TableHead className="border-r text-center border-gray-300 text-gray-800 font-bold">
                Status
              </TableHead>
              <TableHead className="border-r text-center border-gray-300 text-gray-800 font-bold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="border-r border-gray-300">
                  {user.name}
                </TableCell>
                <TableCell className="border-r border-gray-300">
                  {user.email}
                </TableCell>
                <TableCell className="border-r border-gray-300">
                  {user.role}
                </TableCell>
                <TableCell className="border-r border-gray-300">
                  {user.division}
                </TableCell>
                <TableCell className="border-r border-gray-300">
                  {user.district}
                </TableCell>
                <TableCell className="border-r border-gray-300">
                  {user.upazila}
                </TableCell>
                <TableCell className="border-r border-gray-300">
                  {user.union}
                </TableCell>
                <TableCell className="border-r border-gray-300">
                  {user.phone}
                </TableCell>
                <TableCell className="border-r border-gray-300">
                  {user.markaz}
                </TableCell>
                <TableCell className="border-r border-gray-300">
                  {user.banned ? "Banned" : "Active"}
                </TableCell>
                <TableCell className="flex space-x-2">
                  <Button
                    onClick={() => toggleBan(user.id, user.banned)}
                    className={user.banned ? "bg-red-500" : "bg-green-500"}
                  >
                    {user.banned ? "Unban" : "Ban"}
                  </Button>

                  <Button
                    onClick={() => handleDelete(user.id)}
                    className="bg-red-800"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
