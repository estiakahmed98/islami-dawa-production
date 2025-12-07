"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import dynamic from "next/dynamic";
import { useSidebar } from "@/providers/sidebar-provider";
import { useEffect, useState } from "react";
import moment from "moment-hijri";
import LanguageSwitcher from "../language-switcher";
import { useTranslations } from "next-intl";

const HeaderMenu = dynamic(() => import("./HeaderMenu"), { ssr: false });

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

const Header = () => {
  const { toggleSidebar } = useSidebar();
  const t = useTranslations("header");
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

  // header no longer manages session or profile; HeaderMenu handles account menu client-side

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
        <div
          className="text-[10px] md:text-sm/5 text-white/90"
          suppressHydrationWarning
        >
          {t("dawahYear")} ({mounted ? gregorian : "—"}) {t("gregorian")} /
          {mounted ? ` ${hijri}` : " —"} {t("hijri")}
        </div>
      </div>

      <div className="flex gap-5">
        <LanguageSwitcher />
        {/* Right: Account menu (client-only) */}
        <HeaderMenu />
      </div>
    </header>
  );
};

export default Header;
