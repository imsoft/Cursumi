"use client";

interface AvatarProps {
  children: React.ReactNode;
  className?: string;
}

export const Avatar = ({ children, className }: AvatarProps) => {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary overflow-hidden ${className ?? "h-12 w-12"}`}
    >
      {children}
    </div>
  );
};

