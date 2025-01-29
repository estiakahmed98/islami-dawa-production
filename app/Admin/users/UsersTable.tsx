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
  area: string;
  phone: string;
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
    area: "",
    phone: "",
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

      const data = await response.json();
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, banned: !isBanned } : user
        )
      );
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  if (isPending) {
    return <p className="text-center text-xl p-10">Authenticating...</p>;
  }

  return (
    <div className="w-full mx-auto p-2">
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>District</TableHead>
            <TableHead>Upazila</TableHead>
            <TableHead>Union</TableHead>
            <TableHead>Area</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Markaz</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.division}</TableCell>
              <TableCell>{user.district}</TableCell>
              <TableCell>{user.upazila}</TableCell>
              <TableCell>{user.union}</TableCell>
              <TableCell>{user.area}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>{user.markaz}</TableCell>
              <TableCell>{user.banned ? "Banned" : "Active"}</TableCell>
              <TableCell>
                <Button
                  onClick={() => toggleBan(user.id, user.banned)}
                  className={user.banned ? "bg-red-500" : "bg-green-500"}
                >
                  {user.banned ? "Unban" : "Ban"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
