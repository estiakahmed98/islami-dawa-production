"use client";

import { useSidebar } from "@/providers/sidebar-provider";
import SidebarMenu from "./menu";

import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const { state, isMobile, openMobile, setOpenMobile } = useSidebar();
  const pathName = usePathname();

  // Hide sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [pathName, isMobile, setOpenMobile]);

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="text-xl font-medium">Brand Logo</SheetTitle>
            <SheetClose asChild>
              <Button variant="outline" size="icon">
                <X />
                <span className="sr-only">Close</span>
              </Button>
            </SheetClose>
          </SheetHeader>
          <SheetDescription className="sr-only">
            Mobile sidebar navigation
          </SheetDescription>
          <SidebarMenu />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        "hidden bg-[#155E75] w-72 shrink-0 flex-col border-r transition-[margin] duration-300 md:flex dark:bg-slate-900",
        {
          "-ml-72": state === "collapsed",
        }
      )}
    >
      <SidebarMenu />
    </aside>
  );
};

export default Sidebar;
