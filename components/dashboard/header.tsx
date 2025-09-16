"use client";

import { Button } from "@/components/ui/button";
import { LogOut, Menu, UserRound } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
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
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import moment from "moment-hijri";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "../language-switcher";
import { useTranslations } from "next-intl";

function getInitials(name?: string | null, email?: string | null) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")).toUpperCase();
  }
  if (email && email.length) return email[0]!.toUpperCase();
  return "";
}

const Header = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { toggleSidebar } = useSidebar();
  const userRole = session?.user?.role;
  const t = useTranslations("header");
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Hydration-safe date text
  const [mounted, setMounted] = useState(false);
  const [gregorian, setGregorian] = useState<string>("");
  const [hijri, setHijri] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    moment.locale("bn");
    const t = new Date();
    const g = `${String(t.getDate()).padStart(2, "0")}-${String(t.getMonth() + 1).padStart(2, "0")}-${t.getFullYear()}`;
    setGregorian(g);
    setHijri(moment().subtract(1, "day").format(" iD iMMMM iYYYY"));
  }, []);

  const initials = useMemo(
    () => getInitials(session?.user?.name, session?.user?.email),
    [session?.user?.name, session?.user?.email],
  );

  const profileHref = userRole === "daye" ? "/dashboard/profile" : "/admin/profile";

  return (
    <header
      className="
        sticky top-0 z-40 flex h-20 items-center justify-between
        bg-gradient-to-r from-[#0f4f60] via-[#155E75] to-[#1b809b]
        text-white border-b border-white/10 px-4 md:px-6 shadow-sm
      "
      data-gramm="false"
      data-gramm_editor="false"
    >
      {/* Left: Sidebar toggle */}
      <Button
        onClick={toggleSidebar}
        size="icon"
        variant="secondary"
        className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20"
        aria-label={t("toggleSidebar")}
      >
        <Menu className="h-5 w-5 text-white" />
      </Button>

      {/* Center: Title + Dates */}
      <div className="flex flex-col items-center text-center leading-tight">
        <h1 className="text-sm md:text-lg font-semibold tracking-wide">
          {t("instituteName")}
        </h1>
        <div className="text-[10px] md:text-sm/5 text-white/90" suppressHydrationWarning>
          {t("dawahYear")} ({mounted ? gregorian : "—"}) {t("gregorian")} /
          {mounted ? ` ${hijri}` : " —"} {t("hijri")}
        </div>
      </div>
      
      <div className="flex gap-5">
        <LanguageSwitcher/>
        {/* Right: Avatar = dropdown trigger */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              className="
                relative inline-flex h-11 w-11 items-center justify-center rounded-full
                ring-2 ring-white/30 transition
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60
                group
              "
              aria-label={t("openAccountMenu")}
            >
              <span
                className="
                  absolute -inset-[2px] rounded-full
                  bg-gradient-to-br from-teal-600/50 to-cyan-600/50
                  opacity-0 group-hover:opacity-100 transition pointer-events-none
                  blur-[2px]
                "
              />
              <Avatar className="relative h-10 w-10 ring-1 ring-white/30 shadow-sm">
                <AvatarImage
                  src={session?.user?.image ?? undefined}
                  alt={session?.user?.name ?? t("profile")}
                />
                <AvatarFallback className="bg-gradient-to-br from-teal-600 to-cyan-600 text-white text-sm font-semibold">
                  {initials || <UserRound className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#155E75]" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="max-w-72 rounded-xl shadow-lg">
            <DropdownMenuLabel className="flex min-w-0 flex-col">
              <span className="truncate text-base font-semibold text-foreground">
                {session?.user?.name ?? t("user")}
              </span>
              {session?.user?.role ? (
                <span className="inline-flex w-max items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  {t(`roles.${session.user.role}` as const)}
                </span>
              ) : null}
              <span className="truncate text-xs text-muted-foreground">
                {session?.user?.email ?? ""}
              </span>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
       
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href={profileHref} className="cursor-pointer">
                  <UserRound className="opacity-70 mr-2 h-4 w-4" aria-hidden="true" />
                  <span>{t("profile")}</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={async () => {
                  if (isSigningOut) return;
                  setIsSigningOut(true);
                  try {
                    // Let the auth library handle the navigation
                    await signOut({ redirect: true, callbackUrl: "/" });
                  } catch {
                    // Fallback to hard redirect if something goes wrong
                    window.location.href = "/";
                  }
                }}
                disabled={isSigningOut}
                className="text-red-600 focus:text-red-700"
              >
                <LogOut className="opacity-70 mr-2 h-4 w-4" aria-hidden="true" />
                <span>{isSigningOut ? t("signingOut") : t("logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;