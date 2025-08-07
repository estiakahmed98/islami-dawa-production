"use client";

import TalimForm from "@/components/TalimForm";
import React, { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabButton";
import AmoliTableShow from "@/components/TableShow";
import { useSession } from "@/lib/auth-client"; // BetterAuth client hook

const TalimPage: React.FC = () => {
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const email = session?.user?.email || "";
  console.log("Session email:", email);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!email) return;

      setLoading(true); // Just in case re-fetching

      try {
        const res = await fetch(`/api/talim?email=${email}`);
        const json = await res.json();
        console.log("Fetched Talim Data:", json);

        setUserData(json?.data || []);
      } catch (error) {
        console.error("Failed to fetch talim data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch when session is loaded and email is available
    if (email) {
      fetchUserData();
    }
  }, [email]); // depend on email/status

  return (
    <div>
      <Tabs defaultValue="dataForm" className="w-full p-2 lg:p-4">
        <div className="flex justify-between">
          <TabsList>
            <TabsTrigger value="dataForm">তথ্য দিন</TabsTrigger>
            <TabsTrigger value="report">প্রতিবেদন</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dataForm">
          <div className="bg-gray-50 lg:rounded lg:shadow">
            <TalimForm />
          </div>
        </TabsContent>

        <TabsContent value="report">
          <div className="bg-gray-50 rounded shadow p-2">
            {loading ? (
              <p>লোড হচ্ছে...</p>
            ) : (
              <>
                {userData ? (
                  <AmoliTableShow userData={userData} />
                ) : (
                  <p>কোনো তথ্য পাওয়া যায়নি।</p>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TalimPage;
