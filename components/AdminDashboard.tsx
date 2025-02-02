"use client";

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
  const { selectedUser } = useSelectedUser();
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";
  const [emailList, setEmailList] = useState<string[]>([userEmail]);
  const [users, setUsers] = useState<User[]>([]);

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

    if (selectedUser) {
      const selectedUserObj = users.find((u) => u.email === selectedUser);

      if (selectedUserObj) {
        let collectedEmails: string[] = [selectedUserObj.email];

        // Function to collect all child emails recursively
        const findChildEmails = (parentEmail: string) => {
          users.forEach((user) => {
            if (getParentEmail(user, users) === parentEmail) {
              collectedEmails.push(user.email);
              findChildEmails(user.email);
            }
          });
        };

        findChildEmails(selectedUserObj.email);

        // Collect "daye" emails based on the role
        if (selectedUserObj.role === "unionadmin") {
          const dayeEmails = users
            .filter(
              (user) =>
                user.role === "daye" && user.union === selectedUserObj.union
            )
            .map((user) => user.email);
          collectedEmails = [...new Set([...collectedEmails, ...dayeEmails])];
        } else if (selectedUserObj.role === "upozilaadmin") {
          const dayeEmails = users
            .filter(
              (user) =>
                user.role === "daye" && user.upazila === selectedUserObj.upazila
            )
            .map((user) => user.email);
          collectedEmails = [...new Set([...collectedEmails, ...dayeEmails])];
        } else if (selectedUserObj.role === "districtadmin") {
          const dayeEmails = users
            .filter(
              (user) =>
                user.role === "daye" &&
                user.district === selectedUserObj.district
            )
            .map((user) => user.email);
          collectedEmails = [...new Set([...collectedEmails, ...dayeEmails])];
        } else if (selectedUserObj.role === "divisionadmin") {
          const dayeEmails = users
            .filter(
              (user) =>
                user.role === "daye" &&
                user.division === selectedUserObj.division
            )
            .map((user) => user.email);
          collectedEmails = [...new Set([...collectedEmails, ...dayeEmails])];
        }

        setEmailList(collectedEmails);
      } else {
        setEmailList([selectedUser]);
      }
    } else {
      setEmailList([userEmail]); // Default to logged-in user
    }
  }, [selectedUser, users, userEmail]);

  console.log("Email List:", emailList);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">
          Welcome,{" "}
          <span className="text-2xl text-emerald-600">
            {session?.user?.name}
          </span>
        </h1>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grow grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-8 pb-4 pt-2">
          <AmoliChartAdmin data={userAmoliData.records} emailList={emailList} />
          <TallyAdmin
            userData={userMoktobBisoyData}
            emails={emailList}
            title="Moktob Bisoy Tally"
          />
          <TallyAdmin
            userData={userDawatiBisoyData}
            emails={emailList}
            title="Dawati Bisoy Tally"
          />
          <TallyAdmin
            userData={userDawatiMojlishData}
            emails={emailList}
            title="Dawati Mojlish Tally"
          />
          <TallyAdmin
            userData={userJamatBisoyData}
            emails={emailList}
            title="Jamat Bisoy Tally"
          />
          <TallyAdmin
            userData={userDineFeraData}
            emails={emailList}
            title="Dine Fireche Tally"
          />
          <TallyAdmin
            userData={userTalimBisoyData}
            emails={emailList}
            title="Talim Bisoy Tally"
          />
          <TallyAdmin
            userData={userSoforBishoyData}
            emails={emailList}
            title="Sofor Bisoy Tally"
          />
          <TallyAdmin
            userData={userDayeData}
            emails={emailList}
            title="Dayee Bisoy Tally"
          />
        </div>
      </div>

      <div className="border border-[#155E75] p-6 mt-10 rounded-xl overflow-y-auto">
        <Tabs defaultValue="moktob" className="w-full p-4">
          <TabsList className="mx-10 my-6">
            <TabsTrigger value="moktob">Moktob Bisoy</TabsTrigger>
            <TabsTrigger value="talim">Talim Bisoy</TabsTrigger>
            <TabsTrigger value="daye">Daye Bisoy</TabsTrigger>
            <TabsTrigger value="dawati">Dawati Bisoy</TabsTrigger>
            <TabsTrigger value="dawatimojlish">Dawati Mojlish</TabsTrigger>
            <TabsTrigger value="jamat">Jamat Bisoy</TabsTrigger>
            <TabsTrigger value="dinefera">Dine Fire Asa</TabsTrigger>
            <TabsTrigger value="sofor">Sofor Bisoy</TabsTrigger>
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
            <AdminTable userData={userDawatiMojlishData} emailList={emailList} />
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

// Function to get the parent email
const getParentEmail = (user: User, users: User[]): string | null => {
  switch (user.role) {
    case "divisionadmin":
      return users.find((u) => u.role === "centraladmin")?.email || null;
    case "districtadmin":
      return (
        users.find(
          (u) => u.role === "divisionadmin" && u.division === user.division
        )?.email || null
      );
    case "upozilaadmin":
      return (
        users.find(
          (u) => u.role === "districtadmin" && u.district === user.district
        )?.email || null
      );
    case "unionadmin":
      return (
        users.find(
          (u) => u.role === "upozilaadmin" && u.upazila === user.upazila
        )?.email || null
      );
    case "daye":
      return (
        users.find((u) => u.role === "unionadmin" && u.union === user.union)
          ?.email || null
      );
    default:
      return null;
  }
};

export default AdminDashboard;
