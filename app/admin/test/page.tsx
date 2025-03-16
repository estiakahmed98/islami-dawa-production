"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

import { userMoktobBisoyData } from "@/app/data/moktobBisoyUserData";
import { userDawatiBisoyData } from "@/app/data/dawatiBisoyUserData";
import { userDawatiMojlishData } from "@/app/data/dawatiMojlishUserData";
import { userJamatBisoyData } from "@/app/data/jamatBisoyUserData";
import { userDineFeraData } from "@/app/data/dineferaUserData";
import { userSoforBishoyData } from "@/app/data/soforBishoyUserData";
import { userDayeData } from "@/app/data/dayiUserData";
import { userTalimBisoyData } from "@/app/data/talimBisoyUserData";
import MobileDataChart from "@/components/MobileDataChart";

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

interface ChartData {
  labelMap: {
    [key: string]: string;
  };
  records: {
    [email: string]: {
      [date: string]: {
        [key: string]: string | number;
      };
    };
  };
}

const MobileDataChartPage: React.FC = () => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [filteredData, setFilteredData] = useState<{
    [key: string]: ChartData;
  }>({});

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
    const filterDataByUserAccess = (data: ChartData, userEmail: string) => {
      const currentUser = users.find((u) => u.email === userEmail);
      if (!currentUser) return data;

      const accessibleEmails = getAccessibleEmails(currentUser, users);

      const filteredRecords = Object.entries(data.records)
        .filter(([email]) => accessibleEmails.includes(email))
        .reduce(
          (acc, [email, records]) => ({
            ...acc,
            [email]: records,
          }),
          {}
        );

      return {
        ...data,
        records: filteredRecords,
      };
    };

    if (session?.user?.email && users.length > 0) {
      setFilteredData({
        moktob: filterDataByUserAccess(userMoktobBisoyData, session.user.email),
        dawati: filterDataByUserAccess(userDawatiBisoyData, session.user.email),
        dawatiMojlish: filterDataByUserAccess(
          userDawatiMojlishData,
          session.user.email
        ),
        jamat: filterDataByUserAccess(userJamatBisoyData, session.user.email),
        dineFera: filterDataByUserAccess(userDineFeraData, session.user.email),
        sofor: filterDataByUserAccess(userSoforBishoyDat, session.user.email),
        daye: filterDataByUserAccess(userDayeData, session.user.email),
        talim: filterDataByUserAccess(userTalimBisoyData, session.user.email),
      });
    }
  }, [users, session]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center text-gray-800">
        সামগ্রিক প্রতিবেদন (Mobile Data Chart)
      </h1>

      <div className="flex justify-center items-center space-x-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-emerald-300 focus:border-emerald-500 cursor-pointer"
        >
          {months.map((month, index) => (
            <option key={index} value={index}>
              {month}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-emerald-300 focus:border-emerald-500 cursor-pointer"
        >
          {Array.from({ length: 10 }, (_, i) => 2020 + i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <MobileDataChart
        moktobData={filteredData.moktob || userMoktobBisoyData}
        dawatiData={filteredData.dawati || userDawatiBisoyData}
        dawatiMojlishData={filteredData.dawatiMojlish || userDawatiMojlishData}
        jamatData={filteredData.jamat || userJamatBisoyData}
        dineFeraData={filteredData.dineFera || userDineFeraData}
        soforData={filteredData.sofor || userSoforBishoyData}
        dayeData={filteredData.daye || userDayeData}
        talimData={filteredData.talim || userTalimBisoyData}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        users={users}
      />
    </div>
  );
};
export default MobileDataChartPage;

// Helper function to get accessible emails based on user role and hierarchy
const getAccessibleEmails = (currentUser: User, users: User[]): string[] => {
  const accessibleEmails = [currentUser.email];

  const addSubordinateEmails = (user: User) => {
    users.forEach((u) => {
      if (
        user.role === "centraladmin" ||
        (user.role === "divisionadmin" && u.division === user.division) ||
        (user.role === "districtadmin" && u.district === user.district) ||
        (user.role === "upozilaadmin" && u.upazila === user.upazila) ||
        (user.role === "unionadmin" && u.union === user.union)
      ) {
        if (!accessibleEmails.includes(u.email)) {
          accessibleEmails.push(u.email);
          addSubordinateEmails(u);
        }
      }
    });
  };

  addSubordinateEmails(currentUser);
  return accessibleEmails;
};
