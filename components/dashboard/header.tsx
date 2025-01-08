"use client";

import { ThemeSwitcher } from "@/components/ui/theme-switcher";
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

const Header = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 dark:bg-slate-900">
      <Button onClick={toggleSidebar} size="icon" variant="secondary">
        <Menu />
      </Button>
      <div className="flex items-center gap-4">
        <ThemeSwitcher />
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
              <span className="truncate text-sm font-medium text-foreground">
                Mason Alex
              </span>
              <span className="truncate text-sm font-medium text-muted-foreground">
                mason@example.com
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserRound className="opacity-60" aria-hidden="true" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
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
