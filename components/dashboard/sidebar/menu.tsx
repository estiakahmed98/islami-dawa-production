import MenuItem from "./menu-item";

// Importing React icons
import { LuLayoutDashboard } from "react-icons/lu";
import { FaRegFileAlt, FaRegHandshake, FaUsers } from "react-icons/fa";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { FaQuran } from "react-icons/fa";
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

const SidebarMenu = () => {
  const { isMobile } = useSidebar();
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
      {/* <hr /> */}
      {menuList.map((menu, index) => {
        return <MenuItem key={index} {...menu} />;
      })}
    </nav>
  );
};

export default SidebarMenu;
