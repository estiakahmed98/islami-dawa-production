"use client"
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import MenuItem from "./menu-item";
import { LuLayoutDashboard } from "react-icons/lu";
import {
  FaRegFileAlt,
  FaRegHandshake,
  FaUsers,
  FaQuran,
  FaTree,
} from "react-icons/fa";
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
import { useLocale, useTranslations } from "next-intl";
import { FiEdit3 } from "react-icons/fi";

const SidebarMenu = () => {
  const t = useTranslations("dashboard.sideBar");
  const locale = useLocale();

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
  const adminRoutes = [
    "/admin",
    "/admin/users",
    "/admin/register",
    "/admin/leave",
  ];
  const userRoutes = [
    "/dashboard",
    "/dashboard/amoli-muhasaba",
    "/dashboard/*",
  ];
  const adminRoutesLocale = adminRoutes.map((p) => `/${locale}${p}`);
  const userRoutesLocale = userRoutes.map((p) => `/${locale}${p.replace("*", "")}`);

  const [isAdminMode, setIsAdminMode] = useState<boolean>(
    adminRoutesLocale.includes(currentRoute)
  );

  const [buttText, setButtonText] = useState<string>(
    isAdmin ? t("gotoUserMode") : t("gotoAdminMode")
  );

  // Initialize mode based on current route
  useEffect(() => {
    if (adminRoutesLocale.includes(currentRoute)) {
      setIsAdminMode(true);
      setButtonText(t("gotoUserMode"));
    } else if (userRoutesLocale.some((route) => currentRoute.startsWith(route))) {
      setIsAdminMode(false);
      setButtonText(t("gotoAdminMode"));
    }
  }, [currentRoute, t, locale]);

  // Handle mode toggle with immediate text update
  const handleModeToggle = () => {
    const newMode = !isAdminMode;
    setIsAdminMode(newMode);
    setButtonText(newMode ? t("gotoUserMode") : t("gotoAdminMode"));
    router.push(newMode ? `/${locale}/admin` : `/${locale}/dashboard`);
  };

  // Ensure `userName` updates reactively
  const [userName, setUserName] = useState<string>(userEmail);
  useEffect(() => {
    setUserName(userEmail);
  }, [userEmail]);

  
  const menuList = [
    {
      title: t("dashBoard", { role: session?.user?.role || t("noRole") }),
      icon: <LuLayoutDashboard className="size-5" />,
      url: "/dashboard",
    },
    {
      title: t("amoliMuhasaba"),
      icon: <FaRegFileAlt className="size-5" />,
      url: "/dashboard/amoli-muhasaba",
    },
    {
      title: t("moktobSubject"),
      icon: <LiaChalkboardTeacherSolid className="size-5" />,
      url: "/dashboard/moktob",
    },
    {
      title: t("talimSubject"),
      icon: <FaQuran className="size-5" />,
      url: "/dashboard/talim",
    },
    {
      title: t("dayiSubject"),
      icon: <MdOutlinePeopleAlt className="size-5" />,
      url: "/dashboard/dayi",
    },
    {
      title: t("dawatiSubject"),
      icon: <FaRegHandshake className="size-5" />,
      url: "/dashboard/dawati",
    },
    {
      title: t("dawatiMojlish"),
      icon: <FaUsers className="size-5" />,
      url: "/dashboard/dawati-mojlish",
    },
    {
      title: t("jamatSubject"),
      icon: <MdOutlineMosque className="size-5" />,
      url: "/dashboard/jamat",
    },
    {
      title: t("dineFera"),
      icon: <BsMoonStars className="size-5" />,
      url: "/dashboard/dine-fera",
    },
    {
      title: t("soforSubject"),
      icon: <MdOutlineTravelExplore className="size-5" />,
      url: "/dashboard/sofor",
    },
    {
      title: t("leaveSubject"),
      icon: <FcLeave className="size-5" />,
      url: "/dashboard/leave",
    },
    {
      title: t("calendar"),
      icon: <GrSchedules className="size-5" />,
      url: "/dashboard/calendar",
    },
  ];

  const adminMenuList = [
    {
      url: "/admin",
      icon: <LuLayoutDashboard className="size-6" />,
      title: `${t("dashBoard")} (${session?.user?.role || t("noRole")})`,
    },
    {
      url: "/admin/register",
      icon: <IoPersonAddSharp className="size-6" />,
      title: t("addDayi"),
    },
    {
      url: "/admin/users",
      icon: <MdPeople className="size-6" />,
      title: t("viewDayi"),
    },
    {
      url: "/admin/leave",
      icon: <FcAcceptDatabase className="size-6" />,
      title: t("leaveMatters"),
    },
    {
      url: "/admin/RealTree",
      icon: <FaTree className="size-6" />,
      title: t("realTree"),
    },
    {
      url: "/admin/edit-request",
      icon: <FiEdit3 className="size-5" />,
      title: t("editRequest"),
    }
  ];

  return (
    <nav className="grow space-y-2 overflow-y-auto p-6 font-tiro">
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
              setButtonText(newMode ? t("gotoUserMode") : t("gotoAdminMode"));
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