"use client";

import * as React from "react";
import { useCallback, useEffect, useRef, useState, createContext, useContext } from "react";

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  className?: string;
  children: React.ReactNode;
  asChild?: boolean;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: "start" | "end" | "center";
  className?: string;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onSelect?: () => void;
  className?: string;
  asChild?: boolean;
}

const DropdownMenuContext = createContext<{
  open: boolean;
  setOpen: (value: boolean) => void;
} | null>(null);

export const DropdownMenu = ({ children }: DropdownMenuProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    },
    [ref],
  );

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div ref={ref} className="relative" data-open={open}>
      <DropdownMenuContext.Provider value={{ open, setOpen }}>
        {children}
      </DropdownMenuContext.Provider>
    </div>
  );
};

export const DropdownMenuTrigger = ({ children, className, asChild }: DropdownMenuTriggerProps) => {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    return null;
  }
  const { open, setOpen } = context;
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (event: React.MouseEvent) => {
        event.stopPropagation();
        setOpen(!open);
        (children.props as any)?.onClick?.(event);
      },
    } as any);
  }
  
  return (
    <button
      type="button"
      className={className}
      onClick={(event) => {
        event.stopPropagation();
        setOpen(!open);
      }}
    >
      {children}
    </button>
  );
};

export const DropdownMenuContent = ({ children, align = "end", className }: DropdownMenuContentProps) => {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    return null;
  }
  const { open } = context;
  if (!open) {
    return null;
  }
  const alignClass = align === "start" ? "left-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "right-0";
  return (
    <div className={`absolute ${alignClass} top-full mt-2 min-w-[180px] rounded-lg border border-border bg-card shadow-lg z-50 overflow-hidden ${className || ""}`}>
      <div className="py-1">
        {children}
      </div>
    </div>
  );
};

export const DropdownMenuItem = ({ children, onSelect, className, asChild }: DropdownMenuItemProps & { className?: string; asChild?: boolean }) => {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    return null;
  }
  const { setOpen } = context;
  const handleClick = () => {
    onSelect?.();
    setOpen(false);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: `block w-full px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted focus:bg-muted focus:outline-none ${(children.props as any)?.className || ""}`,
      onClick: (event: React.MouseEvent) => {
        handleClick();
        (children.props as any)?.onClick?.(event);
      },
    } as any);
  }

  return (
    <button
      type="button"
      className={`w-full px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted focus:bg-muted focus:outline-none ${className || ""}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

