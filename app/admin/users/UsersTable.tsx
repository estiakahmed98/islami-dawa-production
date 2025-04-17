"use client";

import type React from "react";

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
import { divisions, districts, upazilas, unions } from "@/app/data/bangla";
import markazList from "@/app/data/markazList";
import AdminTable from "@/components/AdminTable";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabButton";
import { userMoktobBisoyData } from "@/app/data/moktobBisoyUserData";
import { userDawatiBisoyData } from "@/app/data/dawatiBisoyUserData";
import { userDawatiMojlishData } from "@/app/data/dawatiMojlishUserData";
import { userJamatBisoyData } from "@/app/data/jamatBisoyUserData";
import { userDineFeraData } from "@/app/data/dineferaUserData";
import { userSoforBishoyData } from "@/app/data/soforBishoyUserData";
import { userDayeData } from "@/app/data/dayiUserData";
import { userTalimBisoyData } from "@/app/data/talimBisoyUserData";
import { TablePdfExporter } from "@/components/TablePdfExporter";

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

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; title: string }>;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  value,
  onChange,
  options,
}) => {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border rounded-md"
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option className="truncate" key={option.value} value={option.value}>
            {option.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default function UsersTable() {
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [divisionId, setDivisionId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [districtId, setDistrictId] = useState<string>("");
  const [upazilaId, setUpazilaId] = useState<string>("");
  const [unionId, setUnionId] = useState<string>("");
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
  const [emailList, setEmailList] = useState<string[]>([]);
  const [showFirstModal, setShowFirstModal] = useState(false);
  const [showSecondModal, setShowSecondModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showSaveFirstModal, setShowSaveFirstModal] = useState(false);
  const [showSaveSecondModal, setShowSaveSecondModal] = useState(false);

  useEffect(() => {
    if (isPending || !sessionUser) return;

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
        ([key, value]) =>
          !value ||
          (typeof user[key as keyof User] === "string" &&
            (user[key as keyof User] as string)
              ?.toLowerCase()
              .includes(value.toLowerCase()))
      )
    );

    setFilteredUsers(filtered);
    setEmailList(filtered.map((user) => user.email)); // Extract filtered emails
  }, [filters, users]); // Runs when users or filters change

  // 1. Update the form submission handler to use the new modal flow
  // Replace the existing handleSubmit function with this new implementation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSaveFirstModal(true);
  };

  // 2. Add the new handleFinalSubmit function after the handleSubmit function
  const handleFinalSubmit = async () => {
    if (!selectedUser || !sessionUser || sessionUser.role !== "centraladmin")
      return;

    const formData = new FormData(
      document.getElementById("edit-user-form") as HTMLFormElement
    );

    try {
      // Convert IDs to names
      const divisionId = formData.get("divisionId") as string;
      const districtId = formData.get("districtId") as string;
      const upazilaId = formData.get("upazilaId") as string;
      const unionId = formData.get("unionId") as string;

      const division =
        divisions.find((d) => d.value.toString() === divisionId)?.title || "";
      const district =
        districts[divisionId]?.find((d) => d.value.toString() === districtId)
          ?.title || "";
      const upazila =
        upazilas[districtId]?.find((u) => u.value.toString() === upazilaId)
          ?.title || "";
      const union =
        unions[upazilaId]?.find((u) => u.value.toString() === unionId)?.title ||
        "";

      const updates = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        role: formData.get("role") as string,
        division,
        district,
        upazila,
        union,
        phone: formData.get("phone") as string,
        area: formData.get("area") as string,
        markaz: formData.get("markaz") as string,
      };
      const note = formData.get("note") as string;

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
    } finally {
      setShowSaveFirstModal(false);
      setShowSaveSecondModal(false);
    }
  };

  // Initialize location IDs when user is selected
  useEffect(() => {
    if (selectedUser) {
      // Find division ID
      const division = divisions.find((d) => d.title === selectedUser.division);
      setDivisionId(division?.value.toString() || "");

      // Find district ID
      const districtList = division ? districts[division.value] : [];
      const district = districtList.find(
        (d) => d.title === selectedUser.district
      );
      setDistrictId(district?.value.toString() || "");

      // Find upazila ID
      const upazilaList = district ? upazilas[district.value] : [];
      const upazila = upazilaList.find((u) => u.title === selectedUser.upazila);
      setUpazilaId(upazila?.value.toString() || "");

      // Find union ID
      const unionList = upazila ? unions[upazila.value] : [];
      const union = unionList.find((u) => u.title === selectedUser.union);
      setUnionId(union?.value.toString() || "");
    }
  }, [selectedUser]);

  const handleLocationChange = (name: string, value: string) => {
    switch (name) {
      case "divisionId":
        setDivisionId(value);
        setDistrictId("");
        setUpazilaId("");
        setUnionId("");
        break;
      case "districtId":
        setDistrictId(value);
        setUpazilaId("");
        setUnionId("");
        break;
      case "upazilaId":
        setUpazilaId(value);
        setUnionId("");
        break;
      case "unionId":
        setUnionId(value);
        break;
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

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setShowFirstModal(true);
  };

  const handleFinalDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch("/api/usershow", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userToDelete }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`API error: ${response.statusText}`);
      }

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== userToDelete)
      );
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.");
    } finally {
      setShowFirstModal(false);
      setShowSecondModal(false);
      setUserToDelete(null);
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
      case "markazadmin":
        parentUser = users.find(
          (u) => u.role === "divisionadmin" && u.division === user.division
        );
        if (!parentUser) {
          parentUser = users.find((u) => u.role === "centraladmin");
        }
        break;
      case "daye":
        parentUser = users.find(
          (u) => u.role === "markazadmin" && u.markaz === user.markaz
        );
        if (!parentUser) {
          parentUser = users.find((u) => u.role === "centraladmin");
        }
        break;

      default:
        return null;
    }
    return parentUser ? `${parentUser.name} (${parentUser.role})` : null;
  };

  return (
    <div className="w-full mx-auto p-2">
      <div>
        <h1 className="text-2xl font-bold text-center mb-6">
          সকল এডমিন ও দায়ী দেখুন
        </h1>

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
            <option value="unionadmin">Union Admin</option>
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

          <TablePdfExporter
            tableData={{
              headers: [
                "Name",
                "Email",
                "Role",
                "Division",
                "District",
                "Upazila",
                "Union",
                "Phone",
                "Markaz",
                "Admin Assigned",
                "Status",
              ],
              rows: filteredUsers.map((user) => ({
                Name: user.name,
                Email: user.email,
                Role: user.role,
                Division: user.division,
                District: user.district,
                Upazila: user.upazila,
                Union: user.union,
                Phone: user.phone,
                Markaz: user.markaz,
                "Admin Assigned": getParentEmail(user, users) || "N/A",
                Status: user.banned ? "Banned" : "Active",
              })),
              title: "User Report",
              description: `Generated on ${new Date().toLocaleDateString()}`,
            }}
            fileName="users_report"
            buttonText=" Download PDF"
            buttonClassName="flex items-center gap-2 text-sm lg:text-lg px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition duration-300"
          />
        </div>

        <div className="w-full border border-gray-300 rounded-lg shadow-md overflow-y-auto max-h-[calc(100vh-254px)]">
          <Table className="w-full">
            <TableHeader className="sticky top-0 z-50 bg-[#155E75] shadow-md border-b-2">
              <TableRow className="text-white">
                <TableHead className="border-r text-center border-gray-300 text-white font-bold">
                  Name
                </TableHead>
                <TableHead className="border-r text-center border-gray-300 text-white font-bold">
                  Email
                </TableHead>
                <TableHead className="border-r text-center border-gray-300 text-white font-bold">
                  Role
                </TableHead>
                <TableHead className="border-r text-center border-gray-300 text-white font-bold">
                  Division
                </TableHead>
                <TableHead className="border-r text-center border-gray-300 text-white font-bold">
                  District
                </TableHead>
                <TableHead className="border-r text-center border-gray-300 text-white font-bold">
                  Upazila
                </TableHead>
                <TableHead className="border-r text-center border-gray-300 text-white font-bold">
                  Union
                </TableHead>
                <TableHead className="border-r text-center border-gray-300 text-white font-bold">
                  Phone
                </TableHead>
                <TableHead className="border-r text-center border-gray-300 text-white font-bold">
                  Markaz
                </TableHead>
                <TableHead className="border-r text-center border-gray-300 text-white font-bold">
                  Admin Assigned
                </TableHead>
                <TableHead className="border-r text-center border-gray-300 text-white font-bold">
                  Status
                </TableHead>
                <TableHead className="border-r text-center border-gray-300 text-white font-bold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="text-center">
                  <TableCell className="border-r font-semibold border-gray-300">
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
                  <TableCell>
                    <div className="flex space-x-2 justify-center items-center">
                      <Button
                        onClick={() => toggleBan(user.id, user.banned)}
                        className={user.banned ? "bg-red-500" : "bg-green-500"}
                      >
                        {user.banned ? "Unban" : "Ban"}
                      </Button>

                      <Button
                        className="border-r font-semibold  cursor-pointer hover:underline"
                        onClick={() => setSelectedUser(user)}
                      >
                        Edit
                      </Button>

                      <Button
                        onClick={() => handleDeleteClick(user.id)}
                        className="bg-red-800"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* First Confirmation Modal */}
        {showFirstModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center space-y-4">
              <h3 className="text-lg font-semibold">
                আপনি কি নিশ্চিত যে আপনি এই ব্যবহারকারীকে মুছে ফেলতে চান?
              </h3>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => {
                    setShowFirstModal(false);
                    setShowSecondModal(true);
                  }}
                  className="bg-red-600"
                >
                  হ্যাঁ
                </Button>
                <Button
                  onClick={() => {
                    setShowFirstModal(false);
                    setUserToDelete(null);
                  }}
                  className="bg-green-600"
                >
                  না
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Second Confirmation Modal */}
        {showSecondModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center space-y-4">
              <h3 className="text-lg font-semibold">
                আপনি যদি নিশ্চিত হন আপনি এই ব্যবহারকারীকে মুছে ফেলতে চান <br />
                <span className="text-red-600 font-bold">
                  প্রথমে developer এর সাথে যোগাযোগ করুন।
                </span>
              </h3>
              <div className="flex justify-center gap-4">
                <Button onClick={handleFinalDelete} className="bg-red-600">
                  মুছে ফেলুন
                </Button>
                <Button
                  onClick={() => {
                    setShowFirstModal(false);
                    setShowSecondModal(false);
                    setUserToDelete(null);
                  }}
                  className="bg-green-600"
                >
                  যোগাযোগ করুন
                </Button>
              </div>
            </div>
          </div>
        )}

        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white m-4 p-6 rounded-lg max-w-[80vh]">
              <h2 className="text-xl font-bold mb-4">
                Edit User: {selectedUser.name}
              </h2>

              <form id="edit-user-form" onSubmit={handleSubmit}>
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
                      <option value="divisionadmin">Division Admin</option>
                      <option value="districtadmin">District Admin</option>
                      <option value="markaz">
                        Markaz Admin (Not Avilable)
                      </option>
                      <option value="upozilaadmin">Upazila Admin</option>
                      <option value="unionadmin">Union Admin</option>
                      <option value="daye">Da'ee</option>
                    </select>
                  </div>

                  {/* Location Fields */}
                  {["division", "district", "upazila", "union"].map((field) => (
                    <div key={field}>
                      <label>
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <select
                        name={`${field}Id`}
                        value={
                          field === "division"
                            ? divisionId
                            : field === "district"
                              ? districtId
                              : field === "upazila"
                                ? upazilaId
                                : unionId
                        }
                        onChange={(e) =>
                          handleLocationChange(`${field}Id`, e.target.value)
                        }
                        disabled={
                          sessionUser?.role !== "centraladmin" ||
                          (field === "district" && !divisionId) ||
                          (field === "upazila" && !districtId) ||
                          (field === "union" && !upazilaId)
                        }
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">
                          Select{" "}
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </option>
                        {field === "division" &&
                          divisions.map((d) => (
                            <option key={d.value} value={d.value}>
                              {d.title}
                            </option>
                          ))}
                        {field === "district" &&
                          divisionId &&
                          districts[divisionId]?.map((d) => (
                            <option key={d.value} value={d.value}>
                              {d.title}
                            </option>
                          ))}
                        {field === "upazila" &&
                          districtId &&
                          upazilas[districtId]?.map((u) => (
                            <option key={u.value} value={u.value}>
                              {u.title}
                            </option>
                          ))}
                        {field === "union" &&
                          upazilaId &&
                          unions[upazilaId]?.map((u) => (
                            <option key={u.value} value={u.value}>
                              {u.title}
                            </option>
                          ))}
                      </select>
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

                  <div className="col-span-2">
                    <SelectField
                      label="Markaz"
                      name="markaz"
                      value={selectedUser.markaz}
                      onChange={(e) => {
                        setSelectedUser((prev) =>
                          prev ? { ...prev, markaz: e.target.value } : null
                        );
                      }}
                      options={markazList.map(({ name }) => ({
                        value: name,
                        title: name,
                      }))}
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
      <div className="mt-8">
        <h3 className="text-center text-2xl font-semibold">
          সর্ব মোটডাটা দেখুন
        </h3>
        <div className="border border-[#155E75] lg:p-6 mt-4 rounded-xl overflow-y-auto">
          <Tabs defaultValue="moktob" className="w-full p-4">
            <TabsList className="grid grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="moktob">মক্তব বিষয়</TabsTrigger>
              <TabsTrigger value="talim">মহিলাদের তালিম</TabsTrigger>
              <TabsTrigger value="daye">দায়ী বিষয়</TabsTrigger>
              <TabsTrigger value="dawati">দাওয়াতি বিষয়</TabsTrigger>
              <TabsTrigger value="dawatimojlish">দাওয়াতি মজলিশ</TabsTrigger>
              <TabsTrigger value="jamat">জামাত বিষয়</TabsTrigger>
              <TabsTrigger value="dinefera">দ্বীনে ফিরে এসেছে</TabsTrigger>
              <TabsTrigger value="sofor">সফর বিষয়</TabsTrigger>
            </TabsList>

            <TabsContent value="moktob">
              <AdminTable
                userData={userMoktobBisoyData}
                emailList={emailList}
              />
            </TabsContent>
            <TabsContent value="talim">
              <AdminTable userData={userTalimBisoyData} emailList={emailList} />
            </TabsContent>
            <TabsContent value="daye">
              <AdminTable userData={userDayeData} emailList={emailList} />
            </TabsContent>
            <TabsContent value="dawati">
              <AdminTable
                userData={userDawatiBisoyData}
                emailList={emailList}
              />
            </TabsContent>

            <TabsContent value="dawatimojlish">
              <AdminTable
                userData={userDawatiMojlishData}
                emailList={emailList}
              />
            </TabsContent>
            <TabsContent value="jamat">
              <AdminTable userData={userJamatBisoyData} emailList={emailList} />
            </TabsContent>
            <TabsContent value="dinefera">
              <AdminTable userData={userDineFeraData} emailList={emailList} />
            </TabsContent>
            <TabsContent value="sofor">
              <AdminTable
                userData={userSoforBishoyData}
                emailList={emailList}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {/* 4. Add the save confirmation modals before the closing div of the component */}
      {/* Add these right before the final closing div of the component */}
      {/* First Save Confirmation Modal */}
      {showSaveFirstModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center space-y-4">
            <h3 className="text-lg font-semibold">
              আপনি কি নিশ্চিত যে আপনি এই পরিবর্তনগুলি সংরক্ষণ করতে চান?
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => {
                  setShowSaveFirstModal(false);
                  setShowSaveSecondModal(true);
                }}
                className="bg-red-600"
              >
                হ্যাঁ
              </Button>
              <Button
                onClick={() => setShowSaveFirstModal(false)}
                className="bg-green-600"
              >
                না
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Second Save Confirmation Modal */}
      {showSaveSecondModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center space-y-4">
            <h3 className="text-lg font-semibold">
              আপনি যদি নিশ্চিত হন যে আপনি এই ব্যবহারকারীর তথ্য পরিবর্তন করতে চান
              তাহলে <br />
              <span className="text-red-600 font-bold">
                প্রথমে developer এর সাথে যোগাযোগ করুন।
              </span>
            </h3>
            <div className="flex justify-center gap-4">
              <Button onClick={handleFinalSubmit} className="bg-red-600">
                পরিবর্তন করুন
              </Button>
              <Button
                onClick={() => {
                  setShowSaveFirstModal(false);
                  setShowSaveSecondModal(false);
                }}
                className="bg-green-600"
              >
                যোগাযোগ করুন
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
