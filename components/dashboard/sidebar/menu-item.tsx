import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { memo } from "react";

type MenuItemProps = {
  icon: React.ReactNode;
  title: string;
  url: string;
};

const MenuItem = ({ icon, title, url }: MenuItemProps) => {
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
        "flex items-center gap-2 rounded-md px-3 py-2 font-medium transition-colors",
        {
          "bg-cyan-600 text-white": active,
          "text-white/70 hover:text-white": !active,
        }
      )}
    >
      {icon}
      <span>{title}</span>
    </Link>
  );
};

export default memo(MenuItem);
