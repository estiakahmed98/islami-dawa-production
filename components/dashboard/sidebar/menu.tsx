
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; // Import useRouter and usePathname for navigation
import MenuItem from "./menu-item";

// Importing React icons
import { LuLayoutDashboard } from "react-icons/lu";
import { FaRegFileAlt, FaRegHandshake, FaUsers, FaQuran } from "react-icons/fa";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { FcLeave } from "react-icons/fc";
import {
  MdOutlinePeopleAlt,
  MdOutlineMosque,
  MdOutlineTravelExplore,
} from "react-icons/md";
import { BsMoonStars } from "react-icons/bs";
import Image from "next/image";
import { useSidebar } from "@/providers/sidebar-provider";
import { GrSchedules } from "react-icons/gr";
import { useSession } from "@/lib/auth-client";

const SidebarMenu = () => {
  const router = useRouter(); // Router instance for navigation
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const { isMobile } = useSidebar();

  // Admin role list
  const adminRoles = [
    "centraladmin",
    "superadmin",
    "divisionadmin",
    "districtadmin",
    "areaadmin",
    "upozilaadmin",
    "unionadmin",
  ];

  // Check if user role is in the admin role list
  const isAdmin = adminRoles.includes(userRole as string);

  // Get the current route
  const currentRoute = usePathname();

  // State to toggle between User Mode and Admin Mode
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [buttText, setButtonText] = useState<String>("");

  // Initialize the mode based on the current route (only on first render)
  useEffect(() => {
    if (currentRoute === "/admin") {
      setIsAdminMode(true);
      setButtonText("Goto User Mode") // Set Admin Mode when on "/admin"
    } else if (currentRoute === "/dashboard") {
      setIsAdminMode(false);
      setButtonText("Goto Admin Mode") // Set User Mode when on "/dashboard"
    }
  }, [currentRoute]);

  const handleModeToggle = () => {
    const newMode = !isAdminMode;
    setIsAdminMode(newMode);
    router.push(newMode ? "/admin" : "/dashboard");
  };

  const menuList = [
    {
      title: "ড্যাশবোর্ড",
      icon: <LuLayoutDashboard className="size-5" />,
      url: "/dashboard",
    },
    {
      title: "আ’মলি মুহাসাবা",
      icon: <FaRegFileAlt className="size-5" />,
      url: "/dashboard/amoli-muhasaba",
    },
    {
      title: "মক্তব বিষয়",
      icon: <LiaChalkboardTeacherSolid className="size-5" />,
      url: "/dashboard/moktob",
    },
    {
      title: "তালিম বিষয়",
      icon: <FaQuran className="size-5" />,
      url: "/dashboard/talim",
    },
    {
      title: "দায়ী বিষয়",
      icon: <MdOutlinePeopleAlt className="size-5" />,
      url: "/dashboard/dayi",
    },
    {
      title: "দাওয়াতি বিষয়",
      icon: <FaRegHandshake className="size-5" />,
      url: "/dashboard/dawati",
    },
    {
      title: "দাওয়াতি মজলিশ",
      icon: <FaUsers className="size-5" />,
      url: "/dashboard/dawati-mojlis",
    },
    {
      title: "জামাত বিষয়",
      icon: <MdOutlineMosque className="size-5" />,
      url: "/dashboard/jamat",
    },
    {
      title: "দ্বীনে ফিরে এসেছে",
      icon: <BsMoonStars className="size-5" />,
      url: "/dashboard/dine-fera",
    },
    {
      title: "সফর বিষয়",
      icon: <MdOutlineTravelExplore className="size-5" />,
      url: "/dashboard/sofor",
    },
    {
      title: "ছুটি বিষয়",
      icon: <FcLeave className="size-5" />,
      url: "/dashboard/leave",
    },
    {
      title: "কর্সূমচী",
      icon: <GrSchedules className="size-5" />,
      url: "/dashboard/todo",
    },
  ];

  return (
    <nav className="grow space-y-2 overflow-y-auto p-6">
      {!isMobile && (
        <div className="mb-6">
          <Image
            src="/logo_img.png"
            alt="Logo"
            width={85}
            height={85}
            className="object-contain"
          />
        </div>
      )}

      {/* Toggle Button for Admin Roles */}
      {isAdmin && (
        <div className="flex justify-start mb-8">
          <button
            className={`px-4 py-2 rounded-xl text-white transition-all duration-300 ${
              isAdminMode
                ? "bg-lime-700 hover:bg-lime-600"
                : "bg-blue-700 hover:bg-blue-600"
            }`}
            onClick={handleModeToggle}
          >
            {buttText}
          </button>
        </div>
      )}

      {/* Menu List */}
      {menuList.map((menu, index) => (
        <MenuItem key={index} {...menu} />
      ))}
    </nav>
  );
};

export default SidebarMenu;
