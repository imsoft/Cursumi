"use client";

import * as React from "react";
import { useCallback, useEffect, useRef, useState, createContext, useContext } from "react";
import { createPortal } from "react-dom";

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

type ClickableElementProps = {
  onClick?: (event: React.MouseEvent) => void;
  className?: string;
};

type ClickableElement = React.ReactElement<ClickableElementProps>;

const DropdownMenuContext = createContext<{
  open: boolean;
  setOpen: (value: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
} | null>(null);

export const DropdownMenu = ({ children }: DropdownMenuProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    },
    [],
  );

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div ref={containerRef} className="relative" data-open={open}>
      <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
        {children}
      </DropdownMenuContext.Provider>
    </div>
  );
};

function mergeRefs<T>(
  targetRef: React.MutableRefObject<T | null>,
  originalRef: React.Ref<T> | undefined,
) {
  return (node: T | null) => {
    targetRef.current = node;
    if (typeof originalRef === "function") {
      originalRef(node);
    } else if (originalRef && typeof originalRef === "object" && "current" in originalRef) {
      (originalRef as React.MutableRefObject<T | null>).current = node;
    }
  };
}

export const DropdownMenuTrigger = ({ children, className, asChild }: DropdownMenuTriggerProps) => {
  const context = useContext(DropdownMenuContext);
  if (!context) return null;
  const { open, setOpen, triggerRef } = context;

  if (asChild && React.isValidElement(children)) {
    const child = children as ClickableElement & { ref?: React.Ref<HTMLElement> };
    return React.cloneElement(child, {
      ref: mergeRefs(triggerRef as React.MutableRefObject<HTMLElement | null>, child.ref),
      onClick: (event: React.MouseEvent) => {
        event.stopPropagation();
        setOpen(!open);
        child.props.onClick?.(event);
      },
    } as Partial<unknown>);
  }

  return (
    <button
      type="button"
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
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
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!context?.open || !context.triggerRef.current) return;
    const rect = context.triggerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + window.scrollY + 8,
      left: align === "start"
        ? rect.left + window.scrollX
        : align === "center"
          ? rect.left + window.scrollX + rect.width / 2
          : rect.right + window.scrollX,
    });
  }, [context?.open, align]);

  if (!context || !context.open || !mounted || !coords) return null;

  const transformOrigin =
    align === "start" ? "left" : align === "center" ? "center" : "right";
  const translateX =
    align === "start" ? "0" : align === "center" ? "-50%" : "-100%";

  return createPortal(
    <div
      style={{
        position: "absolute",
        top: coords.top,
        left: coords.left,
        transform: `translateX(${translateX})`,
        transformOrigin,
        zIndex: 9999,
      }}
      className={`min-w-[180px] rounded-lg border border-border bg-card shadow-lg overflow-hidden ${className || ""}`}
    >
      <div className="py-1">{children}</div>
    </div>,
    document.body,
  );
};

export const DropdownMenuItem = ({ children, onSelect, className, asChild }: DropdownMenuItemProps & { className?: string; asChild?: boolean }) => {
  const context = useContext(DropdownMenuContext);
  if (!context) return null;
  const { setOpen } = context;

  const handleClick = () => {
    onSelect?.();
    setOpen(false);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as ClickableElement;
    return React.cloneElement(child, {
      className: `block w-full px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted focus:bg-muted focus:outline-none ${child.props.className || ""}`,
      onClick: (event: React.MouseEvent) => {
        handleClick();
        child.props.onClick?.(event);
      },
    });
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
