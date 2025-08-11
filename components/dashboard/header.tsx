// "use client";

// // import { ThemeSwitcher } from "@/components/ui/theme-switcher";
// import { Button } from "@/components/ui/button";
// import { ChevronDown, LogOut, Menu, UserRound } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { useSidebar } from "@/providers/sidebar-provider";
// import { signOut, useSession } from "@/lib/auth-client";
// import "moment-hijri";
// import { useRouter } from "next/navigation";
// import moment from "moment-hijri";
// import Link from "next/link";

// const Header = () => {
//   const router = useRouter();
//   const session = useSession();
//   const { toggleSidebar } = useSidebar();
//   const userRole = session.data?.user?.role;

//   moment.locale("bn");
//   const hijriDate = moment().format("iD");

//   const today = new Date();

//   const day = String(today.getDate()).padStart(2, "0"); // Adds leading zero if necessary
//   const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
//   const year = today.getFullYear();

//   const formattedDate = `${day}-${month}-${year}`;

//   return (
//     <header className="flex h-20 bg-[#155E75] text-white shrink-0 items-center justify-between border-b px-6">
//       <Button onClick={toggleSidebar} size="icon" variant="secondary">
//         <Menu />
//       </Button>

//       <div>
//         {/* <p>Islami Dawa Institute</p> */}
//         {/* Title Section */}
//         <div className="flex flex-col justify-center items-center col-span-8 space-y-1">
//           <h1 className="text-[10px] lg:text-xl font-semibold leading-tight text-center">
//             ইসলামি দাওয়াহ ইনস্টিটিউট বাংলাদেশ
//           </h1>
//           <div className="text-[8px] md:text-lg">
//             দাওয়াতি বছর ({formattedDate}) ইং /
//             {moment().subtract(1, "day").format(" iD iMMMM iYYYY")} হিজ
//           </div>
//         </div>
//       </div>
//       <div className="flex items-center gap-4">
//         {/* <ThemeSwitcher /> */}
//         <DropdownMenu modal={false}>
//           <DropdownMenuTrigger asChild>
//             <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
//               <Avatar>
//                 <AvatarImage
//                   src="https://i.pravatar.cc/40?img=12"
//                   alt="Profile image"
//                 />
//                 <AvatarFallback>T</AvatarFallback>
//               </Avatar>
//               <ChevronDown className="opacity-60" aria-hidden="true" />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end" className="max-w-64">
//             <DropdownMenuLabel className="flex min-w-0 flex-col">
//               <span className="truncate text-md font-bold text-foreground">
//                 {session.data?.user?.name}
//               </span>
//               <span className="truncate text-sm font-medium text-foreground">
//                 {session.data?.user?.role}
//               </span>
//               <span className="truncate text-xs font-light text-muted-foreground">
//                 {session.data?.user?.email}
//               </span>
//             </DropdownMenuLabel>
//             <DropdownMenuSeparator />
//             <DropdownMenuGroup>
//               <DropdownMenuItem asChild>
//                 <Link
//                   href={
//                     userRole === "daye"
//                       ? "/dashboard/profile"
//                       : "/admin/profile"
//                   }
//                 >
//                   <UserRound className="opacity-60" aria-hidden="true" />
//                   <span>Profile</span>
//                 </Link>
//               </DropdownMenuItem>
//               <DropdownMenuItem
//                 onClick={() => {
//                   signOut({
//                     fetchOptions: {
//                       onSuccess: () => {
//                         router.replace("/");
//                         router.refresh();
//                       },
//                     },
//                   });
//                 }}
//               >
//                 <LogOut className="opacity-60" aria-hidden="true" />
//                 <span>Logout</span>
//               </DropdownMenuItem>
//             </DropdownMenuGroup>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>
//     </header>
//   );
// };

// export default Header;






// "use client";

