"use client";

import Header from "@/components/dashboard/header";
import ImpersonateSidebar from "@/components/ImpersonateSidebar";
import OnItemClick from "@/components/MuiTreeView";
import { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode; // The `children` prop is a React node to represent nested components
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  // Uncomment and use the following lines if you want to handle user-related data in the future
  // const [userName, setUserName] = useState<string | null>("");

  // useEffect(() => {
  //   const userEmail = localStorage.getItem("userEmail");
  //   setUserName(userEmail);
  // }, []);

  return (
    <div>
  
      <div className="flex h-[calc(100vh-104px)]">
 
        {/* Uncomment the line below if you want to pass the logged-in user to the `OnItemClick` component */}
        {/* {userName && <OnItemClick loggedInUser={userName} />} */}
        <div className="max-h-screen p-6 grow overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
