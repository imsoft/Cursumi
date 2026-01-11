"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  onOpenSidebar: () => void;
}

export const InstructorTopbar = ({ onOpenSidebar }: TopbarProps) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:hidden">
      <Button variant="outline" size="sm" className="rounded-full" onClick={onOpenSidebar}>
        <Menu className="h-4 w-4" />
      </Button>
      <div>
        <p className="text-sm font-semibold text-muted-foreground">Panel de instructor</p>
        <p className="text-base font-semibold">Brandon</p>
      </div>
      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
        B
      </div>
    </header>
  );
};

