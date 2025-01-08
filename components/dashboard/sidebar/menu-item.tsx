import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { memo } from "react";

type MenuItemProps = {
  icon: React.ReactNode;
  title: string;
  url: string;
};

const MenuItem = ({ icon, title, url }: MenuItemProps) => {
  const pathName = usePathname();
  const active = pathName === url;

  return (
    <Link
      href={url}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-lg font-medium transition-colors",
        {
          "bg-secondary text-secondary-foreground": active,
          "text-secondary-foreground/70 hover:bg-secondary": !active,
        }
      )}
    >
      {icon}
      <span>{title}</span>
    </Link>
  );
};

export default memo(MenuItem);
