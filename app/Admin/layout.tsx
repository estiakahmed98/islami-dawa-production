

import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import ImpersonateSidebar from "@/components/ImpersonateSidebar";
import { SidebarProvider } from "@/providers/sidebar-provider";
import TreeProvider from "@/providers/treeProvider";

const AdmindLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <TreeProvider>
        <div className="flex fixed size-full">
          <ImpersonateSidebar />
          <div className="w-full overflow-hidden">
            <Header />
            <main className="h-[calc(100vh-80px)] overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </TreeProvider>
    </SidebarProvider>
  );
};

export default AdmindLayout;
