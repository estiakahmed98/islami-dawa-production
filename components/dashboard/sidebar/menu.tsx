// SidebarMenu.tsx
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
import useSWR from 'swr'; // Consider using SWR for better data fetching

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("bad status");
  return res.json();
};

const PUBLIC_ADMIN_ROUTES = ["/admin", "/admin/users", "/admin/register", "/admin/leave", "/admin/RealTree", "/admin/edit-request", "/admin/markaz"];

const SidebarMenu = () => {
  const t = useTranslations("dashboard.sideBar");
  const locale = useLocale();
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const userEmail = session?.user?.email || "";
  const { isMobile } = useSidebar();
  const isAdmin = ["centraladmin", "superadmin", "divisionadmin", "markazadmin"].includes(userRole as string);
  const currentPathname = usePathname();

  const [isAdminMode, setIsAdminMode] = useState(
    PUBLIC_ADMIN_ROUTES.some(route => currentPathname.startsWith(`/${locale}${route}`))
  );

  useEffect(() => {
    setIsAdminMode(PUBLIC_ADMIN_ROUTES.some(route => currentPathname.startsWith(`/${locale}${route}`)));
  }, [currentPathname, locale]);

  // Use SWR for fetching pending counts
  const { data: leaveData } = useSWR(
    isAdmin ? "/api/leaves?status=pending" : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  const pendingLeaveCount = leaveData?.leaveRequests?.length ?? 0;

  // Assuming you've moved edit requests to a server API
  const { data: editData } = useSWR(
    isAdmin ? "/api/edit-requests?status=pending" : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  const pendingEditCount = editData?.editRequests?.length ?? 0;

  const handleModeToggle = () => {
    const newMode = !isAdminMode;
    setIsAdminMode(newMode);
    const destination = newMode ? `/${locale}/admin` : `/${locale}/dashboard`;
    router.push(destination);
  };

  const menuList = [
    { title: t("dashBoard", { role: session?.user?.role || t("noRole") }), icon: <LuLayoutDashboard className="size-5" />, url: "/dashboard" },
    { title: t("amoliMuhasaba"), icon: <FaRegFileAlt className="size-5" />, url: "/dashboard/amoli-muhasaba" },
    { title: t("moktobSubject"), icon: <LiaChalkboardTeacherSolid className="size-5" />, url: "/dashboard/moktob" },
    { title: t("talimSubject"), icon: <FaQuran className="size-5" />, url: "/dashboard/talim" },
    { title: t("dayiSubject"), icon: <MdOutlinePeopleAlt className="size-5" />, url: "/dashboard/dayi" },
    { title: t("dawatiSubject"), icon: <FaRegHandshake className="size-5" />, url: "/dashboard/dawati" },
    { title: t("dawatiMojlish"), icon: <FaUsers className="size-5" />, url: "/dashboard/dawati-mojlish" },
    { title: t("jamatSubject"), icon: <MdOutlineMosque className="size-5" />, url: "/dashboard/jamat" },
    { title: t("dineFera"), icon: <BsMoonStars className="size-5" />, url: "/dashboard/dine-fera" },
    { title: t("soforSubject"), icon: <MdOutlineTravelExplore className="size-5" />, url: "/dashboard/sofor" },
    { title: t("leaveSubject"), icon: <FcLeave className="size-5" />, url: "/dashboard/leave" },
    { title: t("calendar"), icon: <GrSchedules className="size-5" />, url: "/dashboard/calendar" },
  ];

  const adminMenuList = [
    { url: "/admin", icon: <LuLayoutDashboard className="size-6" />, title: `${t("dashBoard")} (${session?.user?.role || t("noRole")})` },
    { url: "/admin/register", icon: <IoPersonAddSharp className="size-6" />, title: t("addDayi") },
    { url: "/admin/users", icon: <MdPeople className="size-6" />, title: t("viewDayi") },
    { url: "/admin/leave", icon: <FcAcceptDatabase className="size-6" />, title: t("leaveMatters"), notificationCount: pendingLeaveCount, showNotification: true },
    { url: "/admin/RealTree", icon: <FaTree className="size-6" />, title: t("realTree") },
    { url: "/admin/edit-request", icon: <FiEdit3 className="size-5" />, title: t("editRequest"), notificationCount: pendingEditCount, showNotification: true },
    { url: "/admin/markaz", icon: <PiMosqueDuotone className="size-5" />, title: t("markaz") },
  ];

  const currentMenuList = isAdminMode ? adminMenuList : menuList;

  return (
    <nav className="grow space-y-2 overflow-y-auto p-6 font-tiro">
      {!isMobile && (
        <div className="mb-6">
          <Image src="/logo_img.png" alt="Logo" width={85} height={85} className="object-contain" />
        </div>
      )}

      {isAdmin && (
        <div className="flex justify-start mb-8">
          <button
            className={`px-4 py-2 rounded-xl text-white transition-all duration-300 ${isAdminMode ? "bg-lime-700 hover:bg-lime-600" : "bg-blue-700 hover:bg-blue-600"}`}
            onClick={handleModeToggle}
          >
            {isAdminMode ? t("gotoUserMode") : t("gotoAdminMode")}
          </button>
        </div>
      )}

      {currentMenuList.map((menu, index) => <MenuItem key={index} {...menu} />)}

      {isAdminMode && userEmail && (
        <div className="mt-4 px-1 overflow-y-auto">
          <MuiTreeView />
        </div>
      )}
    </nav>
  );
};

export default SidebarMenu;