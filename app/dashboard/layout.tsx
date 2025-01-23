import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { SidebarProvider } from "@/providers/sidebar-provider";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex fixed size-full">
        <Sidebar />
        <div className="w-full overflow-hidden">
          <Header />
          <main className="h-[calc(100vh-80px)] overflow-y-auto p-2 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
