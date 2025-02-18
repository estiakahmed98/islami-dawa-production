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
        <SheetContent className="bg-[#155E75]">
          <SheetHeader>
            <SheetTitle className="text-xl text-white font-medium">
              Islami Dawa
            </SheetTitle>
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
        "hidden bg-[#155E75] h-screen w-60 lg:w-72 shrink-0 flex-col border-r transition-[margin] duration-300 md:flex ",
        {
          "-ml-60 lg:-ml-72": state === "collapsed",
        }
      )}
    >
      <SidebarMenu />
    </aside>
  );
};

export default Sidebar;
