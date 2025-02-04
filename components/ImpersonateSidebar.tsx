"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./dashboard/sidebar";
import {
  LuArrowLeftFromLine,
  LuArrowRightToLine,
  LuLayoutDashboard,
} from "react-icons/lu";
import { IoPersonAddSharp } from "react-icons/io5";
import { MdPeople } from "react-icons/md";
import { FcAcceptDatabase } from "react-icons/fc";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import MuiTreeView from "./MuiTreeView";
import { useSession } from "@/lib/auth-client";
// import dynamic from "next/dynamic";
// const MuiTreeView = dynamic(() => import("@/components/MuiTreeView"), {
//   ssr: false,
// });

const ImpersonateSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  // Fetch user role from session
  const { data: session } = useSession();
  const userRole = session?.user?.role || "user"; // Default to "user" if undefined

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActive = (path: string): boolean => pathname === path;

  const toggleCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  const allMenuItems = [
    {
      href: "/admin",
      icon: <LuLayoutDashboard className="size-6" />,
      label: `ড্যাশবোর্ড (${session?.user?.role || "No Role"})`,
      roles: [
        "centraladmin",
        "divisionadmin",
        "districtadmin",
        "areaadmin",
        "upozilaadmin",
        "user",
      ],
    },
    {
      href: "/admin/users",
      icon: <MdPeople className="size-6" />,
      label: "দায়ী দেখুন",
      roles: [
        "centraladmin",
        "divisionadmin",
        "districtadmin",
        "areaadmin",
        "upozilaadmin",
        "user",
      ],
    },
    {
      href: "/admin/notification",
      icon: <FcAcceptDatabase className="size-6" />,
      label: "অনুমতি দিন",
      roles: [
        "centraladmin",
        "divisionadmin",
        "districtadmin",
        "areaadmin",
        "upozilaadmin",
        "user",
      ],
    },
  ];

  return (
    <div className="flex h-screen">
      {!isMobile && (
        <div
          className={`transition-all duration-300 fixed md:relative h-full bg-sky-900 overflow-y-auto ${
            isCollapsed ? "w-[70px]" : "w-72"
          }`}
        >
          <div className="py-4 px-4 flex justify-between items-center">
            <button
              onClick={toggleCollapse}
              className="p-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 focus:outline-none"
            >
              {isCollapsed ? (
                <LuArrowRightToLine className="size-6" />
              ) : (
                <LuArrowLeftFromLine className="size-6" />
              )}
            </button>
          </div>

          <ul className="space-y-2 px-4">
            {allMenuItems.map(({ href, icon, label }) => (
              <Link
                href={href}
                key={href}
                className={`flex py-2 px-2 items-center font-medium whitespace-nowrap ${
                  isActive(href)
                    ? "bg-cyan-600 rounded-md text-white"
                    : "hover:text-white text-white/80"
                }`}
                aria-current={isActive(href) ? "page" : undefined}
              >
                <div className={`text-xl ${isCollapsed ? "mx-auto" : "mr-3"}`}>
                  {icon}
                </div>
                {!isCollapsed && <li className="text-sm">{label}</li>}
              </Link>
            ))}

            {/* Show "দায়ী এড করা" only for centraladmin */}
            {userRole === "centraladmin" && (
              <Link
                href="/admin/register"
                className="flex py-2 px-2 items-center font-medium whitespace-nowrap hover:text-white text-white/80"
              >
                <div className={`text-xl ${isCollapsed ? "mx-auto" : "mr-3"}`}>
                  <IoPersonAddSharp className="size-6" />
                </div>
                {!isCollapsed && <li className="text-sm">দায়ী এড করা</li>}
              </Link>
            )}
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
