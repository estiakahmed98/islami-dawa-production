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
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
        const response = await fetch(`/api/usershow`);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isPending, sessionUser]);

  useEffect(() => {
    const filtered = users.filter((user) =>
      Object.entries(filters).every(
        ([key, value]) => !value || (typeof user[key as keyof User] === 'string' && (user[key as keyof User] as string)?.toLowerCase().includes(value.toLowerCase()))
      )
    );

    setFilteredUsers(filtered);
  }, [filters, users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !sessionUser || sessionUser.role !== "centraladmin")
      return;

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const updates = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as string,
      division: formData.get("division") as string,
      district: formData.get("district") as string,
      upazila: formData.get("upazila") as string,
      union: formData.get("union") as string,
      phone: formData.get("phone") as string,
      area: formData.get("area") as string,
      markaz: formData.get("markaz") as string,
    };
    const note = formData.get("note") as string;

    try {
      const response = await fetch("/api/usershow", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id, updates, note }),
      });

      if (!response.ok) throw new Error("Update failed");

      // Refresh user list
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).map(([key, value]) => [key, value.toString()])
        )
      );
      const res = await fetch(`/api/usershow?${params.toString()}`);
      const data = await res.json();
      setUsers(data.users);

      setSelectedUser(null);
      toast.success("User updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update user");
    }
  };

  const handleFilterChange = (name: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value.toString() }));
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


  const getParentEmail = (user: User, users: User[]): string | null => {
    let parentUser: User | undefined;
    switch (user.role) {
      case "divisionadmin":
        parentUser = users.find((u) => u.role === "centraladmin");
        break;
      case "districtadmin":
        parentUser = users.find(
          (u) => u.role === "divisionadmin" && u.division === user.division
        );
        break;
      case "upozilaadmin":
        parentUser = users.find(
          (u) => u.role === "districtadmin" && u.district === user.district
        );
        break;
      case "unionadmin":
        parentUser = users.find(
          (u) => u.role === "upozilaadmin" && u.upazila === user.upazila
        );
        break;
      case "daye":
        // Step 1: Try to find a unionadmin in the same union
        parentUser = users.find(
          (u) => u.role === "unionadmin" && u.union === user.union
        );

        // Step 2: If no unionadmin is found, find a upozila in the same upozila
        if (!parentUser) {
          parentUser = users.find(
            (u) => u.role === "upozilaadmin" && u.upazila === user.upazila
          );
        }

        // Step 3: If no unionadmin is found, find a districtadmin in the same district
        if (!parentUser) {
          parentUser = users.find(
            (u) => u.role === "districtadmin" && u.district === user.district
          );
        }
        // Step 4: If no districtadmin is found, find a divisiontadmin in the same division
        if (!parentUser) {
          parentUser = users.find(
            (u) => u.role === "divisionadmin" && u.division === user.division
          );
        }
        break;

      default:
        return null;
    }
    return parentUser ? `${parentUser.name} (${parentUser.role})` : null;
  };


  return (
    <div className="w-full mx-auto p-2">
      <h1 className="text-2xl font-bold text-center mb-6">Users Table</h1>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-3 md:grid-cols-6 gap-4">
        <select
          value={filters.role}
          onChange={(e) => handleFilterChange("role", e.target.value)}
          className="border border-slate-500 rounded-md px-4 py-2"
        >
          <option value="">All Roles</option>
          <option value="centraladmin">Central Admin</option>
          <option value="divisionadmin">Division Admin</option>
          <option value="districtadmin">District Admin</option>
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
              className="border-slate-500"
              value={filters[key as keyof Filters]}
              onChange={(e) =>
                handleFilterChange(key as keyof Filters, e.target.value)
              }
            />
          ))}
      </div>

      <div className="w-full border border-gray-300 rounded-lg shadow-md overflow-y-auto h-[65vh]">
        <Table className="w-full">
          <TableHeader className="sticky top-0 z-10 bg-teal-100 shadow-md border-b-2">
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
                Admin Assigned
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
          {filteredUsers.map((user) => (
              <TableRow key={user.id} className="text-center">
                <TableCell
                  className="border-r hover:text-green-700  cursor-pointer hover:underline"
                  onClick={() => setSelectedUser(user)}
                >
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
                <TableCell className="border-r border-gray-300 text-center">
                  {getParentEmail(user, users) || "N/A"}
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

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              Edit User: {selectedUser.name}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label>Name</label>
                  <Input
                    name="name"
                    defaultValue={selectedUser.name}
                    readOnly={sessionUser?.role !== "centraladmin"}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label>Email</label>
                  <Input
                    name="email"
                    type="email"
                    defaultValue={selectedUser.email}
                    readOnly={sessionUser?.role !== "centraladmin"}
                    required
                  />
                </div>

                {/* Role Dropdown */}
                <div>
                  <label>Role</label>
                  <select
                    name="role"
                    defaultValue={selectedUser.role}
                    disabled={sessionUser?.role !== "centraladmin"}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="centraladmin">Central Admin</option>
                    <option value="divisionadmin">Division Admin</option>
                    <option value="districtadmin">District Admin</option>
                    <option value="areaadmin">Area Admin</option>
                    <option value="upozilaadmin">Upazila Admin</option>
                    <option value="daye">Da'ee</option>
                  </select>
                </div>

                {/* Location Fields */}
                {["division", "district", "upazila", "union"].map((field) => (
                  <div key={field}>
                    <label>
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <Input
                      name={field}
                      defaultValue={selectedUser[field as keyof User] as string}
                      readOnly={sessionUser?.role !== "centraladmin"}
                      required
                    />
                  </div>
                ))}

                {/* Phone */}
                <div>
                  <label>Phone</label>
                  <Input
                    name="phone"
                    defaultValue={selectedUser.phone}
                    readOnly={sessionUser?.role !== "centraladmin"}
                    required
                  />
                </div>

                {/* Note Field (Central Admin Only) */}
                {sessionUser?.role === "centraladmin" && (
                  <div className="col-span-2">
                    <label>Note (Reason for Changes)</label>
                    <textarea
                      name="note"
                      required
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  variant="outline"
                >
                  Cancel
                </Button>
                {sessionUser?.role === "centraladmin" && (
                  <Button type="submit">Save Changes</Button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