// import { Button } from "@/components/ui/button";
// import { ChevronDown, LogOut, Menu, UserRound } from "lucide-react";
// import {
//   Avatar,
//   AvatarFallback,
//   AvatarImage,
// } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { useSidebar } from "@/providers/sidebar-provider";
// import { signOut, useSession } from "@/lib/auth-client";
// import dynamic from "next/dynamic";
// import Link from "next/link";
// import { useEffect, useMemo, useState } from "react";
// import moment from "moment-hijri";
// import { useRouter } from "next/navigation";

// // If you keep a theme switcher, bring it back later with dynamic ssr:false
// const ThemeSwitcher = dynamic(() => import("@/components/ui/theme-switcher").catch(() => null), { ssr: false });

// /** Get initials from name/email */
// function getInitials(name?: string | null, email?: string | null) {
//   if (name && name.trim()) {
//     const parts = name.trim().split(/\s+/);
//     const first = parts[0]?.[0] ?? "";
//     const last = parts[parts.length - 1]?.[0] ?? "";
//     return (first + last).toUpperCase();
//   }
//   if (email) return email[0]?.toUpperCase() ?? "U";
//   return "U";
// }

// const Header = () => {
//   const router = useRouter();
//   const { data: session } = useSession();
//   const { toggleSidebar } = useSidebar();
//   const userRole = session?.user?.role;

//   // ---- Hydration-safe dates ----
//   const [mounted, setMounted] = useState(false);
//   const [gregorian, setGregorian] = useState<string>("");
//   const [hijri, setHijri] = useState<string>("");

//   useEffect(() => {
//     setMounted(true);
//     moment.locale("bn");
//     const today = new Date();
//     const gDay = String(today.getDate()).padStart(2, "0");
//     const gMonth = String(today.getMonth() + 1).padStart(2, "0");
//     const gYear = today.getFullYear();
//     setGregorian(`${gDay}-${gMonth}-${gYear}`);

//     // your original used previous Hijri day
//     setHijri(moment().subtract(1, "day").format(" iD iMMMM iYYYY"));
//   }, []);

//   const initials = useMemo(
//     () => getInitials(session?.user?.name, session?.user?.email),
//     [session?.user?.name, session?.user?.email],
//   );

//   const profileHref =
//     userRole === "daye" ? "/dashboard/profile" : "/admin/profile";

//   return (
//     <header
//       className="
//         sticky top-0 z-40
//         flex h-20 shrink-0 items-center justify-between
//         bg-gradient-to-r from-[#0f4f60] via-[#155E75] to-[#1b809b]
//         text-white border-b border-white/10 px-4 md:px-6
//         shadow-sm
//       "
//       data-gramm="false"
//       data-gramm_editor="false"
//     >
//       {/* Left: sidebar toggle */}
//       <div className="flex items-center gap-2">
//         <Button
//           onClick={toggleSidebar}
//           size="icon"
//           variant="secondary"
//           className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10"
//           aria-label="Toggle sidebar"
//         >
//           <Menu className="h-5 w-5" />
//         </Button>

//         {/* Optional: Theme switcher */}
//         {/* {ThemeSwitcher ? <ThemeSwitcher /> : null} */}
//       </div>

//       {/* Center: title + dates */}
//       <div className="flex flex-col items-center justify-center text-center leading-tight">
//         <h1 className="text-sm md:text-lg font-semibold tracking-wide">
//           ইসলামি দাওয়াহ ইনস্টিটিউট বাংলাদেশ
//         </h1>

//         {/* Use suppressHydrationWarning to be extra-safe for tiny text nodes */}
//         <div
//           className="text-[10px] md:text-sm/5 text-white/90"
//           suppressHydrationWarning
//         >
//           দাওয়াতি বছর ({mounted ? gregorian : "—"}) ইং /
//           {mounted ? ` ${hijri}` : " —"} হিজ
//         </div>
//       </div>

