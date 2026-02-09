"use client";

import UsersTable from "./UsersTable";
import { SWRConfig } from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

const UserPage = () => {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 300000, // 5 minutes
      }}
    >
      <div className="h-screen">
        <UsersTable />
      </div>
    </SWRConfig>
  );
};

export default UserPage;
