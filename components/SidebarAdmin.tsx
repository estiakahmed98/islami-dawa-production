"use client";
import React, { useEffect, useState } from "react";
import { IoPersonAddSharp } from "react-icons/io5";
import { MdPeople } from "react-icons/md";
import { FcAcceptDatabase } from "react-icons/fc";
import {
  LuArrowLeftFromLine,
  LuArrowRightToLine,
  LuLayoutDashboard,
} from "react-icons/lu";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SidebarAdmin = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState(null); // Store user role
  const pathname = usePathname(); // Get the current route

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser && storedUser.role) {
        setUserRole(storedUser.role);
      } else {
        setUserRole("guest"); // Default role for unauthenticated users
      }
    } catch (error) {
      console.error("Failed to parse user data:", error);
      setUserRole("guest");
    }
  }, []);

  const toggleMenu = () => setIsCollapsed(!isCollapsed);
  const isActive = (path) => pathname === path;

  // Define menu items with roles
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
      roles: ["centraladmin"], // Only visible to centraladmin
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

  // Filter menu items based on the user's role
  const filteredMenuItems = allMenuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <aside
      className={`flex flex-col ${
        isCollapsed ? "w-[68px]" : "w-52"
      } transition-width duration-500 h-screen border border-r border-[#0f3e4d] bg-[#155E75]`}
    >
      <div className="p-4 text-right">
        <button
          onClick={toggleMenu}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? "Expand menu" : "Collapse menu"}
          className="text-white focus:outline-none"
        >
          {isCollapsed ? (
            <LuArrowRightToLine className="size-6" />
          ) : (
            <LuArrowLeftFromLine className="size-6" />
          )}
        </button>
      </div>

      <nav className="p-4 grow overflow-y-auto">
        {userRole ? (
          <ul className="space-y-2">
            {filteredMenuItems.map(({ href, icon, label }) => (
              <Link
                href={href}
                key={href}
                className={`flex py-2 px-2 items-center font-medium ${
                  isCollapsed ? "gap-0" : "gap-3"
                } whitespace-nowrap ${
                  isActive(href)
                    ? "bg-cyan-600 rounded-md text-white"
                    : "hover:text-white text-white/80"
                }`}
                aria-current={isActive(href) ? "page" : undefined}
              >
                <div className="size-5">{icon}</div>
                <li className={`text-sm ${isCollapsed ? "hidden" : "block"}`}>
                  {label}
                </li>
              </Link>
            ))}
          </ul>
        ) : (
          <div className="text-white text-center">Loading...</div>
        )}
      </nav>
    </aside>
  );
};

export default SidebarAdmin;
