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
import { PiMosqueDuotone } from "react-icons/pi";
import { TbReport } from "react-icons/tb";


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
    "markazadmin",
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

  // Pending counts (admin): leaves from API, edit-requests from localStorage
  const [pendingLeaveCount, setPendingLeaveCount] = useState<number>(0);
  const [pendingEditCount, setPendingEditCount] = useState<number>(0);

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

  useEffect(() => {
    if (!isAdmin) return;
    fetchPendingLeaveCount();
    fetchPendingEditCount();
    const interval = setInterval(() => {
      fetchPendingLeaveCount();
      fetchPendingEditCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

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
    // {
    //   title: t("kargojariSubject"),
    //   icon: <TbReport className="size-5" />,
    //   url: "/dashboard/kargojari",
    // },
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
      notificationCount: pendingLeaveCount,
      showNotification: true,
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
      notificationCount: pendingEditCount,
      showNotification: true,
    },{
      url: "/admin/markaz",
      icon: <PiMosqueDuotone className="size-5" />,
      title: t("markaz"),
    }

  ];

  return (
    <nav className="grow space-y-2 overflow-y-auto p-6 font-tiro">
      {!isMobile && (
        <div className="mb-6 ">
          <Image
            src="/logo_img.png"
            alt="Logo"
            width={85}
            height={85}
            className="object-contain rounded-xl"
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