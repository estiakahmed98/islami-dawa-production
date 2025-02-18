import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import MenuItem from "./menu-item";

// Importing React icons
import { LuLayoutDashboard } from "react-icons/lu";
import { FaRegFileAlt, FaRegHandshake, FaUsers, FaQuran, FaTree } from "react-icons/fa";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { FcAcceptDatabase, FcLeave } from "react-icons/fc";
import {
  MdOutlinePeopleAlt,
  MdOutlineMosque,
  MdOutlineTravelExplore,
  MdPeople,
} from "react-icons/md";
import { BsMoonStars } from "react-icons/bs";
import Image from "next/image";
import { useSidebar } from "@/providers/sidebar-provider";
import { GrSchedules } from "react-icons/gr";
import { useSession } from "@/lib/auth-client";
import { IoPersonAddSharp } from "react-icons/io5";
import MuiTreeView from "@/components/MuiTreeView";

const SidebarMenu = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const userEmail = session?.user?.email || "";

  const { isMobile } = useSidebar();

  // Define admin roles
  const adminRoles = [
    "centraladmin",
    "superadmin",
    "divisionadmin",
    "districtadmin",
    "areaadmin",
    "upozilaadmin",
    "unionadmin",
  ];

  const isAdmin = adminRoles.includes(userRole as string);
  const currentRoute = usePathname();

  // Admin routes list
  const adminRoutes = ["/admin", "/admin/users", "/admin/register", "/admin/notification"];
  const userRoutes = ["/dashboard", "/dashboard/amoli-muhasaba", "/dashboard/*"];

  // State for admin/user mode and button text
  // const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  // const [buttText, setButtonText] = useState<string>("");
  const [isAdminMode, setIsAdminMode] = useState<boolean>(adminRoutes.includes(currentRoute));
  const [buttText, setButtonText] = useState<string>(isAdmin ? "Goto User Mode" : "Goto Admin Mode");

  // Initialize mode based on current route
  useEffect(() => {
    if (adminRoutes.includes(currentRoute)) {
      setIsAdminMode(true);
      setButtonText("Goto User Mode");
    } else if (userRoutes.some(route => currentRoute.startsWith(route))) {
      setIsAdminMode(false);
      setButtonText("Goto Admin Mode");
    }
  }, [currentRoute]);

  // Handle mode toggle with immediate text update
  const handleModeToggle = () => {
    const newMode = !isAdminMode;
    setIsAdminMode(newMode);
    setButtonText(newMode ? "Goto User Mode" : "Goto Admin Mode");
    router.push(newMode ? "/admin" : "/dashboard");
  };

  // Ensure `userName` updates reactively
  const [userName, setUserName] = useState<string>(userEmail);
  useEffect(() => {
    setUserName(userEmail);
  }, [userEmail]);

  const menuList = [
    {
      title: `ড্যাশবোর্ড (${session?.user?.role || "No Role"})`,
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
      title: "কর্মসূচি",
      icon: <GrSchedules className="size-5" />,
      url: "/dashboard/calendar",
    },
  ];

  const adminMenuList = [
    {
      url: "/admin",
      icon: <LuLayoutDashboard className="size-6" />,
      title: `ড্যাশবোর্ড (${session?.user?.role || "No Role"})`,
    },
    {
      url: "/admin/register",
      icon: <IoPersonAddSharp className="size-6" />,
      title: "দায়ী এড করা",
    },
    {
      url: "/admin/users",
      icon: <MdPeople className="size-6" />,
      title: "দায়ী দেখুন",
    },
    {
      url: "/admin/notification",
      icon: <FcAcceptDatabase className="size-6" />,
      title: "অনুমতি দিন",
    },
    {
      url: "/admin/RealTree",
      icon: <FaTree className="size-6" />,
      title: "Real Tree",
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
      {isAdmin && !isMobile && (
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
      {!isAdmin &&
        menuList.map((menu, index) => <MenuItem key={index} {...menu} />)}

      {isAdmin &&
        !isMobile &&
        menuList.map((menu, index) => <MenuItem key={index} {...menu} />)}

      {isAdmin && isMobile && (
        <div className="flex justify-start mb-8">
          <button
            className={`px-4 py-2 rounded-xl text-white transition-all duration-300 ${
              isAdminMode
                ? "bg-lime-700 hover:bg-lime-600"
                : "bg-blue-700 hover:bg-blue-600"
            }`}
            onClick={() => {
              const newMode = !isAdminMode;
              setIsAdminMode(newMode);
              setButtonText(newMode ? "Goto User Mode" : "Goto Admin Mode"); // Toggle button text
            }}
          >
            {buttText}
          </button>
        </div>
      )}

      {isAdmin &&
        isMobile &&
        (isAdminMode ? (
          <>
            {adminMenuList.map((menu, index) => (
              <MenuItem key={index} {...menu} />
            ))}
            {userName && (
              <div className="mt-4 px-1 overflow-y-auto">
                <MuiTreeView />
              </div>
            )}
          </>
        ) : (
          menuList.map((menu, index) => <MenuItem key={index} {...menu} />)
        ))}
    </nav>
  );
};

export default SidebarMenu;
