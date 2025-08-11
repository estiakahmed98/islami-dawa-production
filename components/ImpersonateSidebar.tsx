// "use client"; //Juwel

// import React, { useState, useEffect } from "react";
// import Sidebar from "./dashboard/sidebar";
// import {
//   LuArrowLeftFromLine,
//   LuArrowRightToLine,
//   LuLayoutDashboard,
// } from "react-icons/lu";
// import { IoPersonAddSharp } from "react-icons/io5";
// import { MdPeople } from "react-icons/md";
// import { FcAcceptDatabase } from "react-icons/fc";
// import { FaTree } from "react-icons/fa";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import MuiTreeView from "./MuiTreeView";
// import { useSession } from "@/lib/auth-client";
// import { FiEdit3 } from "react-icons/fi";

// const ImpersonateSidebar: React.FC = () => {
//   const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
//   const [isMobile, setIsMobile] = useState<boolean>(false);
//   const router = useRouter();
//   const pathname = usePathname();

//   // Fetch user role from session
//   const { data: session } = useSession();
//   const userRole = session?.user?.role || "user"; // Default to "user" if undefined

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 1024);
//     };
//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const isActive = (path: string): boolean => pathname === path;

//   const toggleCollapse = (): void => {
//     setIsCollapsed(!isCollapsed);
//   };

//   const allMenuItems = [
//     {
//       href: "/admin",
//       icon: <LuLayoutDashboard className="size-6" />,
//       label: `ড্যাশবোর্ড (${session?.user?.role || "No Role"})`,
//       roles: [
//         "centraladmin",
//         "divisionadmin",
//         "districtadmin",
//         "areaadmin",
//         "upozilaadmin",
//         "user",
//       ],
//     },
//     {
//       href: "/admin/users",
//       icon: <MdPeople className="size-6" />,
//       label: "দায়ী দেখুন",
//       roles: ["centraladmin"],
//     },
//     {
//       href: "/admin/notification",
//       icon: <FcAcceptDatabase className="size-6" />,
//       label: "ছুটির বিষয়",
//       roles: ["centraladmin"],
//     },
//     {
//       href: "/admin/RealTree",
//       icon: <FaTree className="size-6" />,
//       label: "Real Tree",
//       roles: [
//         "centraladmin",
//         "divisionadmin",
//         "districtadmin",
//         "areaadmin",
//         "upozilaadmin",
//       ],
//     },
//     {
//       href: "/admin/edit-request",
//       icon: <FiEdit3 className="size-5" />,
//       label: "এডিট রিকোয়েস্ট",
//       roles: ["centraladmin"],
//     },
//   ];

//   return (
//     <div className="flex h-screen font-tiro">
//       {!isMobile && (
//         <div
//           className={`transition-all duration-300 fixed md:relative h-full bg-sky-900 overflow-y-auto ${
//             isCollapsed ? "w-[70px]" : "w-72"
//           }`}
//         >
//           <div className="py-4 px-4 flex justify-between items-center">
//             <button
//               onClick={toggleCollapse}
//               className="p-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 focus:outline-none"
//             >
//               {isCollapsed ? (
//                 <LuArrowRightToLine className="size-6" />
//               ) : (
//                 <LuArrowLeftFromLine className="size-6" />
//               )}
//             </button>
//           </div>

//           <ul className="space-y-2 px-4">
//             {allMenuItems.map(({ href, icon, label }) => (
//               <Link
//                 href={href}
//                 key={href}
//                 className={`flex py-2 px-2 items-center font-medium whitespace-nowrap ${
//                   isActive(href)
//                     ? "bg-cyan-600 rounded-md text-white"
//                     : "hover:text-white text-white/80"
//                 }`}
//                 aria-current={isActive(href) ? "page" : undefined}
//               >
//                 <div className={`text-xl ${isCollapsed ? "mx-auto" : "mr-3"}`}>
//                   {icon}
//                 </div>
//                 {!isCollapsed && <li className="text-sm">{label}</li>}
//               </Link>
//             ))}

//             {/* Show "দায়ী এড করা" only for centraladmin */}
//             {userRole === "centraladmin" && (
//               <Link
//                 href="/admin/register"
//                 className="flex py-2 px-2 items-center font-medium whitespace-nowrap hover:text-white text-white/80"
//               >
//                 <div className={`text-xl ${isCollapsed ? "mx-auto" : "mr-3"}`}>
//                   <IoPersonAddSharp className="size-6" />
//                 </div>
//                 {!isCollapsed && <li className="text-sm">দায়ী এড করা</li>}
//               </Link>
//             )}
//           </ul>

//           {!isCollapsed && (
//             <div className="mt-4 px-4">
//               <MuiTreeView />
//             </div>
//           )}
//         </div>
//       )}

//       <div className="flex-1">
//         <Sidebar />
//       </div>
//     </div>
//   );
// };

// export default ImpersonateSidebar;









"use client" //Juwel

import type React from "react"
import { useState, useEffect } from "react"
import Sidebar from "./dashboard/sidebar"
import { IoPersonAddSharp } from "react-icons/io5"
import { MdPeople } from "react-icons/md"
import { FcAcceptDatabase } from "react-icons/fc"
import { FaTree } from "react-icons/fa"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import MuiTreeView from "./MuiTreeView"
import { useSession } from "@/lib/auth-client"
import { FiEdit3 } from "react-icons/fi"
import { LuArrowLeftFromLine, LuArrowRightToLine, LuLayoutDashboard } from "react-icons/lu"
import { Bell } from "lucide-react"

const ImpersonateSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const router = useRouter()
  const pathname = usePathname()

  // Fetch user role from session
  const { data: session } = useSession()
  const userRole = session?.user?.role || "user" // Default to "user" if undefined

  const [pendingLeaveCount, setPendingLeaveCount] = useState<number>(0) // New state for pending leave count

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Function to fetch pending leave requests count
  const fetchPendingLeaveCount = async () => {
    try {
      const response = await fetch("/api/leaves?status=pending")
      if (response.ok) {
        const data = await response.json()
        setPendingLeaveCount(data.leaveRequests.length)
      } else {
        console.error("Failed to fetch pending leave requests:", response.statusText)
        setPendingLeaveCount(0)
      }
    } catch (error) {
      console.error("Error fetching pending leave requests:", error)
      setPendingLeaveCount(0)
    }
  }

  // Define admin roles for fetching notifications
  const adminRolesForNotification = [
    "centraladmin",
    "superadmin",
    "divisionadmin",
    "districtadmin",
    "areaadmin",
    "upozilaadmin",
    "unionadmin",
  ]
  const isAdminForNotification = adminRolesForNotification.includes(userRole as string)

  // Fetch pending leave count on mount and every 30 seconds if admin
  useEffect(() => {
    if (isAdminForNotification) {
      fetchPendingLeaveCount() // Initial fetch
      const interval = setInterval(fetchPendingLeaveCount, 30000) // Poll every 30 seconds
      return () => clearInterval(interval) // Cleanup on unmount
    }
  }, [isAdminForNotification])

  const isActive = (path: string): boolean => pathname === path

  const toggleCollapse = (): void => {
    setIsCollapsed(!isCollapsed)
  }

  const allMenuItems = [
    {
      href: "/admin",
      icon: <LuLayoutDashboard className="size-6" />,
      label: `ড্যাশবোর্ড (${session?.user?.role || "No Role"})`,
      roles: ["centraladmin", "divisionadmin", "districtadmin", "areaadmin", "upozilaadmin", "user"],
    },
    {
      href: "/admin/register", // Moved from separate rendering
      icon: <IoPersonAddSharp className="size-6" />,
      label: "দায়ী এড করা",
      roles: ["centraladmin"],
    },
    {
      href: "/admin/users",
      icon: <MdPeople className="size-6" />,
      label: "দায়ী দেখুন",
      roles: ["centraladmin"],
    },
    {
      href: "/admin/notification",
      icon: <FcAcceptDatabase className="size-6" />,
      label: "ছুটির বিষয়",
      roles: ["centraladmin"],
      notificationCount: pendingLeaveCount, // Pass the count here
      showNotification: true, // Enable notification for this item
    },
    {
      href: "/admin/RealTree",
      icon: <FaTree className="size-6" />,
      label: "Real Tree",
      roles: ["centraladmin", "divisionadmin", "districtadmin", "areaadmin", "upozilaadmin"],
    },
    {
      href: "/admin/edit-request",
      icon: <FiEdit3 className="size-5" />,
      label: "এডিট রিকোয়েস্ট",
      roles: ["centraladmin"],
    },
  ]

  return (
    <div className="flex h-screen font-tiro">
      {!isMobile && (
        <div
          className={`fixed h-full overflow-y-auto bg-sky-900 transition-all duration-300 md:relative ${
            isCollapsed ? "w-[70px]" : "w-72"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={toggleCollapse}
              className="rounded-md bg-cyan-600 p-2 text-white hover:bg-cyan-500 focus:outline-none"
            >
              {isCollapsed ? <LuArrowRightToLine className="size-6" /> : <LuArrowLeftFromLine className="size-6" />}
            </button>
          </div>

          <ul className="space-y-2 px-4">
            {allMenuItems.map(({ href, icon, label, roles, notificationCount, showNotification }) => {
              // Only render if the user's role is allowed for this menu item
              if (!roles.includes(userRole)) {
                return null
              }

              const active = isActive(href)
              return (
                <Link
                  href={href}
                  key={href}
                  className={`flex items-center justify-between whitespace-nowrap px-2 py-2 font-medium ${
                    active ? "rounded-md bg-cyan-600 text-white" : "text-white/80 hover:text-white"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <div className="flex items-center">
                    <div className={`text-xl ${isCollapsed ? "mx-auto" : "mr-3"}`}>{icon}</div>
                    {!isCollapsed && <li className="text-sm">{label}</li>}
                  </div>
                  {showNotification && notificationCount !== undefined && notificationCount > 0 && (
                    <div className="relative">
                      <Bell className="size-5 text-yellow-400" />
                      <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {notificationCount > 99 ? "99+" : notificationCount}
                      </span>
                    </div>
                  )}
                </Link>
              )
            })}
          </ul>

          {!isCollapsed && (
            <div className="mt-4 px-4">
              <MuiTreeView />
            </div>
          )}
        </div>
      )}

      <div className="flex-1">
        <Sidebar />
      </div>
    </div>
  )
}

export default ImpersonateSidebar
