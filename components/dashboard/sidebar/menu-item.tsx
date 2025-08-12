import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { Bell } from "lucide-react";

type MenuItemProps = {
  icon: React.ReactNode;
  title: string;
  url: string;
  notificationCount?: number;
  showNotification?: boolean;
};

const MenuItem = ({ icon, title, url, notificationCount, showNotification }: MenuItemProps) => {
  const pathName = usePathname();
  const locale = useLocale();
  const localeUrl = `/${locale}${url}`;
  const isRootExactOnly = url === "/dashboard" || url === "/admin";
  const active = isRootExactOnly
    ? pathName === localeUrl
    : pathName === localeUrl || pathName.startsWith(`${localeUrl}/`);

  return (
    <Link
      href={localeUrl}
      className={cn(
        "flex items-center justify-between gap-2 rounded-md px-3 py-2 font-medium transition-colors",
        {
          "bg-cyan-600 text-white": active,
          "text-white/70 hover:text-white": !active,
        }
      )}
      aria-current={active ? "page" : undefined}
    >
      <span className="flex items-center gap-2">
        {icon}
        <span>{title}</span>
      </span>
      {showNotification && !!notificationCount && notificationCount > 0 && (
        <span className="relative inline-flex items-center">
          <Bell className="size-5 text-yellow-400" />
          <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {notificationCount > 99 ? "99+" : notificationCount}
          </span>
        </span>
      )}
    </Link>
  );
};

export default memo(MenuItem);
