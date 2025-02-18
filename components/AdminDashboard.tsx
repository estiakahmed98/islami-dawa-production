"use client"; //Juwel

import React, { useEffect, useState } from "react";
import { useSelectedUser } from "@/providers/treeProvider";
import { useSession } from "@/lib/auth-client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabButton";
import TallyAdmin from "@/components/TallyAdmin";
import AmoliChartAdmin from "@/components/AmoliChartAdmin";
import AdminTable from "@/components/AdminTable";

import { userMoktobBisoyData } from "@/app/data/moktobBisoyUserData";
import { userDawatiBisoyData } from "@/app/data/dawatiBisoyUserData";
import { userDawatiMojlishData } from "@/app/data/dawatiMojlishUserData";
import { userJamatBisoyData } from "@/app/data/jamatBisoyUserData";
import { userDineFeraData } from "@/app/data/dineferaUserData";
import { userSoforBishoyData } from "@/app/data/soforBishoyUserData";
import { userDayeData } from "@/app/data/dayiUserData";
import { userTalimBisoyData } from "@/app/data/talimBisoyUserData";
import { userAmoliData } from "@/app/data/amoliMuhasabaUserData";

import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  division?: string;
  district?: string;
  upazila?: string;
  union?: string;
}

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const { selectedUser } = useSelectedUser();
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";
  const [emailList, setEmailList] = useState<string[]>([userEmail]);
  const [users, setUsers] = useState<User[]>([]);

  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [searchMonth, setSearchMonth] = useState<string>(""); // Stores the search input

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const filterChartAndTallyData = (userData: any) => {
    if (!userData || !userData.records) return userData;

    const filteredRecords = Object.keys(userData.records).reduce<
      Record<string, any>
    >((filtered, email) => {
      const emailData = userData.records[email];

      // Filter records by selected month and year
      const filteredDates = Object.keys(emailData).reduce<Record<string, any>>(
        (acc, date) => {
          const [year, month] = date.split("-").map(Number);
          if (year === selectedYear && month === selectedMonth + 1) {
            acc[date] = emailData[date];
          }
          return acc;
        },
        {}
      );

      if (Object.keys(filteredDates).length > 0) {
        filtered[email] = filteredDates;
      }

      return filtered;
    }, {});

    return { ...userData, records: filteredRecords };
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch users");

        const usersData: User[] = await response.json();
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!users.length) return;

    const loggedInUser = users.find((u) => u.email === userEmail);
    if (!loggedInUser) return;

    let collectedEmails: string[] = [loggedInUser.email];

    // Function to collect all child emails recursively
    const findChildEmails = (parentEmail: string) => {
      users.forEach((user) => {
        if (getParentEmail(user, users) === parentEmail) {
          collectedEmails.push(user.email);
          findChildEmails(user.email);
        }
      });
    };

    findChildEmails(loggedInUser.email);

    // Collect "daye" emails based on the logged-in user's role
    if (loggedInUser.role === "unionadmin") {
      const dayeEmails = users
        .filter(
          (user) => user.role === "daye" && user.union === loggedInUser.union
        )
        .map((user) => user.email);
      collectedEmails = [...new Set([...collectedEmails, ...dayeEmails])];
    } else if (loggedInUser.role === "upozilaadmin") {
      const dayeEmails = users
        .filter(
          (user) =>
            user.role === "daye" && user.upazila === loggedInUser.upazila
        )
        .map((user) => user.email);
      collectedEmails = [...new Set([...collectedEmails, ...dayeEmails])];
    } else if (loggedInUser.role === "districtadmin") {
      const dayeEmails = users
        .filter(
          (user) =>
            user.role === "daye" && user.district === loggedInUser.district
        )
        .map((user) => user.email);
      collectedEmails = [...new Set([...collectedEmails, ...dayeEmails])];
    } else if (loggedInUser.role === "divisionadmin") {
      const dayeEmails = users
        .filter(
          (user) =>
            user.role === "daye" && user.division === loggedInUser.division
        )
        .map((user) => user.email);
      collectedEmails = [...new Set([...collectedEmails, ...dayeEmails])];
    } else if (loggedInUser.role === "centraladmin") {
      const dayeEmails = users
        .filter((user) => user.role === "daye")
        .map((user) => user.email);
      collectedEmails = [...new Set([...collectedEmails, ...dayeEmails])];
    }

    if (selectedUser) {
      const selectedUserObj = users.find((u) => u.email === selectedUser);

      if (selectedUserObj) {
        let selectedEmails: string[] = [selectedUserObj.email];

        // Function to collect all child emails recursively
        const findSelectedChildEmails = (parentEmail: string) => {
          users.forEach((user) => {
            if (getParentEmail(user, users) === parentEmail) {
              selectedEmails.push(user.email);
              findSelectedChildEmails(user.email);
            }
          });
        };

        findSelectedChildEmails(selectedUserObj.email);

        // Collect "daye" emails based on the selected user's role
        if (selectedUserObj.role === "unionadmin") {
          const dayeEmails = users
            .filter(
              (user) =>
                user.role === "daye" && user.union === selectedUserObj.union
            )
            .map((user) => user.email);
          selectedEmails = [...new Set([...selectedEmails, ...dayeEmails])];
        } else if (selectedUserObj.role === "upozilaadmin") {
          const dayeEmails = users
            .filter(
              (user) =>
                user.role === "daye" && user.upazila === selectedUserObj.upazila
            )
            .map((user) => user.email);
          selectedEmails = [...new Set([...selectedEmails, ...dayeEmails])];
        } else if (selectedUserObj.role === "districtadmin") {
          const dayeEmails = users
            .filter(
              (user) =>
                user.role === "daye" &&
                user.district === selectedUserObj.district
            )
            .map((user) => user.email);
          selectedEmails = [...new Set([...selectedEmails, ...dayeEmails])];
        } else if (selectedUserObj.role === "divisionadmin") {
          const dayeEmails = users
            .filter(
              (user) =>
                user.role === "daye" &&
                user.division === selectedUserObj.division
            )
            .map((user) => user.email);
          selectedEmails = [...new Set([...selectedEmails, ...dayeEmails])];
        } else if (selectedUserObj.role === "centraladmin") {
          const dayeEmails = users
            .filter((user) => user.role === "daye")
            .map((user) => user.email);
          selectedEmails = [...new Set([...selectedEmails, ...dayeEmails])];
        }

        setEmailList(selectedEmails);
      } else {
        setEmailList([selectedUser]);
      }
    } else {
      // Default to all users under the logged-in user
      setEmailList(collectedEmails);
    }
  }, [selectedUser, users, userEmail]);

  console.log("Email List:", emailList);

  const filteredAmoliData = filterChartAndTallyData(userAmoliData);
  console.log("Filtered Amoli Data:", filteredAmoliData);

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row justify-between items-center bg-white shadow-md p-6 rounded-xl space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Welcome Message */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center lg:text-left">
          স্বাগতম,{" "}
          <span className="text-emerald-600">{session?.user?.name}</span>
        </h1>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {/* Comparison Button */}
          <button
            onClick={() => router.push("admin/comparison")}
            className="bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-emerald-700 transition-all duration-300 focus:ring focus:ring-emerald-300 w-full sm:w-auto"
          >
            📊 তুলনা দেখুন
          </button>

          {/* Month Selection Dropdown */}
          <div className="flex gap-3 items-center w-full md:w-auto">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full lg:w-40 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-emerald-300 focus:border-emerald-500 cursor-pointer"
            >
              {months
                .filter((month) =>
                  month.toLowerCase().includes(searchMonth.toLowerCase())
                )
                .map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
            </select>

            {/* Year Selection Dropdown */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full lg:w-24 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-emerald-300 focus:border-emerald-500 cursor-pointer"
            >
              {Array.from({ length: 10 }, (_, i) => 2020 + i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grow grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-8 pb-4 pt-2">
          {/* Pass Filtered Data to Charts & Tally */}
          <AmoliChartAdmin
            data={filteredAmoliData.records}
            emailList={emailList}
          />
          <TallyAdmin
            userData={filterChartAndTallyData(userMoktobBisoyData)}
            emails={emailList}
            title="মক্তব বিষয়"
          />
          <TallyAdmin
            userData={filterChartAndTallyData(userDawatiBisoyData)}
            emails={emailList}
            title="দাওয়াতি বিষয়"
          />
          <TallyAdmin
            userData={filterChartAndTallyData(userDawatiMojlishData)}
            emails={emailList}
            title="দাওয়াতি মজলিশ"
          />
          <TallyAdmin
            userData={filterChartAndTallyData(userJamatBisoyData)}
            emails={emailList}
            title="জামাত বিষয়"
          />
          <TallyAdmin
            userData={filterChartAndTallyData(userDineFeraData)}
            emails={emailList}
            title="দ্বীনে ফিরে এসেছে"
          />
          <TallyAdmin
            userData={filterChartAndTallyData(userTalimBisoyData)}
            emails={emailList}
            title="মহিলাদের তালিম বিষয়"
          />
          <TallyAdmin
            userData={filterChartAndTallyData(userSoforBishoyData)}
            emails={emailList}
            title="সফর বিষয়"
          />
          <TallyAdmin
            userData={filterChartAndTallyData(userDayeData)}
            emails={emailList}
            title="দায়ী বিষয়"
          />
        </div>
      </div>

      <div className="border border-[#155E75] lg:p-6 mt-10 rounded-xl overflow-y-auto">
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
            <AdminTable userData={userMoktobBisoyData} emailList={emailList} />
          </TabsContent>
          <TabsContent value="talim">
            <AdminTable userData={userTalimBisoyData} emailList={emailList} />
          </TabsContent>
          <TabsContent value="daye">
            <AdminTable userData={userDayeData} emailList={emailList} />
          </TabsContent>
          <TabsContent value="dawati">
            <AdminTable userData={userDawatiBisoyData} emailList={emailList} />
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
            <AdminTable userData={userSoforBishoyData} emailList={emailList} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

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
      if (!parentUser) {
        parentUser = users.find((u) => u.role === "centraladmin");
      }
      break;
    case "upozilaadmin":
      parentUser = users.find(
        (u) => u.role === "districtadmin" && u.district === user.district
      );
      // Step 4: If no districtadmin is found, find a divisiontadmin in the same division
      if (!parentUser) {
        parentUser = users.find(
          (u) => u.role === "divisionadmin" && u.division === user.division
        );
      }
      if (!parentUser) {
        parentUser = users.find((u) => u.role === "centraladmin");
      }
      break;
    case "unionadmin":
      parentUser = users.find(
        (u) => u.role === "upozilaadmin" && u.upazila === user.upazila
      );
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
      if (!parentUser) {
        parentUser = users.find((u) => u.role === "centraladmin");
      }
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
      if (!parentUser) {
        parentUser = users.find((u) => u.role === "centraladmin");
      }
      break;

    default:
      return null;
  }
  return parentUser ? parentUser.email : null;
};

export default AdminDashboard;
