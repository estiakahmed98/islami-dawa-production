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
import { useLocale, useTranslations } from "next-intl";
import { PiMosqueDuotone } from "react-icons/pi";
import { TbReport } from "react-icons/tb";

const ImpersonateSidebar: React.FC = () => {
  const t = useTranslations("dashboard.sideBar");
  const t2 = useTranslations("header");
  const locale = useLocale();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  const { data: session } = useSession();
  const userRole = session?.user?.role || "user";

  const [pendingLeaveCount, setPendingLeaveCount] = useState<number>(0);

  // ✨ NEW: pending edit requests count
  const [pendingEditCount, setPendingEditCount] = useState<number>(0); // <-- ADD

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch pending leave requests count
  const fetchPendingLeaveCount = async () => {
    try {
      const res = await fetch("/api/leaves?status=pending");
      if (!res.ok) throw new Error("bad status");
      const data = await res.json();
      setPendingLeaveCount(Array.isArray(data?.leaveRequests) ? data.leaveRequests.length : 0);
    } catch {
      setPendingLeaveCount(0);
    }
  };

  // ✨ NEW: Fetch pending edit requests count directly from localStorage (client-side source of truth)
  const fetchPendingEditCount = async () => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("editRequests") : null;
      const list = raw ? JSON.parse(raw) : [];
      const pending = Array.isArray(list)
        ? list.filter((r: any) => (r?.status || "").toLowerCase() === "pending").length
        : 0;
      setPendingEditCount(pending);
    } catch {
      setPendingEditCount(0);
    }
  };

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

  // Poll both counts every 30s if admin
  useEffect(() => {
    if (!isAdminForNotification) return;

    // initial
    fetchPendingLeaveCount();
    fetchPendingEditCount(); // <-- ADD

    const interval = setInterval(() => {
      fetchPendingLeaveCount();
      fetchPendingEditCount(); // <-- ADD
    }, 30000);

    return () => clearInterval(interval);
  }, [isAdminForNotification]);

  const isActive = (basePath: string): boolean => pathname === `/${locale}${basePath}`;
  const toggleCollapse = () => setIsCollapsed((s) => !s);

  const allMenuItems = [
    {
      href: "/admin",
      icon: <LuLayoutDashboard className="size-6" />,
      label: `${t("dashBoard")} (${t2(`roles.${userRole}`)})`,
      roles: ["centraladmin", "divisionadmin", "markazadmin"],
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
      roles: ["centraladmin", "divisionadmin", "markazadmin"],
    },
    {
      href: "/admin/dayereview",
      icon: <TbReport className="size-6" />,
      label: t("dayeReview"),
      roles: ["centraladmin", "divisionadmin", "markazadmin"],
    },
    {
      href: "/admin/leave",
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
      roles: ["centraladmin", "divisionadmin", "markazadmin"],
    },
    {
      href: "/admin/edit-request",
      icon: <FiEdit3 className="size-5" />,
      label: t("editRequest"),
      roles: ["centraladmin"],
      notificationCount: pendingEditCount,
      showNotification: true,
    },
    {
      href: "/admin/markaz",
      icon: <PiMosqueDuotone className="size-5" />,
      label: t("markaz"),
      roles: ["centraladmin"],
    }
  ];

  return (
    <div className="flex h-screen font-tiro">
      {!isMobile && (
        <div
          className={`fixed h-full overflow-y-auto bg-sky-900 transition-all duration-300 md:relative ${isCollapsed ? "w-[70px]" : "w-72"
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
              if (!roles.includes(userRole)) return null;

              const active = isActive(href);
              const localeHref = `/${locale}${href}`;

              return (
                <Link
                  href={localeHref}
                  key={href}
                  className={`flex items-center justify-between whitespace-nowrap px-2 py-2 font-medium ${active ? "rounded-md bg-cyan-600 text-white" : "text-white/80 hover:text-white"
                    }`}
                  aria-current={active ? "page" : undefined}
                >
                  <div className="flex items-center">
                    <div className={`text-xl ${isCollapsed ? "mx-auto" : "mr-3"}`}>{icon}</div>
                    {!isCollapsed && <li className="text-sm">{label}</li>}
                  </div>

                  {showNotification && !!notificationCount && notificationCount > 0 && (
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
