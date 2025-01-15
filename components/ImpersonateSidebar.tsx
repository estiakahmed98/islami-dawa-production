"use client";

import React, { useState, useEffect } from "react";
import SidebarAdmin from "./SidebarAdmin";
import Sidebar from "./dashboard/sidebar";
import TreeExample from "./SidebarAdmin";
// import OnItemClick from "./MuiTreeView";
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
import OnItemClick from "./MuiTreeView";

const ImpersonateSidebar: React.FC = () => {
  const [showUserSidebar, setShowUserSidebar] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string): boolean => pathname === path;

  const toggleView = (): void => {
    setShowUserSidebar(!showUserSidebar);
  };

  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    setUserName(userEmail || "");
  }, []);

  const allMenuItems = [
    {
      href: "/admin",
      icon: <LuLayoutDashboard />,
      label: "ড্যাশবোর্ড",
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
      href: "/admin/register",
      icon: <IoPersonAddSharp />,
      label: "দায়ী এড করা",
      roles: ["centraladmin"],
    },
    {
      href: "/admin/users",
      icon: <MdPeople />,
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
      icon: <FcAcceptDatabase />,
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

  const navigateToUserPage = (): void => {
    router.push("/admin/user");
  };

  return (
    <div className="flex h-screen">
      <div className="overflow-y-auto bg-sky-900">
        <div className="py-4 px-6">
          <div className="mb-4 flex justify-end">
            <button
              onClick={toggleView}
              className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 focus:outline-none"
            >
              {showUserSidebar ? "Go Admin Mode" : "Go User Mode"}
            </button>
          </div>

          <ul className="space-y-2">
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
                <div className="size-5">{icon}</div>
                <li className="text-sm">{label}</li>
              </Link>
            ))}
          </ul>
        </div>

        <div className="overflow-y-auto">
          {userName && (
            <OnItemClick
              loggedInUser={userName}
              onItemClick={navigateToUserPage}
            />
          )}
        </div>
      </div>

      <div>
        {showUserSidebar && (
          <div className="transition-all duration-500">
            <Sidebar />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImpersonateSidebar;