//       {/* Right: user menu */}
//       <div className="flex items-center gap-2 md:gap-4">
//         <DropdownMenu modal={false}>
//           <DropdownMenuTrigger asChild>
//             <Button
//               variant="ghost"
//               className="h-auto p-0 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-white/40"
//               aria-label="Open account menu"
//             >
//               <div className="flex items-center gap-2">
//                 <Avatar className="h-10 w-10 ring-1 ring-white/20 shadow-sm">
//                   <AvatarImage
//                     src={session?.user?.image ?? undefined}
//                     alt={session?.user?.name ?? "Profile"}
//                   />
//                   <AvatarFallback className="bg-gradient-to-br from-teal-600 to-cyan-600 text-white text-sm">
//                     {session?.user?.name ? initials : <UserRound className="h-5 w-5" />}
//                   </AvatarFallback>
//                 </Avatar>
//                 <ChevronDown className="opacity-80 h-4 w-4" aria-hidden="true" />
//               </div>
//             </Button>
//           </DropdownMenuTrigger>

//           <DropdownMenuContent
//             align="end"
//             className="max-w-72 rounded-xl shadow-lg"
//           >
//             <DropdownMenuLabel className="flex min-w-0 flex-col">
//               <span className="truncate text-base font-semibold text-foreground">
//                 {session?.user?.name ?? "User"}
//               </span>
//               {session?.user?.role ? (
//                 <span className="inline-flex w-max items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
//                   {session.user.role}
//                 </span>
//               ) : null}
//               <span className="truncate text-xs text-muted-foreground">
//                 {session?.user?.email ?? ""}
//               </span>
//             </DropdownMenuLabel>

//             <DropdownMenuSeparator />

//             <DropdownMenuGroup>
//               <DropdownMenuItem asChild>
//                 <Link href={profileHref} className="cursor-pointer">
//                   <UserRound className="opacity-70 mr-2 h-4 w-4" aria-hidden="true" />
//                   <span>Profile</span>
//                 </Link>
//               </DropdownMenuItem>

//               <DropdownMenuItem
//                 onClick={() => {
//                   signOut({
//                     fetchOptions: {
//                       onSuccess: () => {
//                         router.replace("/");
//                         router.refresh();
//                       },
//                     },
//                   });
//                 }}
//                 className="text-red-600 focus:text-red-700"
//               >
//                 <LogOut className="opacity-70 mr-2 h-4 w-4" aria-hidden="true" />
//                 <span>Logout</span>
//               </DropdownMenuItem>
//             </DropdownMenuGroup>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>
//     </header>
//   );
// };

// export default Header;






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
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>


      {/* Center: Title + Dates */}
      <div className="flex flex-col items-center text-center leading-tight">
        <h1 className="text-sm md:text-lg font-semibold tracking-wide">
          ইসলামি দাওয়াহ ইনস্টিটিউট বাংলাদেশ
        </h1>
        <div className="text-[10px] md:text-sm/5 text-white/90" suppressHydrationWarning>
          দাওয়াতি বছর ({mounted ? gregorian : "—"}) ইং /
          {mounted ? ` ${hijri}` : " —"} হিজ
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
            aria-label="Open account menu"
          >
            {/* Gradient ring wrapper for a nicer look */}
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
                alt={session?.user?.name ?? "Profile"}
              />
              <AvatarFallback className="bg-gradient-to-br from-teal-600 to-cyan-600 text-white text-sm font-semibold">
                {initials || <UserRound className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            {/* Status dot (optional) */}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#155E75]" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="max-w-72 rounded-xl shadow-lg">
          <DropdownMenuLabel className="flex min-w-0 flex-col">
            <span className="truncate text-base font-semibold text-foreground">
              {session?.user?.name ?? "User"}
            </span>
            {session?.user?.role ? (
              <span className="inline-flex w-max items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                {session.user.role}
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
              className="text-red-600 focus:text-red-700"
            >
              <LogOut className="opacity-70 mr-2 h-4 w-4" aria-hidden="true" />
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
