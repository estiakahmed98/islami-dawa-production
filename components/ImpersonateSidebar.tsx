"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Sidebar from "./dashboard/sidebar";
import { IoPersonAddSharp } from "react-icons/io5";
import { MdPeople } from "react-icons/md";
import { FcAcceptDatabase } from "react-icons/fc";
import { FaTree } from "react-icons/fa";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import MuiTreeView from "./MuiTreeView";
import { useSession } from "@/lib/auth-client";
import { FiEdit3 } from "react-icons/fi";
import { LuArrowLeftFromLine, LuArrowRightToLine, LuLayoutDashboard } from "react-icons/lu";
import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";

const ImpersonateSidebar: React.FC = () => {
  const t = useTranslations("dashboard.sideBar");
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  // Fetch user role from session
  const { data: session } = useSession();
  const userRole = session?.user?.role || "user"; // Default to "user" if undefined

  const [pendingLeaveCount, setPendingLeaveCount] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Function to fetch pending leave requests count
  const fetchPendingLeaveCount = async () => {
    try {
      const response = await fetch("/api/leaves?status=pending");
      if (response.ok) {
        const data = await response.json();
        setPendingLeaveCount(data.leaveRequests.length);
      } else {
        console.error("Failed to fetch pending leave requests:", response.statusText);
        setPendingLeaveCount(0);
      }
    } catch (error) {
      console.error("Error fetching pending leave requests:", error);
      setPendingLeaveCount(0);
    }
  };

  // Define admin roles for fetching notifications
  const adminRolesForNotification = [
    "centraladmin",
    "superadmin",
    "divisionadmin",
    "districtadmin",
    "areaadmin",
    "upozilaadmin",
    "unionadmin",
  ];
  const isAdminForNotification = adminRolesForNotification.includes(userRole as string);

  // Fetch pending leave count on mount and every 30 seconds if admin
  useEffect(() => {
    if (isAdminForNotification) {
      fetchPendingLeaveCount(); // Initial fetch
      const interval = setInterval(fetchPendingLeaveCount, 30000); // Poll every 30 seconds
      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [isAdminForNotification]);

  const isActive = (path: string): boolean => pathname === path;

  const toggleCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  const allMenuItems = [
    {
      href: "/admin",
      icon: <LuLayoutDashboard className="size-6" />,
      label: `${t("dashBoard")} (${session?.user?.role || t("noRole")})`,
      roles: ["centraladmin", "divisionadmin", "districtadmin", "areaadmin", "upozilaadmin", "user"],
    },
    {
      href: "/admin/register",
      icon: <IoPersonAddSharp className="size-6" />,
      label: t("addDayi"),
      roles: ["centraladmin"],
    },
    {
      href: "/admin/users",
      icon: <MdPeople className="size-6" />,
      label: t("viewDayi"),
      roles: ["centraladmin"],
    },
    {
      href: "/admin/notification",
      icon: <FcAcceptDatabase className="size-6" />,
      label: t("leaveMatters"),
      roles: ["centraladmin"],
      notificationCount: pendingLeaveCount,
      showNotification: true,
    },
    {
      href: "/admin/RealTree",
      icon: <FaTree className="size-6" />,
      label: t("realTree"),
      roles: ["centraladmin", "divisionadmin", "districtadmin", "areaadmin", "upozilaadmin"],
    },
    {
      href: "/admin/edit-request",
      icon: <FiEdit3 className="size-5" />,
      label: t("editRequest"),
      roles: ["centraladmin"],
    },
  ];

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
              if (!roles.includes(userRole)) {
                return null;
              }

              const active = isActive(href);
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
              );
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
  );
};

export default ImpersonateSidebar;