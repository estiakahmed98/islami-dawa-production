"use client";

import React, { ReactNode } from "react";
import Header from "@/components/dashboard/header";
import ImpersonateSidebar from "@/components/ImpersonateSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div>
      <Header />
      <div className="flex h-[calc(100vh-104px)]">
        <ImpersonateSidebar />
        <div className="max-h-screen p-6 grow overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
