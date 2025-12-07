"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
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

function getInitials(name?: string | null, email?: string | null) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return (
      (parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")
    ).toUpperCase();
  }
  if (email && email.length) return email[0]!.toUpperCase();
  return "";
}

export default function HeaderMenu() {
  const t = useTranslations("header");
  const router = useRouter();
  const { data: session } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const initials = useMemo(
    () => getInitials(session?.user?.name, session?.user?.email),
    [session?.user?.name, session?.user?.email]
  );

  const profileHref = session?.user?.role === "daye" ? "/dashboard/profile" : "/admin/profile";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className={
            `
              relative inline-flex h-11 w-11 items-center justify-center rounded-full
              ring-2 ring-white/30 transition
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60
              group
            `
          }
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

      <DropdownMenuContent
        align="end"
        className="max-w-72 rounded-xl shadow-lg"
      >
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
              <UserRound
                className="opacity-70 mr-2 h-4 w-4"
                aria-hidden="true"
              />
              <span>{t("profile")}</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={async () => {
              if (isSigningOut) return;
              setIsSigningOut(true);
              try {
                await signOut({ redirect: false });
              } catch (err) {
                // ignore
              } finally {
                setIsSigningOut(false);
                router.replace("/");
              }
            }}
            disabled={isSigningOut}
            className="text-red-600 focus:text-red-700"
          >
            <LogOut
              className="opacity-70 mr-2 h-4 w-4"
              aria-hidden="true"
            />
            <span>{isSigningOut ? t("signingOut") : t("logout")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
