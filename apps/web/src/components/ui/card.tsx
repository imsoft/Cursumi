import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

const Card = ({ className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        className,
      )}
      {...props}
    />
  );
};

const CardHeader = ({ className, ...props }: CardProps) => {
  return (
    <div className={cn("flex flex-col gap-1 p-6 pt-4", className)} style={{ listStyle: "none" }} {...props} />
  );
};

const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3
      className={cn("text-lg font-semibold leading-tight text-foreground", className)}
      {...props}
    />
  );
};

const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
};

const CardContent = ({ className, ...props }: CardProps) => {
  return (
    <div className={cn("p-6 pt-0", className)} {...props} />
  );
};

const CardFooter = ({ className, ...props }: CardProps) => {
  return (
    <div
      className={cn("flex flex-wrap items-center justify-between gap-3 border-t border-border/70 px-6 py-4", className)}
      {...props}
    />
  );
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };

