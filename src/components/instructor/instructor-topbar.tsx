"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

interface TopbarProps {
  onOpenSidebar: () => void;
  userName?: string;
  userInitials?: string;
  userImage?: string | null;
}

export const InstructorTopbar = ({ onOpenSidebar, userName, userInitials, userImage }: TopbarProps) => {
  const initials = userInitials ?? (userName?.[0]?.toUpperCase() ?? "I");

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:hidden">
      <Button variant="outline" size="sm" className="rounded-full" onClick={onOpenSidebar}>
        <Menu className="h-4 w-4" />
      </Button>
      <div>
        <p className="text-sm font-semibold text-muted-foreground">Panel de instructor</p>
        <p className="text-base font-semibold">{userName ?? "Instructor"}</p>
      </div>
      <Avatar className="h-9 w-9 text-sm font-semibold" src={userImage} alt={userName ?? "Instructor"}>
        <span>{initials}</span>
      </Avatar>
    </header>
  );
};
