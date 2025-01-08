import { LayoutGrid } from "lucide-react";
import MenuItem from "./menu-item";

const SidebarMenu = () => {
  const menuList = [
    {
      title: "Dashboard",
      icon: <LayoutGrid className="icon" />,
      url: "/dashboard",
    },
  ];

  return (
    <nav className="grow space-y-1.5 overflow-y-auto p-6">
      {menuList.map((menu, index) => {
        return <MenuItem key={index} {...menu} />;
      })}
    </nav>
  );
};

export default SidebarMenu;
