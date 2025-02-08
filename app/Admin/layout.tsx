import Header from "@/components/dashboard/header";
import ImpersonateSidebar from "@/components/ImpersonateSidebar";
import { SidebarProvider } from "@/providers/sidebar-provider";
// import TreeProvider from "@/providers/treeProvider";
import { roleList } from "@/lib/_role-list";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const AdmindLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!roleList.includes(session?.user?.role as string)) {
    redirect("/dashboard");
  }

  return (
    // <TreeProvider>
    <SidebarProvider>
      <div className="flex fixed size-full">
        <ImpersonateSidebar />
        <div className="w-full overflow-hidden">
          <Header />
          <main className="h-[calc(100vh-80px)] overflow-y-auto p-2 lg:p-6 ">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
    // </TreeProvider>
  );
};

export default AdmindLayout;
