"use client";

// import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { Button } from "@/components/ui/button";
import { ChevronDown, LogOut, Menu, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/providers/sidebar-provider";
import { signOut, useSession } from "@/lib/auth-client";
import "moment-hijri";
import { useRouter } from "next/navigation";
import moment from "moment-hijri";
import Link from "next/link";

const Header = () => {
  const router = useRouter();
  const session = useSession();
  const { toggleSidebar } = useSidebar();
  const userRole = session.data?.user?.role;

  moment.locale("bn");
  const hijriDate = moment().format("iD");

  const today = new Date();

  const day = String(today.getDate()).padStart(2, "0"); // Adds leading zero if necessary
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = today.getFullYear();

  const formattedDate = `${day}-${month}-${year}`;

  return (
    <header className="flex h-20 bg-[#155E75] text-white shrink-0 items-center justify-between border-b px-6">
      <Button onClick={toggleSidebar} size="icon" variant="secondary">
        <Menu />
      </Button>

      <div>
        {/* <p>Islami Dawa Institute</p> */}
        {/* Title Section */}
        <div className="flex flex-col justify-center items-center col-span-8 space-y-1">
          <h1 className="text-[10px] lg:text-xl font-semibold leading-tight text-center">
            ইসলামি দাওয়াহ ইনস্টিটিউট বাংলাদেশ
          </h1>
          <div className="text-[8px] md:text-lg">
            দাওয়াতি বছর ({formattedDate}) ইং /
            {moment().subtract(1, "day").format(" iD iMMMM iYYYY")} হিজ
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* <ThemeSwitcher /> */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
              <Avatar>
                <AvatarImage
                  src="https://i.pravatar.cc/40?img=12"
                  alt="Profile image"
                />
                <AvatarFallback>T</AvatarFallback>
              </Avatar>
              <ChevronDown className="opacity-60" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-w-64">
            <DropdownMenuLabel className="flex min-w-0 flex-col">
              <span className="truncate text-md font-bold text-foreground">
                {session.data?.user?.name}
              </span>
              <span className="truncate text-sm font-medium text-foreground">
                {session.data?.user?.role}
              </span>
              <span className="truncate text-xs font-light text-muted-foreground">
                {session.data?.user?.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href={
                    userRole === "daye"
                      ? "/dashboard/profile"
                      : "/admin/profile"
                  }
                >
                  <UserRound className="opacity-60" aria-hidden="true" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        router.replace("/");
                        router.refresh();
                      },
                    },
                  });
                }}
              >
                <LogOut className="opacity-60" aria-hidden="true" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
