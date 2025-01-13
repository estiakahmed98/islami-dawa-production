// "use client";

// import React, { ReactNode } from "react";
// import Header from "@/components/dashboard/header";
// import ImpersonateSidebar from "@/components/ImpersonateSidebar";

// interface AdminLayoutProps {
//   children: ReactNode;
// }

// const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
//   return (
//     <div>
//       <Header />
//       <div className="flex h-[calc(100vh-104px)]">
//         <ImpersonateSidebar />
//         <div className="max-h-screen p-6 grow overflow-y-auto">{children}</div>
//       </div>
//     </div>
//   );
// };

// export default AdminLayout;



import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import ImpersonateSidebar from "@/components/ImpersonateSidebar";
import { SidebarProvider } from "@/providers/sidebar-provider";
import TreeProvider from "@/providers/treeProvider";

const AdmindLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex fixed size-full">
        {/* <Sidebar /> */}
        {/* <ImpersonateSidebar/> */}
        <div className="w-full overflow-hidden">
          <Header />
          <main className="h-[calc(100vh-80px)] overflow-y-auto p-6">
            <TreeProvider>{children}</TreeProvider>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdmindLayout;
